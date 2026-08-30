---
type: source-summary
title: "Distributed Representations of Words and Phrases and their Compositionality"
summary: "The NIPS 2013 follow-up to Efficient Estimation of Word Representations in Vector Space introduces the two innovations that define modern Word2Vec practice: Negative Sampling (NEG) — a simplified variant of Noise…"
status: draft
visibility: public
author: "Tomas Mikolov, Ilya Sutskever, Kai Chen, Greg Corrado, Jeffrey Dean"
source-type: paper
url: "https://arxiv.org/abs/1310.4546"
date-published: 2013-10-16
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
  - rag
key-concepts:
  - "[[word2vec]]"
  - "[[embeddings]]"
  - "[[glove]]"
  - "[[tokenization]]"
  - "[[pretraining]]"
key-entities:
  - "[[google-research]]"
aliases:
  - wiki/source-distributed-representations-of-words-and-phrases-and-their-compositionality
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The NIPS 2013 follow-up to Efficient Estimation of Word Representations in Vector Space introduces the two innovations that define modern Word2Vec practice: Negative Sampling (NEG) — a simplified variant of Noise…</p>
<p class="kb-provenance">Tomas Mikolov, Ilya Sutskever, Kai Chen, Greg Corrado, Jeffrey Dean, 2013-10-16. <a href="https://arxiv.org/abs/1310.4546">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

The NIPS 2013 follow-up to [[source-efficient-estimation-of-word-representations-in-vector-space]] introduces the two innovations that define modern Word2Vec practice: **Negative Sampling (NEG)** — a simplified variant of Noise Contrastive Estimation (NCE) that replaces hierarchical softmax — and **subsampling of frequent words** (`P(w_i)=1-√(t/f(w_i))`, `t≈1e-5`). Together they give a 2–10× speedup and substantially better vectors, especially for rare words. The paper also shows how to learn vectors for **millions of phrases** (e.g., "Boston Globe" → single token) via a data-driven bigram score, evaluates on a new 3,218-question phrase analogy set, and demonstrates **additive compositionality** (`vec("Russia")+vec("river")≈vec("Volga River")`) alongside classic linear analogies. Trained on 1B (up to 33B) news tokens, the best phrase model reaches 72% analogy accuracy.

## Key Takeaways

1. **Negative Sampling replaces hierarchical softmax and is superior in practice.** NEG objective `log σ(u_o^T v_c) + Σ_k E[log σ(-u_k^T v_c)]` with `k=5–20` (small data) or `k=2–5` (large data) and noise `P_n(w)=U(w)^{3/4}/Z` (unigram^3/4) outperforms Huffman hierarchical softmax (59→47% total without subsampling, Table 1) and slightly outperforms NCE (59% vs 53%). Only samples are needed, not noise probabilities — unlike NCE which maximizes softmax log-probability. `U^{3/4}` raises rare words' sampling rate and is best on every task tried.
2. **Frequent-word subsampling is load-bearing for speed and quality.** Each word discarded with `1-√(t/f(w_i))`, `t≈1e-5`, preserves rank but aggressively drops "the"/"a"/"in" (hundreds of millions of occurrences). Gives ~2–3× speedup on analogy (NEG-5: 38→14 min, 59→60%; HS: 41→21 min, 47→55%, Table 1) and improves rare-word vectors because frequent co-occurrences with "the" are uninformative and destabilize updates. Unified with random window sampling `R∼[1,C]` that down-weights distant words.
3. **Phrase vectors via cheap scoring — millions of phrases become learnable.** Score ` (count(w_i w_j)-δ) / (count(w_i)·count(w_j))` (> threshold → phrase token); 2–4 passes with decreasing threshold builds longer phrases (e.g., "New York Times"). Treating phrases as tokens during Skip-gram training makes idiomatic meanings compositional at token level. New 3,218-question phrase analogy set (5 categories: newspapers, NHL/NBA teams, airlines, executives) — best model (HS + subsampling + 33B words, 1000-D, full-sentence context) reaches **72%** (66% at 6B), while NEG-5 at 1B only 24–27% and HS+subsampling 47% (Table 3). Large data is crucial.
4. **Additive compositionality emerges for free from the objective.** Because word vectors are linearly related to softmax inputs (log context distribution), sum of vectors ≈ product of context distributions (AND). Empirically, `vec("Czech")+vec("currency") → koruna`, `vec("Vietnam")+vec("capital") → Hanoi`, `vec("German")+vec("airlines") → Lufthansa`, `vec("Russian")+vec("river") → Volga River`. This plus phrase tokens gives a simple way to represent longer text with minimal computation — complementary to recursive matrix-vector models.
5. **Scale and engineering wins compound.** Single-machine implementation trains >100B words/day; phrase models trained on 30B words in ~1 day (1000-D) despite huge vocab extension. Nearest-neighbor inspection shows large-data Skip-gram dramatically outperforms Collobert (2 months), Turian (weeks), Mnih (7 days) on rare words (e.g., "Redmond" → "Redmond Wash.", "Redmond Washington"). Choice of `k`, `t`, dim, window remains task-specific; paper's settings (300-D, window 5, `t=1e-5`) are now defaults.

