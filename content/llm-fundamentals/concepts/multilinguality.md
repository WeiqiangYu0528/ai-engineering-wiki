---
type: concept
title: "Multilinguality"
summary: Multilinguality is the ability of a single language model to represent, understand, and generate text in many languages, and to transfer knowledge learned in one language (usually English) to others without parallel…
visibility: public
aliases:
  - Cross-lingual Transfer
  - XLM-R
  - Curse of Multilinguality
  - Multilingual Language Models
  - wiki/multilinguality
tags:
  - llm-fundamentals
  - eval-safety
created: 2026-08-25
updated: 2026-08-25
status: draft
sources:
  - "[[source-neural-machine-translation-subword-units]]"
  - "Jurafsky & Martin SLP3 Chapter 9: Masked Language Models (syllabus: 'The Transformer')"
  - "[[source-unsupervised-cross-lingual-representation-learning]]"
  - "[[source-do-all-languages-cost-same-tokenization]]"
related:
  - "[[tokenization]]"
  - "[[transformer]]"
  - "[[pretraining]]"
  - "[[evaluation]]"
  - "[[embeddings]]"
  - "[[llm-bias]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Multilinguality is the ability of a single language model to represent, understand, and generate text in many languages, and to transfer knowledge learned in one language (usually English) to others without parallel…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/tokenization">Tokenization</a></li><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li><li><a href="/llm-fundamentals/concepts/embeddings">Embeddings</a></li><li><a href="/eval-safety/concepts/llm-bias">LLM Bias</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-neural-machine-translation-subword-units">Neural Machine Translation of Rare Words with Subword Units</a></li><li><a href="/llm-fundamentals/sources/source-unsupervised-cross-lingual-representation-learning">Unsupervised Cross-lingual Representation Learning at Scale</a></li><li><a href="/llm-fundamentals/sources/source-do-all-languages-cost-same-tokenization">Do All Languages Cost the Same? Tokenization in the Era of Commercial Language Models</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Multilinguality** is the ability of a single language model to represent, understand, and generate text in many languages, and to transfer knowledge learned in one language (usually English) to others without parallel supervision. Modern multilingual models (mBERT 102 languages, XLM-100, XLM-R 100 languages) rely on a shared subword vocabulary and Transformer [[pretraining]] on mixed-language corpora. The field is shaped by a central tension — **positive transfer** (related languages help low-resource performance) versus **capacity dilution** / **curse of multilinguality** (per-language capacity drops as languages increase) — and by tokenization inequity where the same information costs up to 5× more tokens in non-Latin scripts.

## Key Ideas
- **Shared subword vocabulary as cross-lingual anchor:** Starting from [[source-neural-machine-translation-subword-units]]'s BPE, multilingual models learn a joint vocabulary on the concatenated 100-language corpus so that names, cognates, and loanwords share subword pieces across languages (joint BPE improves consistency vs independent). [[source-unsupervised-cross-lingual-representation-learning]] scales this to **SentencePiece Unigram 250K** on raw text (no language-specific tokenization, α=0.3 sampling, no language embeddings for code-switching), finding that even at fixed total parameters, larger vocab (+2.8% XNLI 32K→256K, +3% 128K→512K) improves performance — embedding capacity outweighs Transformer shrinkage for 100 languages.
- **Curse of multilinguality:** Formalized in [[source-unsupervised-cross-lingual-representation-learning]] (Conneau et al. 2019). For fixed model capacity (e.g., BERTBase, 150K vocab), adding languages initially helps low-resource via transfer (XLM-7→15 improves) but beyond ~15 languages overall XNLI accuracy degrades (71.8%→67.7% from 7→100 languages on Wikipedia; same trend on CC). Alleviated by scaling capacity (widening 768→960→1152 makes XLM-30 match XLM-7; 550M Large vs 270M Base) but not eliminated for 100 languages at moderate budgets.
- **High-resource vs low-resource trade-off (sampling α):** Language sampling rate ∝ (sentences)^α with α∈[0,1]. Higher α → more high-resource batches → better EN/FR, worse SW/UR and vice versa (Figure 5). Optimum α=0.3. Jurafsky & Martin (Ch 9, SLP3 Chapter 9: Masked Language Models (syllabus: 'The Transformer')) formalize it as $q_i = p_i^{\alpha}/\sum_j p_j^{\alpha}$ with $p_i = n_i/\sum_k n_k$ (Eq 9.5, Lample & Conneau 2019 / Conneau et al. 2020) applied to both batches and vocab construction — mitigating but not eliminating tokenization bias; the **accent effect** (Papadimitriou et al. 2023) persists: English structures bleed into other languages' representations. Same trade-off governs vocab construction. CommonCrawl (CC-100, 2.5TB filtered via cc_net + LID) increases low-resource data by orders of magnitude versus Wikipedia (log-scale GiB Figure 1) — few hundred MiB minimum needed for BERT pretraining; Wikipedia alone near random init for Swahili/Urdu, CC improves up to **10 points**.
- **Tokenization cost inequity (Ahia et al. 2023):** In [[source-do-all-languages-cost-same-tokenization]], analyzing OpenAI `cl100k_base` etc. on 22 languages with parallel FLORES-200, the same sentence requires **5× more tokens** in heavily fragmented scripts (Telugu, Amharic, Bengali, Tamil, non-Latin Indic) vs English, not solely due to data imbalance but UTF-8 bytes/char (Telugu 3 bytes vs English 1) and morphology. Commercial API pricing per token thus **4–5× more expensive** for XLSUM/XFACT prompting+ generation in Telugu/Amharic, while effective context shrinks (4,096 window fits 0 shots for Telugu majority vs multiple for English) → ICL utility lost (performance grows with k shots where fitting allows, extrapolated missed gain). Exacerbated socio-economically: most fragmented speakers have lowest GDP/HDI → least affordable charged most for poorest service.
- **Zero-shot cross-lingual transfer & translate-train:** Standard evaluation [[source-unsupervised-cross-lingual-representation-learning]] Section 4: fine-tune on English only and test on 14 other XNLI languages (true zero-shot). Baselines: translate-test (MT test to English, English model), translate-train per-language, translate-train-all (concat all MT training sets, cross-lingual augmentation). XLM-R Large cross-lingual **80.9% avg** vs mBERT 66.3 (+14.6), XLM-100 71.3 (+9.6), low-resource SW +15.7/+23.5, UR +11.4/+15.8; **translate-train-all 83.6% SOTA** (+5.1 over Unicoder 75.4) demonstrates multilingual can outperform monolingual when leveraging data from many languages (XLM-7 CC 80.0 vs monolingual CC 77.5 on 7 languages).

