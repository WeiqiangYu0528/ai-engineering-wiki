---
type: entity
title: "Gopher"
summary: Gopher (280B parameters, 300B tokens) is the large dense decoder-only Transformer introduced by DeepMind in Rae et al. (December 2021).
status: draft
visibility: public
entity-type: model
tags:
  - llm-fundamentals
created: 2026-08-24
updated: 2026-08-24
url: "https://arxiv.org/abs/2112.11446"
related:
  - "[[chinchilla]]"
  - "[[scaling-laws]]"
  - "[[deepmind]]"
  - "[[pretraining]]"
aliases:
  - wiki/gopher
---

<aside class="kb-header kb-type-entity" aria-label="Page information">
<p class="kb-type">Entity</p>
<p class="kb-summary">Gopher (280B parameters, 300B tokens) is the large dense decoder-only Transformer introduced by DeepMind in Rae et al. (December 2021).</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/entities/chinchilla">Chinchilla</a></li><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li><li><a href="/llm-fundamentals/entities/deepmind">DeepMind</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Gopher (280B parameters, 300B tokens)** is the large dense decoder-only [[transformer]] introduced by [[deepmind]] in Rae et al. (December 2021). As the largest model in the pre-Chinchilla generation (alongside GPT-3 175B, Jurassic-1 178B, MT-NLG 530B, LaMDA 137B), Gopher epitomized the Kaplan-era practice of scaling parameters at near-fixed data ($\approx 300$B tokens). In Hoffmann et al. (2022) [[source-training-compute-optimal-large-language-models]], Gopher serves as the **compute-matched baseline** for [[chinchilla]] (70B/1.4T): both use $5.76×10^{23}$ FLOPs, but Chinchilla's equal scaling ($N \propto C^{0.5}, D \propto C^{0.5}$) proves Gopher was **4× oversized and 4× undertrained** for its budget.

## Key Facts
- **Scale:** 280B parameters, trained on 300B tokens ($\approx 1.1$ tok/param) for $5.76×10^{23}$ FLOPs ($\approx 6ND$). Kaplan-optimal for this FLOPs would have been ~40–67B per Chinchilla analysis.
- **Architecture:** 80 layers, $d_{model}=16384$, 128 heads, key/value 128, $d_{ff}=65536$ (4× $d_{model}$), context 2048, SentencePiece tokenizer with NFKC normalization.
- **Training:** MassiveText dataset (MassiveWeb, Books, C4, News, GitHub, Wikipedia), Adam optimizer (vs Chinchilla's AdamW), batch 3M→6M tokens, LR 4×10⁻⁵ with cosine decay, TPU v3/v4 + JAX/Haiku, 80-layer depth (slightly less deep than Levine depth-width optimum for TPU wall-clock).
- **Performance (pre-Chinchilla SOTA, since surpassed):**
  - MMLU 5-shot: 60.0% (Chinchilla 67.6%)
  - Pile bpb: outperformed by Chinchilla on all 20 subsets; WikiText103 ppl 7.75 vs Chinchilla 7.16
  - BIG-bench: 54.4% vs Chinchilla 65.1%
  - LAMBADA 74.5% vs 77.4%; RACE-h 71.6% vs 82.3%
  - Was competitive with GPT-3 and Jurassic-1 at publication, but all were shown suboptimal per FLOP after Chinchilla.
- **Cost:** 4× larger than compute-optimal → 4× higher inference memory/FLOPs and KV-cache per token ($d_{model} × N_{layers}$ scaling).

## Significance in AI Engineering
- **Baseline for Scaling Science:** Gopher's fixed-budget comparison with Chinchilla provided the cleanest experimental test of Kaplan vs Chinchilla scaling — identical FLOPs, data source family, and architecture lineage, differing only in $N/D$ allocation (plus AdamW/tokenizer).
- **Illustrates Undertraining:** At Gopher's FLOPs, Table 3 of [[source-training-compute-optimal-large-language-models]] projects optimal $D \approx 1.5$T (67B) to 6.8T (280B). Gopher's 300B is valid only for a ~10B model — quantifying how far the field drifted from compute-optimality in 2020–2021.
- **Historical Marker:** Marks the end of the "scale parameters at fixed 300B tokens" era that produced GPT-3, Jurassic, and MT-NLG. Post-Gopher, all frontier labs adopted data-scaled recipes.

## Related Concepts
- [[chinchilla]] — The 70B compute-optimal successor at same FLOPs that uniformly outperforms Gopher.
- [[scaling-laws]] — Kaplan $N \propto C^{0.73}$ predicts Gopher-scale models; Chinchilla $N \propto C^{0.5}$ shows they are oversized.
- [[pretraining]] — Gopher's MassiveText and 300B regime vs Chinchilla's rebalanced 1.4T mix.
- [[deepmind]] — Creator of both models; Gopher paper Rae et al. 2021 is the methodological parent of the Chinchilla study.

## Sources
- [[source-training-compute-optimal-large-language-models]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
