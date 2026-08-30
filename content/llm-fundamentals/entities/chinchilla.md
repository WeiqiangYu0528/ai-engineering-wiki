---
type: entity
title: "Chinchilla"
summary: Chinchilla (70B parameters, 1.4T tokens) is the compute-optimal large language model introduced by DeepMind in Hoffmann et al. (March 2022) in Training Compute-Optimal Large Language Models (Chinchilla).
status: draft
visibility: public
entity-type: model
tags:
  - llm-fundamentals
  - inference
created: 2026-08-24
updated: 2026-08-24
url: "https://arxiv.org/abs/2203.15556"
related:
  - "[[scaling-laws]]"
  - "[[pretraining]]"
  - "[[gopher]]"
  - "[[deepmind]]"
  - "[[inference]]"
  - "[[scaling-laws-revisions]]"
aliases:
  - wiki/chinchilla
---

<aside class="kb-header kb-type-entity" aria-label="Page information">
<p class="kb-type">Entity</p>
<p class="kb-summary">Chinchilla (70B parameters, 1.4T tokens) is the compute-optimal large language model introduced by DeepMind in Hoffmann et al. (March 2022) in Training Compute-Optimal Large Language Models (Chinchilla).</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/llm-fundamentals/entities/gopher">Gopher</a></li><li><a href="/llm-fundamentals/entities/deepmind">DeepMind</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/llm-fundamentals/concepts/scaling-laws-revisions">Scaling Laws: Kaplan, Chinchilla, and What the Disagreement Was Really About</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Chinchilla (70B parameters, 1.4T tokens)** is the compute-optimal large language model introduced by [[deepmind]] in Hoffmann et al. (March 2022) in [[source-training-compute-optimal-large-language-models]]. Trained with the **identical compute budget (5.76×10²³ FLOPs) as [[gopher]] (280B, 300B tokens)** but 4× smaller and trained on 4× more data, Chinchilla demonstrated that equal scaling of model size and data ($N_{opt} \propto C^{0.5}, D_{opt} \propto C^{0.5}$) dramatically outperforms the then-standard practice of scaling parameters alone. It established the canonical **$\approx 20$ tokens per parameter** rule and became the blueprint for modern data-dense models (Llama 2/3, Falcon, etc.).

## Key Facts
- **Scale:** 70B parameters, 1.4 trillion tokens ($\approx 20$ tok/param), same FLOPs as Gopher 280B/300B.
- **Architecture:** Decoder-only [[transformer]] identical to Gopher — 80 layers, $d_{model}=8192$ (vs Gopher 16384), 64 heads (vs 128), $d_{ff}=4×d_{model}$, key/value 128; feed-forward + attention as in Rae et al. 2021.
- **Training:** MassiveText dataset (rebalanced mixture for 1.4T), AdamW optimizer (vs Adam for Gopher), modified SentencePiece without NFKC (94% vocab overlap, better math/chemistry), batch 1.5M→3M tokens, LR 1×10⁻⁴ with cosine decay 10× over $D$ tokens (optimal per Appendix B), bfloat16 forward/backward + float32 optimizer state, TPU v3/v4 + JAX/Haiku.
- **Compute:** $C \approx 6ND = 5.76×10^{23}$ FLOPs = 1× Gopher unit. Projected optimal for 10B is 205B tokens at 1.23×10²² FLOPs; for 175B is 3.7T tokens at 3.85×10²⁴ FLOPs.
- **Results vs Gopher (same compute):**
  - MMLU 5-shot: **67.6% vs 60.0%** (+7.6%, SOTA, beats 63.4% expert forecast; >90% on 4/57 tasks)
  - Pile: wins on all 20 subsets in bpb; WikiText103 ppl 7.16 vs 7.75
  - BIG-bench: 65.1% vs 54.4% (+10.7%, wins 58/62 tasks)
  - LAMBADA 77.4% vs 74.5%; RACE-h 82.3% vs 71.6%; RACE-m 86.8% vs 75.1%
  - Common Sense: HellaSwag 80.8% vs 79.2%, Winogrande 74.9% vs 70.1%
  - TruthfulQA 0-shot 43.6% vs 29.5% (+14.1%); NQ closed-book 35.5% vs 28% (SOTA)
  - Uniformly beats GPT-3 175B, Jurassic-1 178B, MT-NLG 530B at a fraction of their inference cost.
- **Inference Advantage:** 4× smaller → 4× lower memory, KV-cache, and per-token FLOPs; fits on single 8×GPU node with quantization vs multi-node for 280B.

## Significance in AI Engineering
- **Revised Scaling Laws:** Direct empirical proof that Kaplan's $N \propto C^{0.73}, D \propto C^{0.27}$ underestimates data value due to fixed LR schedule artifact. Established the Chinchilla scaling laws ($N \propto C^{0.5}, D \propto C^{0.5}$) still used for budget planning.
- **Amortization Insight:** Pre-training is one-time, but inference/fine-tuning dominates lifetime FLOPs. A smaller compute-optimal model minimizes total cost — driving the industry to "overtrain" (e.g., Llama 3 8B on 15T tokens) below 20 tok/param frontier.
- **Data-Centric Scaling:** Shifted frontier-lab investment from pure parameter growth to massive high-quality dataset pipelines (FineWeb, DCLM). Optimal frontier projects need for 10T+ token corpora (1T model → 21T tokens).
- **Practical Blueprint:** Demonstrated that AdamW + horizon-matched cosine schedule + careful tokenizer are necessary companions to scale.

## Related Concepts
- [[scaling-laws]] — Central exemplar of compute-optimal $C^{0.5}$ scaling; parametric loss $\hat{L}(N,D)=E+A/N^{\alpha}+B/D^{\beta}$ and efficient frontier.
- [[pretraining]] — Realizes the 20 tok/param compute-optimal data budget and matched LR schedule on MassiveText.
- [[inference]] — 4× cheaper serving and fine-tuning at equal capability; motivates serving optimizations and hardware accessibility.
- [[gopher]] — The 280B baseline at same FLOPs that Chinchilla refutes.
- [[transformer]] — Decoder-only architecture scaled per Hoffmann et al.

## Sources
- [[source-training-compute-optimal-large-language-models]]

## Synthesis

- [[scaling-laws-revisions]] — the methodology behind the correction, and why compute-optimal is not cost-optimal

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
