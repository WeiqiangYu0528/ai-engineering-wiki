---
type: source-summary
title: "Unsupervised Cross-lingual Representation Learning at Scale"
summary: The April 2020 Facebook AI paper that introduced XLM-R (XLM-RoBERTa), a Transformer-based multilingual masked language model trained on 100 languages using 2.5 TB of filtered CommonCrawl (CC-100).
status: draft
visibility: public
author: "Alexis Conneau, Kartikay Khandelwal, Naman Goyal, Vishrav Chaudhary, Guillaume Wenzek, Francisco Guzmán, Edouard Grave, Myle Ott, Luke Zettlemoyer, Veselin Stoyanov (Facebook AI)"
source-type: paper
url: "https://arxiv.org/abs/1911.02116"
date-published: 2019-11-05
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
  - open-source
key-concepts:
  - "[[multilinguality]]"
  - "[[tokenization]]"
  - "[[pretraining]]"
  - "[[transformer]]"
key-entities:
  - "[[meta]]"
  - "[[huggingface]]"
aliases:
  - wiki/source-unsupervised-cross-lingual-representation-learning
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The April 2020 Facebook AI paper that introduced XLM-R (XLM-RoBERTa), a Transformer-based multilingual masked language model trained on 100 languages using 2.5 TB of filtered CommonCrawl (CC-100).</p>
<p class="kb-provenance">Alexis Conneau, Kartikay Khandelwal, Naman Goyal, Vishrav Chaudhary, Guillaume Wenzek, Francisco Guzmán, Edouard Grave, Myle Ott, Luke Zettlemoyer, Veselin Stoyanov (Facebook AI), 2019-11-05. <a href="https://arxiv.org/abs/1911.02116">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary
The April 2020 Facebook AI paper that introduced **XLM-R (XLM-RoBERTa)**, a Transformer-based multilingual masked language model trained on 100 languages using **2.5 TB of filtered CommonCrawl (CC-100)**. By scaling data two orders of magnitude over Wikipedia for low-resource languages, increasing model capacity (270M Base / 550M Large, 250K SentencePiece vocab, 1.5M updates, batch 8192 on 500 V100s), and systematically studying sampling and vocabulary trade-offs, XLM-R significantly outperforms mBERT and XLM-100: **+14.6% avg accuracy on XNLI, +13% F1 on MLQA, +2.4% F1 on NER**, with +15.7% (Swahili) and +11.4% (Urdu) gains. The paper formalizes the **curse of multilinguality** (positive transfer vs capacity dilution trade-off), the **high-resource vs low-resource sampling trade-off (α)**, and shows for the first time a single multilingual model competitive with monolingual RoBERTa on GLUE without sacrificing per-language performance.