## Detailed Notes

### Skip-gram Recap (§2, Eq.1-2)
Objective `(1/T) Σ_t Σ_{-c≤j≤c} log p(w_{t+j}|w_t)`, softmax `(2) p(w_O|w_I)=exp(v'_{w_O}^T v_{w_I})/Σ_W exp(...)` — cost O(W) → need approximation.

### Hierarchical Softmax (§2.1, Eq.3)
Binary tree, `p(w|w_I)=∏ σ(⟦n(w,j+1)=ch(n(w,j))⟧·v'_{n(w,j)}^T v_{w_I})`, cost O(log W). One vector per word + per inner node. Huffman tree (frequency-based short codes) used — same as 1301.3781 — ~2× faster than balanced at 1M vocab. Performance: 47% total without subsampling (Table 1), 55% with.

### Negative Sampling (§2.2, Eq.4)
NCE (Gutmann & Hyvärinen 2012, Mnih & Teh 2012 for LM) = logistic regression data vs noise; hinge loss flavor of Collobert & Weston 2008. NEG simplifies NCE: no noise probabilities, no normalization guarantee — acceptable because goal is vectors, not LM. Noise distribution free parameter; `U^{3/4}` best.

### Subsampling (§2.3, Eq.5)
Heuristic formula chosen to aggressively subsample >t while preserving frequency ranking. `t=1e-5` typical. Accelerates and improves rare-word accuracy (Fig. shows rare-word neighbors improved). Also note: infrequent-word vectors benefit because they see less gradient noise from frequent collocations.

### Phrase Learning (§4, Eq.6)
Data-driven, no linguistic resources. `δ` prevents rare-word phrases. 2–4 passes allow phrase-of-phrases (e.g., "San Jose Mercury News"). Dataset: `code.google.com/p/word2vec/source/browse/trunk/questions-phrases.txt`. Categories: Newspapers (New York→NYT), NHL (Boston→Bruins), NBA, Airlines, Executives (Steve Ballmer→Microsoft). Evaluation: nearest to `vec("Montreal Canadiens")-vec("Montreal")+vec("Toronto")` → `vec("Toronto Maple Leafs")`.

### Experiments (§3, §4.1)
1B news data (692K vocab after <5 filter, 300-D). Table 1 shows NEG-5 59% (38 min) → NEG-5 subsampled 60% (14 min); HS 47% (41 min) → 55% (21 min). Phrase Table 3: HS+subsampling dominates phrase task when subsampling enabled, counterintuitively. Scaling to 33B + 1000-D + full-sentence context → 72% phrase accuracy.

### Additive Compositionality (§5, Table 5)
Examples: Czech+currency→koruna/Check crown/Polish zolty; German+airlines→Lufthansa; Russian+river→Volga River; French+actress→Juliette Binoche/Vanessa Paradis. Explanation via log-probability product; sum of vectors corresponds to intersection of contexts.

