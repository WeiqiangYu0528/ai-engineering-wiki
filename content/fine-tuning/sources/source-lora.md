---
type: source-summary
title: "LoRA: Low-Rank Adaptation of Large Language Models"
summary: Hu et al. (Microsoft, arXiv 2106.09685v2, ICLR 2022) introduce Low-Rank Adaptation (LoRA) — a parameter-efficient fine-tuning method that freezes pre-trained weights $W0$ and injects trainable low-rank decomposition…
status: draft
visibility: public
author: "Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen (Microsoft Corporation)"
source-type: paper
url: "https://arxiv.org/abs/2106.09685"
date-published: 2021-10-16
date-ingested: 2026-08-25
tags:
  - fine-tuning
  - llm-fundamentals
key-concepts:
  - "[[lora]]"
  - "[[parameter-efficient-fine-tuning]]"
  - "[[supervised-fine-tuning]]"
  - "[[transformer]]"
  - "[[pretraining]]"
key-entities:
  - "[[openai]]"
  - "[[huggingface]]"
aliases:
  - wiki/source-lora
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Hu et al. (Microsoft, arXiv 2106.09685v2, ICLR 2022) introduce Low-Rank Adaptation (LoRA) — a parameter-efficient fine-tuning method that freezes pre-trained weights $W0$ and injects trainable low-rank decomposition…</p>
<p class="kb-provenance">Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen (Microsoft Corporation), 2021-10-16. <a href="https://arxiv.org/abs/2106.09685">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 31 figures on this page were not found in [https://arxiv.org/abs/2106.09685](https://arxiv.org/abs/2106.09685): `0.5M`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Hu et al. (Microsoft, arXiv 2106.09685v2, ICLR 2022) introduce **Low-Rank Adaptation (LoRA)** — a parameter-efficient fine-tuning method that freezes pre-trained weights $W_0$ and injects trainable low-rank decomposition matrices $B\in\mathbb{R}^{d\times r}, A\in\mathbb{R}^{r\times k}$ ($r\ll\min(d,k)$) in parallel ($h=W_0x + BAx$, scaled by $\alpha/r$) to model the update $\Delta W$. Evaluated on RoBERTa/DeBERTa (GLUE), GPT-2 (E2E/WebNLG/DART) and GPT-3 175B (WikiSQL, MNLI, SAMSum), LoRA with $r=1$–$4$ matches or exceeds full fine-tuning while reducing trainable parameters by up to **10,000×** (350 GB → 35 MB checkpoint for GPT-3), VRAM by **3×** (1.2 TB → 350 GB), and yielding **25% faster** training with **zero inference latency** after merging $W=W_0+BA$, unlike adapters. The paper also provides the first empirical analysis of rank-deficiency in adaptation (optimal rank, which matrices, and $\Delta W$ vs $W$ amplification).

## Key Takeaways

1. **Low-rank hypothesis and formulation (§4.1).** Inspired by intrinsic dimension (Li 2018, Aghajanyan 2020), $\Delta W$ has low rank. Forward Eq. 3: $h=W_0x + BAx$; $A\sim\mathcal N$, $B=0$ → $\Delta W=0$ initially; scaling $\alpha/r$ makes tuning $\alpha$ ≈ tuning LR (Yang & Hu 2021). As $r\to\text{rank}(W_0)$ recovers full FT expressiveness; adapters converge to MLP, prefix to short-sequence models.

2. **No latency, huge efficiency (§4.2).** Merge BA into $W_0$ at deployment; task switch by subtract/add. GPT-3 175B: 2/3 VRAM saving (no optimizer states for frozen params), 10,000× checkpoint shrinkage, many tasks via swap of tiny modules on same frozen base. Limitation: batching different A,B in one forward requires unmerged dynamic selection.

3. **Why adapters/prefix fail (§3).** AdapterH/L add 20–30% latency at batch=1, seq 128 even with 0.5M params (Table 1: FT 19.8 ms vs AdapterH 25.8 ms) due to sequential extra depth and extra AllReduce/Broadcast under model parallelism; prefix tuning is hard to optimize, non-monotonic with params, steals sequence length.

4. **Broad empirical wins (§5).** RoBERTa-large GLUE avg: FT 88.9 → LoRA 0.8M **89.0** (above AdapterP 3M 88.4); DeBERTa-XXL 1.5B 91.1 → **91.3** with 4.7M; GPT-2 M E2E BLEU LoRA **70.4** > PreLayer 69.7 > FT 68.2; GPT-3 175B WikiSQL 73.8→**74.0**, MNLI 89.5→**91.7**, SAMSum 52/28/44.5→**53.8/29.8/45.9** with 4.7M params, beating 40M adapters. Prefix degrades beyond 256/32 tokens (Fig.2).

5. **Understanding the updates (§7).** (i) Under fixed budget, allocating all params to $\Delta W_q$ and $\Delta W_v$ with small $r$ beats larger $r$ on one matrix; $W_q,W_v$ most impactful. (ii) Optimal $r$ tiny — performance plateaus at $r=1$–$4$, $r=64$ barely better → confirms low intrinsic rank. (iii) Subspace/Grassmann and Frobenius analysis: $\Delta W$ amplifies directions not emphasized in $W$, task-specific rather than replicating $W$.

## Detailed Notes

### Motivation & Problem (§1–2)
- One base → many downstream tasks; full FT duplicates 175B per task → deployment & switching cost. Parameter-efficient encoding $\Delta\Phi=\Delta\Phi(\Theta)$, $|\Theta|\ll|\Phi_0|$, optimize $\max_\Theta \sum\log p_{\Phi_0+\Delta\Phi(\Theta)}$.

### Applying LoRA to Transformer (§4.2)
- Applied to attention $W_q,W_k,W_v,W_o$ (as $d_{model}\times d_{model}$) and optionally MLP; main experiments only $W_q,W_v$ for simplicity. Leave MLP/LayerNorm/bias to future work (§4.2 says orthogonal).

### Baselines (§5.1)
- FT, FTTop2 (last 2 layers), BitFit (bias-only), PreEmbed ($|Θ|=d_{model}(l_p+l_i)$), PreLayer ($L d_{model}(l_p+l_i)$), AdapterH/L/P/D ($L_{Adpt}(2d_{model}r+r+d_{model})+2L_{LN}d_{model}$), LoRA ($2L_{LoRA} d_{model} r$). Hyperparameters in App D, datasets in C.

### Related Work (§6)
- Covers Transformer LM lineage, prompt engineering vs fine-tuning, parameter-efficient adaptation (adapters, Compacter Kronecker, prefix/prompt tuning), low-rank structures in ML theory (cited Ghorbani, Allen-Zhu results on low-rank concept classes).

### Appendices
- A: few-shot still lags FT → adaptation matters. B: detailed latency (RTX8000). E: LoRA+prefix combo. F: low-data regime (LoRA more sample-efficient). G-H: subspace similarity metrics, amplification factor ($\|U^TWV\|_F/\|WV\|_F$) showing $\Delta W$ amplifies rare directions.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 4 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2106.09685](https://arxiv.org/abs/2106.09685)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "We propose Low-Rank Adaptation, or LoRA, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters for downstream tasks."

> "Compared to GPT-3 175B fine-tuned with Adam, LoRA can reduce the number of trainable parameters by 10,000 times and the GPU memory requirement by 3 times."

> "Our simple linear design allows us to merge the trainable matrices with the frozen weights when deployed, introducing no inference latency compared to a fully fine-tuned model, by construction."

> "We hypothesize that the change in weights during model adaptation also has a low 'intrinsic rank'... a very low rank (i.e., r can be one or two) suffices even when the full rank is as high as 12,288."

## Concepts Introduced or Referenced

- [[lora]] — Core contribution: frozen $W_0$ + $BA$ update, $r\ll d$, $\alpha/r$ scaling, merge for inference.
- [[parameter-efficient-fine-tuning]] — Canonical PEFT method alongside adapters/prefix-tuning; this paper establishes LoRA as the dominant PEFT recipe and its orthogonality.
- [[supervised-fine-tuning]] — LoRA as efficient implementation of SFT stage; contrasts full FT with adapter/prefix baselines.
- [[transformer]] — Applied to $W_q,W_k,W_v,W_o$ self-attention matrices; attention-centric adaptation.
- [[pretraining]] — Assumes large pre-trained LM as starting point; efficiency measured vs pre-training cost.
- [[inference]] — Latency analysis, 25% throughput gain, zero-latency merge.
- [[hallucination]] — Not direct but adapters/prefix tradeoffs affect factuality via capacity.

## Critical Assessment

**Strengths:** Exceptionally clean and impactful — mathematically simple yet empirically exhaustive (GLUE→GPT-3 175B, 3× VRAM, 10kx checkpoint, zero latency proof via Fig.1). Latency table and rank ablation are unusually concrete for PEFT. Rank-deficiency analysis (subspace distance, amplification) connects engineering to theory. Code release (microsoft/LoRA) became foundation for all later PEFT (QLoRA, DoRA, etc.).

**Limitations / Gaps:** Evaluated only on relatively short-context NLU/NLG (128 seq for GLUE, E2E) — not long-context or reasoning/RLHF; MLP/LayerNorm adaptation left unexplored (later works show MLP also helps). Single-task finetuning only, no multi-task or continual PEFT. Merging prevents per-sample adapter batching — noted but not solved. Factuality/retrieval grounding not studied.

**Contradictions / Notes vs. existing wiki:** Complements [[supervised-fine-tuning]] which already notes LoRA/QLoRA as alternative but without detail — this primary source fills it. No contradictions with [[source-attention-is-all-you-need]] or [[source-training-compute-optimal-large-language-models]]; scales orthogonally to scaling laws (efficiency at adaptation time). Should be linked from [[tool-use]] as LoRA-enabled tool finetuning.

---

**Source:** LoRA: Low-Rank Adaptation of Large Language Models by Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen (Microsoft Corporation) — <https://arxiv.org/abs/2106.09685>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