## Key Takeaways
1. **Scale cures low-resource but exposes curse of multilinguality:** For fixed capacity, adding languages initially helps low-resource via positive transfer (XLM-7→15 improves), but beyond ~15 languages overall XNLI accuracy drops 71.8%→67.7% (Wiki, BERTBase 150K vocab). Adding capacity alleviates: widening model (768→960→1152 hidden) makes XLM-30 match XLM-7; 250K→512K vocab adds >3% avg even at fixed Transformer size, showing embedding capacity matters.
2. **CommonCrawl at scale is essential:** CC-100 increases data orders of magnitude versus Wiki (Figure 1, log-scale GiB). For same BERTBase, CC-trained models significantly outperform Wiki, especially low-resource (Burmese, Swahili). Wikipedia corpora too small (<few hundred MiB) to enable unsupervised representation learning for SW/UR, performing near random init.
3. **Language sampling α=0.3 balances high vs low resource:** Sampling rate ∝ (sentences)^α smoothed. Higher α samples high-resource (EN,FR) more → better high-resource, worse low-resource (SW,UR) and vice versa. α=0.3 optimal overall. Same trade-off governs shared subword vocab construction.
4. **Vocabulary matters at fixed capacity:** At constant total parameters (adjusting Transformer width), scaling vocab 32K→256K yields +2.8% XNLI avg; 128K→512K yields +3% — allocating more parameters to embeddings outweighs smaller Transformer for 100 languages. XLM-R uses 250K SentencePiece Unigram on raw text (no language-specific tokenization), simplifies pipeline with no loss vs BPE+tokenization, handles code-switching by removing language embeddings.
5. **Strong cross-lingual and monolingual results:** Cross-lingual transfer ( fine-tune on English, test on 15 XNLI languages): **XLM-R Large 80.9% avg** vs mBERT 66.3, XLM-100 71.3; low-resource +15–23%. With translate-train-all (concat all MT training sets) reaches **83.6% SOTA** (+5.1% over Unicoder). MLQA 70.7/52.7 F1/EM vs previous 61.6/43.5, +13.0 over mBERT, even beats BERT-Large on English (80.6/67.8). NER CoNLL 80.94 F1 cross-lingual (+2.42 over mBERT), 90.24 per-language. GLUE dev avg **91.8** vs BERTLarge 90.2, XLNet 92.0, RoBERTa 92.8 — within 1% of monolingual SOTA, proving one-for-all possible. Multilingual can outperform monolingual when leveraging data from multiple languages (translate-train-all XLM-7 CC 80.0 vs monolingual CC 77.5 on 7 languages).

## Detailed Notes