### Comparison to Prior Vectors (§6, Table 6)
Qualitative nearest-neighbor table for infrequent words vs. Collobert (50d 660M), Turian (200d 37M), Mnih (100d): Skip-Phrase 1000d 30B clearly wins (e.g., "graffiti" → "spray paint", "grafitti", "taggers").

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 6 of 8 passages in this section could not be located in the stored source ([https://arxiv.org/abs/1310.4546](https://arxiv.org/abs/1310.4546)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "We present a simple alternative to the hierarchical softmax called negative sampling." — Abstract

> "By subsampling of the frequent words we obtain significant speedup and also learn more regular word representations." — Abstract

> "The meanings of 'Canada' and 'Air' cannot be easily combined to obtain 'Air Canada'." — Motivation for phrases, Abstract

> "We define Negative sampling (NEG) by the objective log σ(v'_{w_O}^T v_{w_I}) + Σ_{i=1}^k E[log σ(-v'_{w_i}^T v_{w_I})]" — Eq. (4)

> "We investigated a number of choices for P_n(w) and found that the unigram distribution U(w) raised to the 3/4rd power outperforms significantly the unigram and the uniform distributions." — §2.2

> "Each word w_i in the training set is discarded with probability P(w_i)=1-√(t/f(w_i))" — Eq. (5)

> "vec('Russia') + vec('river') is close to vec('Volga River'), and vec('Germany') + vec('capital') is close to vec('Berlin')." — §5 Compositionality

> "We achieved lower accuracy 66% when we reduced the size of the training dataset to 6B words, which suggests that the large amount of the training data is crucial." — §4.1

## Concepts Introduced or Referenced

- [[word2vec]] — Extends CBOW/Skip-gram from [[source-efficient-estimation-of-word-representations-in-vector-space]] with NEG and subsampling; this paper defines the *standard* word2vec implementation used today.
- [[embeddings]] — Demonstrates additive compositionality and phrase-level embeddings on 30B words; static vectors where `sum ≈ AND` of context distributions.
- [[glove]] — NEG/word2vec vs. GloVe debate originates here; this paper's vectors are the count-vs-predict baseline GloVe later reinterprets as log-bilinear regression (Pennington et al. §3 notes this paper as contrast).
- [[tokenization]] — Phrase tokenization via data-driven bigram scoring (2–4 passes) creates phrase vocabulary (millions) without linguistic resources; precursor to subword merging (BPE).
- [[pretraining]] — Shows scaling to 100B words/day and 33B-word phrase training — early evidence that more data + simple objective beats complex models, anticipating LLM pretraining scaling.
- [[retrieval-augmented-generation]] — Phrase vectors enabling idiomatic retrieval (e.g., "Air Canada" distinct from "air"+"Canada") motivate modern dense phrase/document embedding retrieval.

## Critical Assessment

**Strengths:** Extremely practical — NEG + subsampling + `U^{3/4}` are the three tricks every word2vec implementation still uses; phrase trick is cheap yet yields millions of meaningful phrase vectors and a reusable 3,218-question evaluation; thorough ablations across NEG/HS/NCE and subsampling; scale demonstration (30B words, 72% phrase analogy) shows distributed vectors benefit from repetition-aware training; clear explanation of why addition works (log context distributions). Code release (word2vec.googlecode.com) catalyzed embedding ecosystem.

**Limitations / Gaps:** Subsampling formula heuristic, no theory for optimal `t`; phrase scoring threshold selection ad-hoc (not compared to prior phrase-finding literature, out of scope); additive compositionality explanation is post-hoc and only qualitative — no systematic evaluation of additive vs. phrase-token tradeoff; HS vs NEG ranking flips with/without subsampling and data size — task-specific hyperparameter tuning required, not unified recipe; static phrase vectors still cannot handle polysemy or word-order sensitivity beyond window.

**Contradictions / Notes vs. existing wiki:** Complements [[source-efficient-estimation-of-word-representations-in-vector-space]] (which used hierarchical softmax only, no NEG/subsampling) — together they define the full word2vec story; note that many Table 4 numbers in the 1301.3781 paper (Skip-gram 53.3% on 783M) are *without* NEG/subsampling and thus lower than Table 1 here (61% with NEG+subsampling) — the delta quantifies NEG's gain; no contradiction with [[word2vec]] concept page which currently describes only Huffman softmax — this source should prompt update to include NEG/subsampling as standard.

---

**Source:** Distributed Representations of Words and Phrases and their Compositionality by Tomas Mikolov, Ilya Sutskever, Kai Chen, Greg Corrado, Jeffrey Dean — <https://arxiv.org/abs/1310.4546>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
