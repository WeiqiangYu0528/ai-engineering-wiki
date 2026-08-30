---
type: concept
title: "Parameter-Efficient Fine-Tuning (PEFT)"
summary: Parameter-Efficient Fine-Tuning (PEFT) is the family of adaptation methods that fine-tune large pre-trained models by updating only a tiny fraction (<1%, often 0.01%) of parameters or by injecting small trainable…
visibility: public
aliases:
  - PEFT
  - Efficient Adaptation
  - Adapter Tuning
  - Parameter-Efficient Fine-Tuning
  - wiki/parameter-efficient-fine-tuning
tags:
  - fine-tuning
  - llm-fundamentals
created: 2026-08-25
updated: 2026-08-26
status: draft
sources:
  - "[[source-lora]]"
  - "[[source-lottery-ticket-hypothesis]]"
  - "[[source-parameter-efficient-transfer-learning]]"
related:
  - "[[lora]]"
  - "[[lottery-ticket-hypothesis]]"
  - "[[supervised-fine-tuning]]"
  - "[[instruction-tuning]]"
  - "[[transformer]]"
  - "[[pretraining]]"
  - "[[prompt-engineering]]"
  - "[[inference]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Parameter-Efficient Fine-Tuning (PEFT) is the family of adaptation methods that fine-tune large pre-trained models by updating only a tiny fraction (&lt;1%, often 0.01%) of parameters or by injecting small trainable…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/fine-tuning/concepts/direct-preference-optimization">Direct Preference Optimization</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/fine-tuning/concepts/lora">Low-Rank Adaptation (LoRA)</a></li><li><a href="/fine-tuning/concepts/lottery-ticket-hypothesis">Lottery Ticket Hypothesis</a></li><li><a href="/fine-tuning/concepts/supervised-fine-tuning">Supervised Fine-Tuning</a></li><li><a href="/fine-tuning/concepts/instruction-tuning">Instruction Tuning</a></li><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/fine-tuning/sources/source-lora">LoRA: Low-Rank Adaptation of Large Language Models</a></li><li><a href="/fine-tuning/sources/source-lottery-ticket-hypothesis">The Lottery Ticket Hypothesis: Finding Sparse, Trainable Neural Networks</a></li><li><a href="/fine-tuning/sources/source-parameter-efficient-transfer-learning">Parameter-Efficient Transfer Learning for NLP (Houlsby et al., ICML 2019)</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview

**Parameter-Efficient Fine-Tuning (PEFT)** is the family of adaptation methods that fine-tune large pre-trained models by updating only a tiny fraction (<1%, often 0.01%) of parameters or by injecting small trainable modules, while keeping the base model frozen. It encompasses **adapter layers** (Houlsby 2019), **prefix/prompt tuning** (Li & Liang 2021; Lester 2021), and **LoRA** — the dominant modern instance — all evaluated under the same framing in [[source-lora]] as encodings $\Delta\Phi=\Delta\Phi(\Theta)$ with $|\Theta|\ll|\Phi_0|$ optimizing $\max_\Theta\sum\log p_{\Phi_0+\Delta\Phi(\Theta)}$.

## Key Ideas

- **Why PEFT.** Full [[supervised-fine-tuning]] duplicates 100B+ parameters per task (GPT-3 175B → 350 GB checkpoint) and keeps Adam states for all weights (1.2 TB VRAM). PEFT shares one frozen base across many tasks, storing only small task modules (LoRA 35 MB at 10,000× reduction) and cutting VRAM 2–3× and task-switch overhead to a swap/broadcast. [[lottery-ticket-hypothesis]] provides sparsity perspective: dense nets contain 10–20% winning tickets, but finding them via iterative pruning is costlier than LoRA's low-rank.
- **Four lineages (3 additive + 1 subtractive).**
  - **Adapters:** bottleneck MLP ($d\to r\to d$) inserted between attention/MLP + residual. Variants AdapterH (2/block), AdapterL (1 after MLP+LN), AdapterP/AdapterDrop. Params $|\Theta|=\hat L_{Adpt}(2d_{model}r+r+d_{model})+2\hat L_{LN}d_{model}$. Strength: modular; Weakness: +20–30% latency at batch 1 (19.8→25.8 ms on GPT-2 M) due to sequential extra depth, extra AllReduce under model parallelism. Lineage root is Houlsby et al. 2019 ([[source-parameter-efficient-transfer-learning]]): two serial adapters per Transformer block (post-attention projection, post-FFN) applied before the residual add, internal skip + near-zero init ⇒ identity at training start; GLUE within 0.4% of full BERT-LARGE fine-tuning at 3.6% params/task (1.3× vs 9× total); ablations show adapters auto-prioritize higher layers (layers 0–4 removable on MNLI) and that init deviating too far from identity breaks training — the design constraints every later adapter variant inherits.
  - **Prefix/Prompt tuning:** learnable tokens prepended (PreEmbed: $d_{model}(l_p+l_i)$) or per-layer activations (PreLayer: $L d_{model}(l_p+l_i)$). Strength: no extra depth; Weakness: hard to optimize, non-monotonic with $l$, steals sequence length, drops sharply beyond 256/32 tokens (Fig. 2).
  - **LoRA:** low-rank update $W_0+BA$ (see [[lora]]). Params $2\hat L_{LoRA} d_{model} r$. Strength: zero inference latency after merging $W=W_0+BA$, monotonic scaling, 25% throughput gain; best QA/NLU tradeoff ($W_q,W_v$).
  - **Lottery Tickets (sparsity):** unstructured magnitude pruning → mask $\mathbf{m}$ with $P_m=10$–20% (down to 1.5% on VGG with warmup per [[source-lottery-ticket-hypothesis]]). Finds sparse trainable subnetworks from $\theta_0$, but requires iterative train-prune-reset loop and warmup/LR tuning for deep nets; not hardware-efficient vs LoRA. Complements low-rank: both exploit low intrinsic dimension (Li 2018, Aghajanyan 2020).
