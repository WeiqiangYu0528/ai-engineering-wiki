---
type: source-summary
title: "The Lottery Ticket Hypothesis: Finding Sparse, Trainable Neural Networks"
summary: "Frankle & Carbin (MIT, arXiv 1803.03635v5, ICLR 2019) articulate the Lottery Ticket Hypothesis (LTH): dense, randomly-initialized feed-forward networks contain sparse subnetworks (winning tickets) that — when trained in…"
status: draft
visibility: public
author: "Jonathan Frankle, Michael Carbin (MIT CSAIL)"
source-type: paper
url: "https://arxiv.org/abs/1803.03635"
date-published: 2019-03-04
date-ingested: 2026-08-25
tags:
  - fine-tuning
  - llm-fundamentals
  - inference
key-concepts:
  - "[[lottery-ticket-hypothesis]]"
  - "[[parameter-efficient-fine-tuning]]"
  - "[[lora]]"
  - "[[pretraining]]"
  - "[[inference]]"
key-entities:
  - "[[openai]]"
aliases:
  - wiki/source-lottery-ticket-hypothesis
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Frankle &amp; Carbin (MIT, arXiv 1803.03635v5, ICLR 2019) articulate the Lottery Ticket Hypothesis (LTH): dense, randomly-initialized feed-forward networks contain sparse subnetworks (winning tickets) that — when trained in…</p>
<p class="kb-provenance">Jonathan Frankle, Michael Carbin (MIT CSAIL), 2019-03-04. <a href="https://arxiv.org/abs/1803.03635">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary
Frankle & Carbin (MIT, arXiv 1803.03635v5, ICLR 2019) articulate the **Lottery Ticket Hypothesis (LTH)**: dense, randomly-initialized feed-forward networks contain sparse subnetworks (winning tickets) that — when trained in isolation from their original initialization — match the original network's test accuracy in ≤ same iterations. Via iterative magnitude pruning (train → prune p% smallest magnitudes → reset remaining weights to θ0, repeat n times with p^(1/n)% per round), they find winning tickets of 10–20% size (down to 3.6% on Lenet, 1.5% on VGG with warmup) across Lenet/MNIST and Conv-2/4/6/VGG-19/Resnet-18/CIFAR10 that learn faster (up to 3.5× earlier early-stopping) and achieve higher test accuracy (+0.3–3.5pp) than the dense network, with better generalization (smaller train-test gap at 100% training accuracy). Crucially, tickets fail when randomly reinitialized (2.51× slower, -0.5pp at 21% on Lenet) proving initialization, not structure alone, matters; at moderate sparsity (≤80% on VGG) reinitialization matches (reconciling Liu et al. 2019), beyond which initialization dominates. Deeper nets require lower LR or warmup to find tickets, revealing sensitivity to early training dynamics.

## Key Takeaways
1. **Hypothesis formalized**: ∃ mask m with |m|0≪|θ| s.t. f(x; m⊙θ0) trained achieves a'≥a, j'≤j. Lottery metaphor: initialization lottery determines trainability over structure.
2. **Algorithm**: Standard small-magnitude unstructured pruning + unique resetting to θ0 (not keeping trained weights as Han 2015). Iterative pruning finds smaller tickets than one-shot (one-shot tickets higher but larger: 95→5% vs iterative down to 3.6% on Lenet; Figure 4c vs 4a).
3. **Lenet MNIST results (Adam 1.2e-3, 50K)**: Iterative pruning: early-stop 38% earlier at 21% size, +0.3pp at 13.5%; matches original down to 3.6%; U-shaped Occam's Hill (improves then degrades). Reinit baseline degrades monotonically, drops at 21.1% vs ticket at 2.9% (Figure 3-4).
4. **Conv-2/4/6 CIFAR10 more pronounced**: 3.5× faster at 8.8%/9.2%, +3.4–3.5pp at 4.6%/11.1%; >2% remains above original. Dropout (0.5) complementary: raises baseline 2–3pp and tickets add another 2.3–4.7pp (Figure 6).
5. **Deeper nets and global pruning**: VGG-19/Resnet-18 need global (not layerwise) pruning to avoid bottlenecks (1728 vs 2.35M params). Original LR 0.1 fails without warmup; lowering to 0.01 or warmup 10K–20K linear unlocks tickets (VGG tickets ≥1.5% with warmup 0.1, Resnet 11.8% at 0.03 warmup). Even then gap to high-LR dense remains.
6. **Why initialization matters**: Ticket weights move further from θ0 than others (Appendix F.5) — not "already trained" but land in amenable loss region for optimizer. Structure encodes inductive bias (Cohen & Shashua pooling geometry analogy); generalization improves via compression (Zhou/Arora bounds). Sparse trainable subnetworks explain why dense training succeeds (more lottery draws).

