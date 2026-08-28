---
type: concept
title: "Lottery Ticket Hypothesis"
summary: "The Lottery Ticket Hypothesis (LTH) (Frankle & Carbin 2018, MIT, The Lottery Ticket Hypothesis: Finding Sparse, Trainable Neural Networks, ICLR 2019) posits that a dense, randomly-initialized feed-forward network…"
visibility: public
aliases:
  - "LTH"
  - "Winning Tickets"
  - "Sparse Trainable Subnetworks"
tags:
  - fine-tuning
  - llm-fundamentals
  - inference
created: 2026-08-25
updated: 2026-08-25
status: draft
sources:
  - "[[source-lottery-ticket-hypothesis]]"
  - "[[source-lora]]"
related:
  - "[[parameter-efficient-fine-tuning]]"
  - "[[lora]]"
  - "[[pretraining]]"
  - "[[inference]]"
  - "[[supervised-fine-tuning]]"
  - "[[transformer]]"
  - "[[scaling-laws]]"
---

# Lottery Ticket Hypothesis

## Overview
The **Lottery Ticket Hypothesis (LTH)** (Frankle & Carbin 2018, MIT, [[source-lottery-ticket-hypothesis]], ICLR 2019) posits that a dense, randomly-initialized feed-forward network contains a sparse subnetwork — a **winning ticket** — that when trained in isolation from its original initialization ($\mathbf{m}\odot\theta_0$) matches the original dense network's test accuracy in at most the same number of iterations. Winning tickets are found by **iterative magnitude pruning** (train → prune $p\%$ smallest magnitudes → reset to $\theta_0$, repeat) and are 10–20% of the original size (down to 1.5–3.6% with warmup) across Lenet/MNIST and Conv-2/4/6/VGG-19/Resnet-18/CIFAR10. When randomly reinitialized they train slower and worse, proving **initialization matters more than structure alone**. LTH provides the sparsity-based counterpart to [[lora]]'s low-rank hypothesis within [[parameter-efficient-fine-tuning]]: both exploit low intrinsic dimension, but LTH prunes weights while LoRA prunes rank.