- **Taxonomy details from [[source-lora]].** Bias-only/BitFit ($|\Theta|\approx0.1$M) also considered; full FT and FTTop2 baselines frame the space. LoRA orthogonal to prefix, quantization, and lottery sparsity — combinations explored (App. E of LoRA, App.F of LTH shows tickets move further than other weights).

## How It Works

```
Frozen base Φ0 (pretrained)
   ├── Adapter: h → h + MLP_h(bottleneck(LN(h)))   (depth ↑)
   ├── Prefix:  [P;l_p] + x + [I;l_i]  → attention over longer prefix (seq ↓)
   ├── LoRA:    h = W0 x + (α/r) B A x  (parallel, mergeable)
   └── Lottery: f(x; m⊙θ0)  sparse ticket (iterative prune + reset to θ0)
```

- **Training:** freeze $\Phi_0$, optimize only $\Theta$ (adapters/prefix/LoRA) with Adam on downstream $Z$; lottery trains sparse ticket from $\theta_0$ (or rewound checkpoint for deep nets) after pruning.
- **Deployment:** adapters keep extra depth unless fused; prefix consumes context; LoRA merges; lottery ticket deployed as sparse CSR (unstructured) — inference gains conditional on hardware.

## Practical Implications

- **Choice heuristic.** Use [[lora]] as default for LLM SFT (best efficiency/quality/latency); consider adapters when per-layer modularity across many tasks with unmerged routing is needed; prefix only for very short adaptation with no latency budget (and $l$ small); lottery tickets demonstrate subset existence but remain research tool due to iterative cost and unstructured overhead — prefer LoRA for production.
- **Scaling.** Adapters/prefix do not scale monotonically; LoRA does — important when increasing budget (GPT-3 175B Fig. 2). Lottery Occam's Hill (accuracy peaks at 13.5% on Lenet, 4–11% on Conv) shows similar sweet spot but requires tuning. Modern stack: LoRA + 4-bit quantization (QLoRA) + FlashAttention for cheap domain SFT.
- **Relation to other PEFT.** Related families not in [[source-lora]] but same umbrella: P-Tuning, (IA)³, BitFit, Kronecker adapters (Compacter), and sparsity-based lottery tickets — often LoRA-based or complementary (LoRA rank vs pruning sparsity both reduce intrinsic dimension).
- **No cure for knowledge cutoff.** PEFT adapts style/knowledge in weights but not real-time facts; combine with [[retrieval-augmented-generation]] or [[tool-use]] for factuality. Lottery tickets reduce inference storage but not knowledge freshness.
- **Instruction tuning synergy:** FLAN/Tülu full-finetunes benefit most; PEFT replicates similar gains at 0.2% compute via LoRA (not lottery) — see [[instruction-tuning]] and [[supervised-fine-tuning]] for dataset/task scaling that PEFT can leverage.

## Connections

- Efficient form of [[supervised-fine-tuning]] after [[pretraining]]; inherits SFT imitation ceiling vs [[rlhf]]/[[direct-preference-optimization]].
- Contrasts with [[in-context-learning]]/[[prompt-engineering]] which adapt without weight updates but use context window.
- Impacts [[inference]] (latency, throughput, checkpoint IO).
- Applied to [[transformer]] attention/MLP; LoRA detail in [[lora]].

## Open Questions

- Multi-task / continual PEFT without interference when merging many adapters.
- Automatic rank/allocation (AdaLoRA) vs manual $r$.
- Combination with full RL alignment and long-context fine-tuning.

## Sources

- [[source-lora]]
- [[source-lottery-ticket-hypothesis]]
- [[source-parameter-efficient-transfer-learning]] — Houlsby et al. 2019: the canonical adapter paper (AdapterH architecture, near-identity init, GLUE 80.0 vs 80.4 at 3.6% params).
- Other classical refs: Li & Liang 2021 (Prefix-Tuning); Lester et al. 2021 (Prompt Tuning); Zaken et al. 2021 (BitFit) — summarized via §5.1; Frankle & Carbin 2019 (Lottery Ticket)

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/fine-tuning/concepts/lora">Low-Rank Adaptation (LoRA)</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