## Detailed Notes

### Motivation & Figure 1
Random sparse subnetworks (dashed, 10 trials) slower/lower accuracy monotonically with sparsity on 4 architectures; winning tickets (solid, 5 trials) reverse this up to 90% sparsity. Quotes Han 2015/Li 2016 on difficulty training pruned from scratch.

### Method (Section 1)
- Iterative vs one-shot; per-layer magnitude (fc20%, conv10–20% fc0–20% per Figure 2), output pruned half rate; later global for deeper. Reset to θ0 after each prune round; early stopping via min validation loss as speed proxy (Appendix C). Pm = ||m||0/|θ| sparsity measure.

### Lenet Experiments (Section 2, Figures 3-4, Appendix G)
- Architecture 300-100 (266K), 50K/Batch60. Figure 3 curves per Pm. Figure 4a early-stop iter and accuracy for iterative (blue) vs reinit (orange) and 4b accuracy at 50K with 100% train vs 4c one-shot (green/red). Appendix G sweeps LR, SGD/Momentum/Adam, init distributions (Glorot vs He), network size, pruning rate — pattern robust.
- Analysis: tickets generalize better even at 100% train (Figure 12); reinitialization control (15 trials =3 per ticket) isolates initialization.

### Convolutional (Section 3, Figures 5-6, Appendix H)
- Conv-2/4/6 definitions (Figure 2) scaling from near-FC (1% conv) to traditional (2/3 conv). Figure 5 top iterative vs reinit, bottom right test at final iteration (100% train). Appendix H hyperparams (LR, SGD/Momentum, pruning conv vs fc rates Appendix H.6). Dropout interaction section with new LRs.

### VGG/Resnet (Section 4, Figures 7-8, Appendix I)
- VGG-19 adapted from Liu 2019 (Simonyan → CIFAR10) 20M, 112K, SGD momentum 0.9, LR decay 0.1 at 80/120 epochs, weight decay, batchnorm, augmented; Resnet-18 He et al. 270K, 30K, decay at 20K/25K. Global pruning Appendix I.1 rationale. Hyperparam exploration I.4-I.5. Learning rate sensitivity: higher LR no tickets, lower finds but underperforms high-LR dense; warmup bridges.

