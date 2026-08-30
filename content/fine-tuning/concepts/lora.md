---
type: concept
title: "Low-Rank Adaptation (LoRA)"
summary: "Low-Rank Adaptation (LoRA) is a parameter-efficient fine-tuning (PEFT) method introduced by Hu et al. (Microsoft, 2021, LoRA: Low-Rank Adaptation of Large Language Models) that adapts a large pre-trained Transformer by…"
visibility: public
aliases:
  - LoRA
  - Low-Rank Adaptation
  - wiki/lora
tags:
  - fine-tuning
  - llm-fundamentals
created: 2026-08-25
updated: 2026-08-25
status: draft
sources:
  - "[[source-lora]]"
related:
  - "[[parameter-efficient-fine-tuning]]"
  - "[[supervised-fine-tuning]]"
  - "[[transformer]]"
  - "[[pretraining]]"
  - "[[inference]]"
  - "[[function-calling]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Low-Rank Adaptation (LoRA) is a parameter-efficient fine-tuning (PEFT) method introduced by Hu et al. (Microsoft, 2021, LoRA: Low-Rank Adaptation of Large Language Models) that adapts a large pre-trained Transformer by…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/fine-tuning/concepts/parameter-efficient-fine-tuning">Parameter-Efficient Fine-Tuning (PEFT)</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/fine-tuning/concepts/parameter-efficient-fine-tuning">Parameter-Efficient Fine-Tuning (PEFT)</a></li><li><a href="/fine-tuning/concepts/supervised-fine-tuning">Supervised Fine-Tuning</a></li><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/agents/concepts/function-calling">Function Calling</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/fine-tuning/sources/source-lora">LoRA: Low-Rank Adaptation of Large Language Models</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview

**Low-Rank Adaptation (LoRA)** is a **parameter-efficient fine-tuning (PEFT)** method introduced by Hu et al. (Microsoft, 2021, [[source-lora]]) that adapts a large pre-trained [[transformer]] by **freezing** its weights $W_0$ and learning a low-rank update $\Delta W = BA$ ($B\in\mathbb{R}^{d\times r}, A\in\mathbb{R}^{r\times k}, r\ll\min(d,k)$) injected in parallel as $h=W_0x+BAx$ (scaled by $\alpha/r$). With $r=1$–$4$ it matches or exceeds full [[supervised-fine-tuning]] while cutting trainable parameters by up to **10,000×**, VRAM by **3×**, and incurring **zero inference latency** after merging $W=W_0+BA$.

## Key Ideas

- **Low intrinsic rank hypothesis.** Over-parameterized LMs reside on low intrinsic dimension (Li 2018; Aghajanyan 2020). LoRA hypothesizes adaptation updates are low-rank: even for $d=12,288$ (GPT-3), $r=1$–$2$ suffices. Rank sweep (WikiSQL/MNLI) plateaus at $r=4$; $r=64$ barely improves — confirming hypothesis.
- **Parallel injection, not depth.** Two small matrices per adapted weight; $A\sim\mathcal N$, $B=0$ so $\Delta W=0$ at start; $\alpha/r$ scaling makes $\alpha$ ≈ LR. Unlike [[transformer]] **adapter layers** (Houlsby 2019) that add sequential depth and suffer 20–30% latency at batch=1 (Table 1, [[source-lora]]), LoRA merges into $W_0$ and adds no latency by construction. Task switch = subtract $BA$ + add $B'A'$.
- **Efficiency.** GPT-3 175B example: full FT 1.2 TB VRAM (Adam states) → 350 GB; checkpoint 350 GB → 35 MB with $r=4$ on $W_q,W_v$ only; 100 tasks 35 TB → 354 GB. 25% training throughput gain (32.5→43.1 tok/s per V100). Generalizes to any dense layer; paper limits to attention $W_q,W_v$ (later work shows MLP/LayerNorm also benefit).
- **Expressiveness.** As $r$ → rank($W_0$) + training biases, LoRA recovers full FT; adapters converge to MLP, prefix-tuning to short-sequence models. Orthogonal to prefix-tuning and quantization — composable (e.g., QLoRA = LoRA + 4-bit).

## How It Works

```
Pretrain: W0 frozen (e.g., GPT-3 175B, d_model=12288)
                    │
Adapt:    learn A (r×k, Gaussian) and B (d×r, zero) per W
                    │
Forward:  h = W0 x + (α/r) · B A x          (Eq. 3, both terms summed)
                    │
Merge:    W = W0 + BA  → deploy as single matrix (no latency)
                    │
Switch:   W - BA + B'A'  (new task in memory)
```

1. Choose matrices: $W_q,W_v$ most parameter-efficient per budget (paper §7.1); spreading $r$ across fewer matrices with larger rank vs many matrices small — $W_q$+$W_v$ with $r=4$ best.
2. Training: only $A,B$ receive gradients/optimizer states; $W_0$ frozen. LR/α tuning via $\alpha/r$.
3. Deployment: optionally keep unmerged for per-sample adapter routing; otherwise merge.

## Practical Implications

- **Democratized fine-tuning.** SFT that previously required 100s of GPUs now feasible on few GPUs; enables many customized models per base. Essential pattern for enterprise domain adaptation (Llama 3 + LoRA for terminology/workflows).
- **Serving.** Swap adapters on same frozen base in VRAM for multi-tenant inference; avoids reloading 350 GB per task. Use merged weights when latency critical, unmerged + router when batching diverse tasks.
- **Relation to SFT limits.** LoRA inherits [[supervised-fine-tuning]] imitation ceiling but lowers barrier; often combined with [[direct-preference-optimization]] / [[rlhf]] for preference alignment.
- **Follow-ons.** Extensions quantify impact: QLoRA (Dettmers 2023) adds 4-bit NF4 + double quant, DoRA (weight-decomposed), AdaLoRA (adaptive rank), LoRAHub. Choosing $r$, target modules ($W_qW_v$ vs all), and $\alpha$ are primary hyperparameters; $r=8$–$16$, $\alpha=16$–$32$ are modern defaults.
- **Limitations.** Adapter batching with different ranks needs extra kernels; very hard reasoning tasks may need larger $r$ or full MLP adaptation; hallucinations not cured (combine with [[retrieval-augmented-generation]]).

## Connections

- Instance of [[parameter-efficient-fine-tuning]] alongside adapters and prefix-tuning; canonical efficient realization of [[supervised-fine-tuning]].
- Applies to [[transformer]] attention projections ($W_q,W_k,W_v,W_o$) and optionally MLP; relies on frozen knowledge from [[pretraining]].
- Motivates [[inference]] efficiency: KV-cache unchanged, decoding unchanged after merge.
- Enables [[tool-use]] / [[function-calling]] specialization without full finetune.
- Contrasts with prompt-based methods ([[few-shot-prompting]], [[in-context-learning]]) which need no weights but are limited by context.

## Open Questions

- What is optimal rank per layer/module for long-context and reasoning vs. knowledge injection?
- Can adaptive/rank-richer methods (AdaLoRA, DoRA) replace manual $r$ selection without overhead?
- How does LoRA interact with RL-based alignment and continual/lifelong fine-tuning (forgetting vs merging)?

## Sources

- [[source-lora]]
- Related: [[parameter-efficient-fine-tuning]], [[supervised-fine-tuning]] (LIMA hypothesis, SFT pipeline)

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/fine-tuning/concepts/post-training-lineage">Post-Training Lineage: What Actually Replaced What</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
