---
type: concept
title: "Mixture of Experts"
summary: Mixture of Experts (MoE) replaces a dense feed-forward network (FFN) in a Transformer block with many parallel FFNs ("experts") plus a router that selects a small subset per token ($k$ out of $E$).
visibility: public
aliases:
  - MoE
  - Sparse MoE
  - Switch Transformer
  - wiki/mixture-of-experts
tags:
  - llm-fundamentals
  - inference
created: 2026-08-26
updated: 2026-08-26
status: draft
sources:
  - "[[source-cs336-lecture04-attention-moe]]"
  - "[[source-cs336-lecture03-architectures]]"
  - "[[source-cs336-lecture05-gpus-tpus]]"
related:
  - "[[transformer]]"
  - "[[self-attention]]"
  - "[[inference]]"
  - "[[pretraining]]"
  - "[[scaling-laws]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Mixture of Experts (MoE) replaces a dense feed-forward network (FFN) in a Transformer block with many parallel FFNs ("experts") plus a router that selects a small subset per token ($k$ out of $E$).</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-cs336-lecture04-attention-moe">CS336 Lecture 04 — Attention Alternatives and Mixture of Experts</a></li><li><a href="/llm-fundamentals/sources/source-cs336-lecture03-architectures">CS336 Lecture 03 — Architectures, Hyperparameters</a></li><li><a href="/mlops/sources/source-cs336-lecture05-gpus-tpus">CS336 Lecture 05 — GPUs, TPUs</a></li></ul></nav>
</aside>

## Overview
**Mixture of Experts (MoE)** replaces a dense feed-forward network (FFN) in a [[transformer]] block with many parallel FFNs ("experts") plus a **router** that selects a small subset per token ($k$ out of $E$). Compute (FLOPs) scales with $k$, not $E$, so MoE can have 8–256× more parameters than a dense equivalent at the **same training FLOPs** ($C≈6ND$) while sharding experts across devices — the dominant architecture for frontier scale in 2024–2026 (Mixtral, DeepSeek v3, Qwen 1.5/3, Grok, DBRX, OlMoE).

## Key Ideas
- **Definition.** Standard block: $\text{FFN}(x)=\text{SwiGLU}(xW_1)V W_2$. MoE: $\text{MoE}(x)=\sum_{i\in \text{TopK}(g(x))} g_i(x)\, \text{FFN}_i(x)$, gating $g(x)=\text{softmax}(xW_g)$ or logistic regressor, with capacity factors and load-balancing losses. Less common: MoE over attention heads (JetMoE, ModuleFormer).
- **Why popular now (CS336 Lecture 04 evidence).** (1) Same FLOPs → lower loss (Fedus 2022); (2) faster convergence (OlMoE); (3) competitive vs dense at frontier quality; (4) expert parallelism — all-to-all sharding scales to 256 experts (DeepSeek v3) with hybrid attention backbones.
- **Routing families.** Dominant: **token-choice top-k** (Switch k=1 → GShard/Grok/Mixtral k=2 → DBRX/Qwen k=4 → DeepSeek k=6–8). Alternatives: expert-choice, RL-learned (Bengio 2013, rare today), global linear assignment (Clark 2022). Gating implementation matters: DeepSeek V1–2 use independent logistic regressors per expert; Mixtral/DBRX/v3 apply softmax after TopK selection.
- **Fine-grained + shared experts (2024–2025 recipe).** Shrink each expert to $1/r$ of dense $d_{ff}$ ($r=4$–$14$) and activate more of them: DeepSeek v1 64 routed +2 shared ($r=1/4$), Qwen1.5 60+4 ($r=1/8$), DeepSeek v3 **256 routed / 8 active + 1 shared** ($r=1/14$), OlMoE 64/8 ($r=1/8$). Shared experts (always-on) originate from DeepSpeed-MoE; ablations: DeepSeek finds monotonic gain, OlMoE finds null — recipe-sensitive.
- **Training heuristics.** Load-balancing via aux loss (Switch/GShard), aux-free via bias correction (DeepSeek v3/auxfree_2024), capacity overflow drop vs token dropping, and stability tricks co-designed with pre-norm/RMSNorm (see [[transformer]]).

## How It Works
1. **Routing.** For token $x_t$, router computes scores $s = x_t W_g \in \mathbb{R}^E$, selects $k$ highest, normalizes to weights $g$.
2. **Expert compute.** Each selected expert $i$ computes $\text{FFN}_i(x_t)$ independently on its device shard.
3. **Combine.** Weighted sum $\sum g_i \text{FFN}_i(x_t)$ + residual connection + norm (typically pre-RMSNorm).
4. **All-to-all dispatch.** Tokens are permuted to expert devices (dispatch) and returned (combine) via collective communication — the systems bottleneck profiled in [[inference]] / Lecture 05.
5. **Hybrid deployment.** At long context, MoE FFN is often paired with attention alternatives (Minimax M1 7:1 linear:full, Nemotron-3 3:1, Qwen-Next GDN 3:1) to jointly control attention $O(n^2)$ and FFN FLOPs — see [[self-attention]].

## Practical Implications
- **Inference serving:** MoE reduces per-token FFN FLOPs but increases **communication** (all-to-all) and **memory** (store $E$ experts) — choose $k$ and $E$ to balance HBM (from Lecture 05 memory wall) vs network. Shardy MoEs (DeepSeek v3) amortize across many concurrent requests.
- **Training stability:** Aux losses and QK-Norm prevent router collapse; without them top-k becomes winner-take-all. Start from aux-free recipes if multi-node infrastructure is limited.
- **When to use dense vs MoE:** Dense still preferred <1B active params or single-node training (simpler infra, more predictable MFU); MoE dominates >30B total params or multi-node frontier pushes.

## Connections
- Replaces the FFN sublayer of [[transformer]]; interacts with [[self-attention]] alternatives (hybrid architectures in Lecture 04).
- Governed by [[scaling-laws]] — MoE breaks $C=6ND$ dense pareto by decoupling $N_{total}$ from $N_{active}$.
- Optimized via [[inference]] (expert parallelism, continuous batching, FlashAttention for remaining dense attention) and hardware hierarchy in [[pretraining]] Lecture 05.
- Tokenization and vocab size still drive sequence length that MoE must process; see [[tokenization]].

## Open Questions
- Does fine-grained ratio $r$ have a universal optimum or is it task/context-length dependent (conflict DeepSeek vs OlMoE)?
- Can routing be learned without auxiliary losses at 1000+ expert scale without instability?
- Will post-hoc sparse attentions (DSA) + MoE jointly achieve linear inference scaling without hybrid dense attention?

## Sources
- [[source-cs336-lecture04-attention-moe]]
- [[source-cs336-lecture03-architectures]]
- [[source-cs336-lecture05-gpus-tpus]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