### Discussion (Section 5) & Implications
- Importance of initialization vs structure vs generalization (Occam's Hill, Rasmussen 2001, Rissanen 1986, Zhou 2018, Arora 2018). Reconciliation with Liu et al.: up to 80% structure alone suffices due to overparameterization; beyond needs initialization. Dense contains simpler representations.
- Implications: improve training (early search/prune), design better inits/architectures (transfer tickets), theoretical understanding (optimization/generalization). Early notes conjecture that SGD seeks well-initialized subset.

### Limitations & Follow-ups (Section 6, Appendices)
- Unstructured sparsity not hardware-efficient; iterative cost high; not tested on RNN/Transformer/ImageNet; sensitivity suggests late resetting (Frankle et al. later: rewind to iteration k). Appendices B–I extensive ablations: iterative strategies (reset vs continue training), early stopping criterion, train accuracy, random sparsity control, examining tickets (Adam vs SGD init histograms, reinit from ticket init, pruning at iter 0, weight distances, connectivity, noise robustness).

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 5 of 5 passages in this section could not be located in the stored source ([https://arxiv.org/abs/1803.03635](https://arxiv.org/abs/1803.03635)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "We find that a standard pruning technique naturally uncovers subnetworks whose initializations made them capable of training effectively."

> "A randomly-initialized, dense neural network contains a subnetwork that is initialized such that — when trained in isolation — it can match the test accuracy of the original network after training for at most the same number of iterations."

> "We designate these trainable subnetworks, f(x; m⊙θ0), *winning tickets*, since those that we find have won the initialization lottery."

> "When randomly reinitialized, a winning ticket learns more slowly and achieves lower test accuracy, suggesting that initialization is important."

> "Larger networks might explicitly contain simpler representations."

## Concepts Introduced or Referenced
- [[lottery-ticket-hypothesis]] — Core contribution: existence, identification via iterative magnitude pruning + resetting, properties, sensitivity, and implications.
- [[parameter-efficient-fine-tuning]] — Historical precursor to modern PEFT: shows networks contain sparse trainable substructures; motivates adapters/LoRA as efficient subspaces vs pruning.
- [[lora]] — Low-rank adaptation as complementary efficient subspace; LTH shows sparsity-based efficiency, LoRA low-rank-based — both exploit intrinsic low dimension (Li 2018, Aghajanyan 2020 cited in LoRA).
- [[pretraining]] — Initialization lottery tied to random Glorot/He pretraining initialization; dense pretrain draws many tickets.
- [[inference]] — Pruning reduces inference cost (Han 2015 90% reduction) if sparse trainable from start — inference-optimal sparsity vs Chinchilla dense-optimal.
- [[supervised-fine-tuning]] — Winning tickets trained from scratch on supervised task; adaptation vs from-scratch distinction.
- [[transformer]] — Not direct experiments but later extension to transformers (discussed as future) — relevance to PEFT on transformers.

## Critical Assessment
**Strengths:** Seminal, rigorously empirical (5 architectures, 3 optimizers, dropout/batchnorm/residual, exhaustive appendices up to 9 sections) with controlled reinitialization proving initialization importance; introduces lasting hypothesis framing dense training as lottery over sparse tickets; quantitative speed/accuracy improvements bold (3.5× faster, +3.5pp). Insightful reconciliation with contradictory Liu et al. via sparsity threshold.

**Limitations / Gaps:** Evaluates only small vision feed-forward nets on MNIST/CIFAR10 (not LLM scale or transformers, not ImageNet without rewinding); unstructured pruning not practical on GPUs; iterative prune-train-reset cost negates training efficiency (later work SNIP/GraSP/early-bird addresses); deeper nets sensitive to hyperparameters and fail at standard LR without warmup — hinting LTH in its strict θ0 form breaks at scale (later Lottery Ticket with rewinding to iteration few% of training). Theoretical explanation speculative (loss landscape amenability).

**Contradictions / Notes vs. existing wiki:** Extends [[parameter-efficient-fine-tuning]] page (which currently covers adapters/prefix/LoRA) by adding sparsity as alternative PEFT lineage; should be linked as precursor rather than competitor — LoRA (rank pruning) vs LTH (weight pruning) both exploit low intrinsic dimension. Complements [[pretraining]] scaling laws (Kaplan/Chinchilla) by showing overparameterization helps via ticket abundance, not just N. Provides historical context for [[lora]] efficiency claims (LoRA's low-rank hypothesis mirrors LTH sparsity hypothesis). No contradiction with [[source-lora]] but should cross-reference: modern PEFT chooses LoRA over lottery tickets for hardware friendliness. Suggest add > [!NOTE] that original LTH requires resetting to θ0; later "rewinding" variant resets to early checkpoint for LLMs/Resnet50-ImageNet.

---

**Source:** The Lottery Ticket Hypothesis: Finding Sparse, Trainable Neural Networks by Jonathan Frankle, Michael Carbin (MIT CSAIL) — <https://arxiv.org/abs/1803.03635>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