### Model & Data
- **Objective:** Multilingual MLM only (no TLM, no parallel data, no language embeddings). Follow XLM (Lample & Conneau 2019) but upgraded.
- **Tokenization:** SentencePiece Unigram LM directly on raw text, 250K vocab, full softmax. Easier deployment, robust to [https://arxiv.org/abs/1911.02116](https://arxiv.org/abs/1911.02116) web text.
- **Architecture:** XLM-R Base L12 H768 A12 270M, XLM-R L24 H1024 A16 550M; ablations BERTBase 150K vocab.
- **CC-100 construction:** Following Wenzek et al. 2019 (cc_net): internal LID + fastText, language models per language to filter documents, 1 CC dump for English, 12 dumps for other 99 languages. 100 languages list Appendix A (EN 300.8 GiB, RU 278, JA, DE … down to low-resource). Covers romanized Hindi, traditional Chinese.
- **Training:** 1.5M updates, 500×32GB V100, batch 8192, RoBERTa-style longer training (found Lample & Conneau under-tuned when stopping by perplexity plateau — downstream keeps improving).

### Analysis Figures (Section 5.1)
- **Figure 2 Transfer-dilution:** XNLI vs #languages (7,15,30,100) fixed capacity.
- **Figure 3 CC vs Wiki:** XLM-7 significantly better on CC, especially low-resource.
- **Figure 4 Capacity scaling:** Wider transformer alleviates curse up to 30 languages, insufficient for 100.
- **Figure 5 α sampling trade-off:** high-resource vs low-resource crossover.
- **Figure 6 Vocab size:** At fixed or increasing capacity, larger vocab helps.
- **Figure 7 Large-scale training & SPM simplification:** Longer training + larger batches + raw SPM no loss.

### Evaluation Details
- **XNLI:** 15 languages ground-truth dev/test, English train MT to 14 others. Compare translate-test, translate-train per-language, translate-train-all. Note #M (number of models for selection) — N per-language models 71.3 vs 1 joint 70.7 (0.6 drop), community should use single.
- **NER:** CoNLL-2002/2003 EN, NL, ES, DE; settings (1) English only (2) each (3) all. Without CRF still beats Flair (Akbik et al. 2018) on Dutch by 2.09.
- **MLQA:** Extend SQuAD to ES,DE,AR,HI,VI,ZH; fine-tune on English SQuAD, eval 7 languages.
- **GLUE:** MNLI-m/mm, QNLI, QQP, SST, MRPC, STS-B.

### Key Numbers
- XNLI cross-lingual transfer: rows Wiki+MT N15 Unicoder 75.4, mBERT Wiki 102 66.3, XLM-100 71.3, **XLM-R Base 76.2, XLM-R 80.9**; translate-train-all: **XLM-R 83.6** (+5.1). Low-resource SW 58.0→73.9, UR 62.4→73.8.
- NER: mBERT each 88.28 avg, en 78.52; **XLM-R each 90.24, en 80.94, all 89.43**.
- QA: mBERT 57.7/41.6, XLM-15 61.6/43.5, XLM-R Base 63.7/46.3, **XLM-R 70.7/52.7**.
- GLUE dev: RoBERTa 92.8, XLM-R 91.8, XLNet 92.0, BERTLarge 90.2.
- Monolingual vs multilingual (7 langs BERTBase): monolingual Wiki 73.4 CC 77.5 vs XLM-7 transfer Wiki 71.8 CC 76.2 ( monolingual +1.3) but translate-train-all CC 80.0 (+2.5 over monolingual).

### Low-resource Representation Learning
- Wiki pretraining for SW/UR near random init due tiny data; CC improves up to 10 points. In translate-train-all biggest gains for CC vs Wiki on SW +7% and UR +4.8%.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 3 passages in this section could not be located in the stored source ([https://arxiv.org/abs/1911.02116](https://arxiv.org/abs/1911.02116)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "More languages leads to better cross-lingual performance on low-resource languages up until a point, after which the overall performance on monolingual and cross-lingual benchmarks degrades. We refer to this tradeoff as the *curse of multilinguality*, and show that it can be alleviated by simply increasing model capacity."

> "We also present, for the first time, the possibility of multilingual modeling without sacrificing per-language performance; XLM-R is very competitive with strong monolingual models on the GLUE and XNLI benchmarks."

> "We train a Sentence Piece model and apply it directly on raw text data for all languages. We did not observe any loss in performance ... and hence use SPM for XLM-R."

## Concepts Introduced or Referenced
- [[multilinguality]] — Curse of multilinguality, positive transfer vs capacity dilution, high vs low-resource trade-off, CC-100 dataset.
- [[tokenization]] — Shared subword vocab capacity, SentencePiece Unigram vs BPE, 250K vocab, fragmentation (see [[source-do-all-languages-cost-same-tokenization]] for unfairness persistence even with 250K).
- [[transformer]] — Scaling width/vocab for 100 languages, RoBERTa training recipe (large batches, longer steps).
- [[pretraining]] — Unsupervised MLM at scale, CommonCrawl filtering with LM, importance of not stopping by perplexity.
- [[evaluation]] — XNLI, MLQA, NER, GLUE benchmarks; cross-lingual transfer vs translate-train.

## Critical Assessment
- **Strengths:** First systematic isolation of scaling factors for multilingual MLM; massive public CC-100 and models (fairseq) enabled follow-ups; rigorous ablations separating transfer, vocab, sampling, data scale; proof that one model can serve 100 languages competitively.
- **Limitations:** Still insufficient data for many of 100 languages (<100 MiB even after CC); curse persists for moderate budgets — 550M params not enough for 100 languages at highest performance; 250K vocab softmax costly; no analysis of tokenizer fairness across scripts (Ahia et al. 2023 later shows XLM-R still fragments non-Latin scripts more, though less than GPT tokenizers); evaluation limited to classification/sequence labeling/QA, not generation.
- **Evolution:** Successor XLM-R XL/XXL, InfoXLM, mT5, NLLB scale further. Ahia et al. 2023 complementary: even with 250K, language cost disparity persists and correlates with socioeconomic disadvantage. LN paper's sequence length limitation note applies here — longer sequences for fragmented languages hurt few-shot utility (Ahia Figure 6).

---

**Source:** Unsupervised Cross-lingual Representation Learning at Scale by Alexis Conneau, Kartikay Khandelwal, Naman Goyal, Vishrav Chaudhary, Guillaume Wenzek, Francisco Guzmán, Edouard Grave, Myle Ott, Luke Zettlemoyer, Veselin Stoyanov (Facebook AI) — <https://arxiv.org/abs/1911.02116>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