## Key Ideas
- **Formal hypothesis**: For dense $f(x;\theta_0)$, $\theta_0\sim\mathcal{D}_\theta$ achieving $a$ at $j$ (min validation loss), $\exists$ mask $\mathbf{m}\in\{0,1\}^{|\theta|}$ with $\|\mathbf{m}\|_0 \ll |\theta|$ s.t. $f(x;\mathbf{m}\odot\theta_0)$ achieves $a'\ge a$ at $j'\le j$. Tickets won the "initialization lottery" (weights + connectivity amenable to SGD).
- **Identification algorithm** (§1, Fig.2): (1) random init, (2) train $j$ iters to $\theta_j$, (3) prune $p\%$ lowest magnitude per layer (or globally for deep nets, outputs half-rate), create mask $\mathbf{m}$, (4) reset survivors to $\theta_0$ → ticket. **Iterative** ($n$ rounds, each $p^{1/n}\%$) finds smaller tickets than **one-shot** (single train-prune). Early-stopping iteration (min validation loss) proxies speed; $P_m=\|\mathbf{m}\|_0/|\theta|$.
- **Lenet 300-100 MNIST** (Adam 1.2e-3, 50K, fc20%): iterative tickets learn 38% earlier at 21% size, +0.3pp at 13.5%, match original down to 3.6% (U-shaped **Occam's Hill**). Reinit baseline (orange, 15 trials) degrades monotonically, drops at 21.1% vs ticket at 2.9%; ticket 2.51× faster, +0.5pp at 21%; at 100% training accuracy ticks still generalize better (smaller train-test gap, Fig.4b,12). One-shot tickets larger (95→5% vs iterative to 3.6%).
- **Conv-2/4/6 CIFAR10** (Adam 2–3e-4, 20–30K, conv10–15% fc20%): more pronounced — 3.5× faster at 8.8%/9.2%, +3.4–3.5pp at 4.6%/11.1%, >2% still above original. Reinit initially steady/improve at moderate sparsity (structure helps), but later drops. **Dropout 0.5** complementary: baseline +2–3pp, tickets + additional 2.3–4.7pp (Fig.6).
- **Deeper nets — global pruning & LR sensitivity** (VGG-19 20M 112K, Resnet-18 270K 30K, SGD momentum 0.9, weight decay, batchnorm, augmentation): layerwise pruning fails (small layers bottleneck: 1728 vs 2.35M), **global pruning** (collective smallest across conv layers) needed (App.I.1). At original LR 0.1, no tickets (pruned ≈ reinit); lowering to 0.01 or **linear warmup** (0→0.1 over 10K/20K) recovers tickets: VGG warmup 0.1 tickets ≥1.5% exceed dense, Resnet warmup 0.03 tickets 11.8–27.1% reach 90.5% dense accuracy. Even then fails at 0.1 without warmup — early dynamics matter (later "rewinding" fix resets to early checkpoint not $\theta_0$).
- **Why initialization wins**: Ticket weights move *further* from $\theta_0$ than others (App.F.5) — not "already trained" but land in loss region amenable to optimizer/dataset/model. Structure encodes inductive bias (Cohen & Shashua analogy) customized via training data; tickets generalize better via compression (Rissanen, Zhou 2018 pruning bounds, Arora 2018 noise bounds). Reconciles Liu et al. 2019: up to 80% pruning structure alone suffices (overparameterized), beyond needs lottery.

## How It Works
```
Random init θ0 ~ Glorot/He (Gaussian)
    │
    ▼ Train f(x;θ) j iters → θj (SGD/Adam, momentum, dropout etc.)
    │
    ▼ Magnitude prune: smallest |θj| per layer (or global) → mask m, sparsity Pm
    │
    ▼ Reset: θ ← m ⊙ θ0  (winning ticket)  vs  m ⊙ θ0' random (control)
    │
    ▼ Retrain ticket in isolation
    │
Compare: j' vs j (early-stop), a' vs a, train vs test gap
    │
Iterate: repeat train-prune-reset n times for smaller Pm
    │
Even deeper: add warmup/LR schedule, global pruning for VGG/Resnet
```

Practical steps from paper: choose pruning rate (20% fc, 10% conv iterative), 5 trials for ticket, 15 for reinit (3 per ticket), evaluate at early-stop and at 100% training (generalization). For LLMs/transformers later, replace θ0 with early checkpoint (rewinding) and unstructured with structured/movement pruning (not in 2019 paper).

## Practical Implications
- **Training efficiency vision**: If tickets could be found early (SNIP/GraSP/early-bird, later lottery), training sparse from start could save FLOPs — original iterative cost negates savings (train n×), motivating early pruning research and **late rewinding** for LLMs (Frankle et al. 2020).
- **Inference efficiency**: Pruned tickets reduce storage/compute >90% without accuracy loss (Han 2015 inference goal) *and* if trainable from scratch enable deployment of sparse models without dense pretrain. Unstructured sparsity not GPU-efficient — motivates structured pruning, [[lora]]-style low-rank as hardware-friendly alternative (LoRA 0% latency via merge vs pruning CSR overhead).
- **Architecture/Initialization design**: Tickets reveal sparse architectures + inits adept at learning; inspiration for new sparse inits and transferable tickets across tasks (Cohen pooling geometry idea). Overparameterization helps because more lottery draws increase ticket probability — complements [[scaling-laws]] Chinchilla dense-optimal vs sparsity-optimal tradeoff and [[pretraining]] massive data/compute.
- **PEFT lineage**: LTH is precursor to [[parameter-efficient-fine-tuning]] family: adapters/prefix/LoRA also exploit low intrinsic dimension but via added modules/rank not weight removal. Choosing LoRA today over LTH reflects practicality: LoRA mergeable, rank $r=1$–$4$ suffices (LoRA paper §7), while LTH tickets at 10% still sparser but training-sensitive.
- **Sensitivity warning**: Finding tickets requires careful LR/warmup/global scheme at depth; don't expect lottery at standard high LR without warmup — use rewinding for transformers/LLMs.

## Connections
- Core instance of [[parameter-efficient-fine-tuning]] alongside [[lora]]/[[parameter-efficient-fine-tuning|PEFT]] (adapters, prefix) but via sparsity; LoRA's low-rank hypothesis mirrors LTH sparsity hypothesis (both cite Li 2018, Aghajanyan 2020 intrinsic dimension).
- Relies on [[pretraining]] random initialization (Glorot/He) as lottery draws; dense pretraining abundance enables ticket existence.
- Impacts [[inference]]: sparse tickets vs dense + LoRA merge tradeoff (latency, memory, throughput).
- Contrasts with [[supervised-fine-tuning]] full finetuning: SFT updates all weights, LTH shows 10% subset suffices if correctly initialized.
- Extends to [[transformer]] via later work (not in 2019 conv/FC experiments): BERT/GPT tickets require rewinding 1–2% of training.
- Occam's Hill links to generalization theory and [[evaluation]]: tickets sit at peak where complexity matches data, explaining +0.3–3.5pp gains despite 100% training accuracy.
- Historical note vs [[lora]] paper §7: LoRA shows $\Delta W$ amplifies non-dominant directions of $W$ — LTH tickets may encode similar task-specific subspace but via pruning.

## Open Questions
- Why does resetting to $\theta_0$ work for small nets but need rewinding to iteration $k$ for deep/LLM scale — what changes in early optimization?
- Can winning tickets be found without iterative train-prune loop (early pruning at init or early-bird) to achieve actual training savings?
- Does LTH hold for [[transformer]] at LLM scale (175B) with AdamW/cosine/128K vocab — early evidence suggests size-dependent lottery requires larger $P_m$?
- Are tickets transferable across tasks/datasets (vision→language) as initialization bias, or task-specific structure as paper hypothesizes?
- Structured vs unstructured: can hardware-efficient block sparsity or $N$:$M$ achieve same ticket quality as unstructured 90%?

## Sources
- [[source-lottery-ticket-hypothesis]]
- [[source-lora]]
- Classical refs: LeCun 1990 Optimal Brain Damage; Han et al. 2015 Deep Compression; Liu et al. 2019 Rethinking Pruning

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