## How It Works
1. **Data curation (CC-100):** Following Wenzek et al. 2019, run LID (fastText + internal) on CommonCrawl dumps (1 dump EN, 12 dumps other 99 languages), train language models per language to filter documents. Yields 100 languages list Appendix A (EN 300.8 GiB down to low-resource). Wikipedia too small for representation learning for many languages.
2. **Tokenization:** SentencePiece Unigram directly on raw concatenated text, 250K vocab, full softmax. No language codes; simplifies deployment and code-switch handling.
3. **Pretraining:** Transformer (Base 12×768, Large 24×1024, 550M) with multilingual masked language modeling (MLM) only — no parallel TLM — RoBERTa-style longer training (1.5M updates, batch 8192 on 500×32GB V100). Under-tuning discovery: validation perplexity plateau ≠ downstream plateau (71.3→75% XNLI with longer training alone).
4. **Sampling:** Batches sampled with α=0.3 smoothed distribution; vocab built correspondingly.
5. **Fine-tuning & evaluation:** XNLI (15 langs), MLQA (7 langs, SQuAD extension Spanish/DE/AR/HI/VI/ZH), CoNLL NER (EN/NL/ES/DE), GLUE (English). Metrics: accuracy, F1, EM.
6. **Commercial deployment gap:** Ahia et al. evaluation adds cost = avg tokens × price, and ICL utility vs k (0→k shots) where token budget limits k, plus correlation with socio-economic indicators.

## Practical Implications
- **Model scaling decisions:** Doubling languages without doubling parameters harms high-resource performance; budget-constrained deployments must choose language coverage vs per-language quality — curse is still barrier for modest compute (Arivazhagan et al. 2019 MT similar). Solution is scaling width/vocab/CommonCrawl data, but costly.
- **Cost & fairness engineering:** When building LM-as-a-Service, report per-language fragmentation and equalize pricing (per-character/byte or parity-adjusted) rather than per-token; consider script-balanced vocab training, parity-aware BPE, larger byte-aware vocabularies — Ahia's recommendations for transparent pricing.
- **Benchmarking:** AI engineers should evaluate multilingual models with single-model selection (not per-language tuning, 0.6 drop) and with token-adjusted metrics; include fragmented languages in eval (not just EN/FR).
- **One-for-all viability:** XLM-R proof that single model can serve 100 languages competitively with monolingual models — GLUE dev **91.8** vs RoBERTa 92.8, BERTLarge 90.2, XLNet 92.0 — within 1%; NER **90.24** vs Flair without CRF; MLQA **70.7/52.7** vs previous 61.6/43.5. Enables simplified deployment vs 100 monolingual models.
- **Low-resource strategy:** Investing in filtered web-scale CC data more impactful than model tweaks for SW/UR; transfer from related high-resource helps but cannot replace in-language data scale.

## Connections
- **To [[tokenization]]:** Joint BPE origin (Sennrich) → SentencePiece 250K (Conneau) → Ahia critique of residual 5× inequity even with 250K; tokenization directly causes cost, context, and utility gaps. See also [[source-layer-normalization]] for stability on longer fragmented sequences.
- **To [[transformer]] & [[pretraining]]:** Multilingual MLM uses same Transformer backbone with layer normalization for stable long-sequence dynamics; scaling laws apply per-language but diluted.
- **To [[evaluation]]:** Benchmarks XNLI, MLQA, NER, GLUE, XLSUM/XFACT/CROSSUM etc.; evaluation methodology translate-test/train nuances.
- **To [[llm-bias]] / [[evaluation]]:** Tokenization price discrimination is emergent economic bias; compounds geographic/digital divide.
- **To [[embeddings]] & [[self-attention]]:** Shared subword embeddings learn cross-lingual alignment; $O(N^2)$ attention cost amplified for fragmented languages.

## Open Questions
- Can curse of multilinguality be eliminated without linear capacity growth — via Mixture-of-Experts (e.g., sparsely-gated), language-specific adapters, or retrieval-augmentation?
- How to achieve script-parity tokenization without 512K+ vocab explosion or per-script normalization — is byte-level patching viable?
- Will scale to 200+ languages, very low-resource where even CC has <100 MiB, require different objectives (contrastive, parallel-data TLM reintroduced)?
- Should commercial APIs adopt per-information pricing and if so how to define equivalence across typologically distant languages?
- How do generative LLMs (ChatGPT, BLOOMZ) trade off monolingual fluency vs cross-lingual transfer when instruction-tuned on English-heavy data?

## Sources
- [[source-neural-machine-translation-subword-units]]
- [[source-unsupervised-cross-lingual-representation-learning]]
- [[source-do-all-languages-cost-same-tokenization]]
- [[source-bert-pre-training-of-deep-bidirectional-transformers]] — mBERT predecessor (Devlin et al. 2018) for context

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
