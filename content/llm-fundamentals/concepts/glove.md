---
type: concept
title: "GloVe"
summary: "GloVe (Global Vectors for Word Representation) is a count-based yet predictive embedding model introduced by Pennington, Socher & Manning (Stanford, EMNLP 2014, GloVe: Global Vectors for Word Representation) that learns…"
visibility: public
aliases:
  - Global Vectors
  - Global Vectors for Word Representation
  - "GloVe: Global Vectors for Word Representation"
  - wiki/glove
tags:
  - llm-fundamentals
  - rag
created: 2026-08-25
updated: 2026-08-26
status: draft
sources:
  - "[[source-glove-global-vectors-for-word-representation]]"
  - "[[source-cs224n-word-vectors-ii-glove-evaluation]]"
  - "CS224N 2026 Lecture 2: Word Vectors (Slides) — Word2Vec, Negative Sampling, GloVe, Evaluation"
  - "[[source-distributed-representations-of-words-and-phrases-and-their-compositionality]]"
  - "[[source-efficient-estimation-of-word-representations-in-vector-space]]"
  - "[[source-improving-distributional-similarity]]"
related:
  - "[[word2vec]]"
  - "[[embeddings]]"
  - "[[tokenization]]"
  - "[[pretraining]]"
  - "[[retrieval-augmented-generation]]"
  - "[[self-attention]]"
  - "[[transformer]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">GloVe (Global Vectors for Word Representation) is a count-based yet predictive embedding model introduced by Pennington, Socher &amp; Manning (Stanford, EMNLP 2014, GloVe: Global Vectors for Word Representation) that learns…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/word2vec">Word2Vec</a></li><li><a href="/llm-fundamentals/concepts/embeddings">Embeddings</a></li><li><a href="/llm-fundamentals/concepts/tokenization">Tokenization</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-glove-global-vectors-for-word-representation">GloVe: Global Vectors for Word Representation</a></li><li><a href="/llm-fundamentals/sources/source-cs224n-word-vectors-ii-glove-evaluation">CS224N Lecture Notes Part II: Word Vectors II — GloVe, Evaluation and Training</a></li><li><a href="/llm-fundamentals/sources/source-distributed-representations-of-words-and-phrases-and-their-compositionality">Distributed Representations of Words and Phrases and their Compositionality</a></li><li><a href="/llm-fundamentals/sources/source-efficient-estimation-of-word-representations-in-vector-space">Efficient Estimation of Word Representations in Vector Space</a></li><li><a href="/llm-fundamentals/sources/source-improving-distributional-similarity">Improving Distributional Similarity with Lessons Learned from Word Embeddings</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview

**GloVe (Global Vectors for Word Representation)** is a count-based yet predictive embedding model introduced by Pennington, Socher & Manning (Stanford, EMNLP 2014, [[source-glove-global-vectors-for-word-representation]]) that learns dense word vectors by **weighted least-squares regression on the global word-word co-occurrence matrix**, rather than by scanning local windows with a softmax. Its objective — `J = Σ_{i,j} f(X_ij)(w_i^T w̃_j + b_i + b̃_j - log X_ij)^2` with `f(x)=(x/100)^{3/4}` if `x<100` else `1` — is explicitly derived to make **ratios of co-occurrence probabilities** `P(k|ice)/P(k|steam)` linear in vector space (e.g., `k=solid` ratio 8.9 vs `k=gas` 8.5e-2, Table 1, 6B tokens), explaining the origin of regularities like `king - queen ≈ man - woman` that [[word2vec]] had only demonstrated empirically. GloVe combines the statistical efficiency of global matrix factorization (LSA, HAL) with the linear substructure of window methods, reaching **75% total analogy accuracy** on the 19,544-question Mikolov test (vs 53% Skip-gram/36% CBOW at 783M) and consistently outperforming Word2Vec given same corpus/vocab/window/time, while training only on non-zero `X` entries.

## Key Ideas

- **Ratio, not probability, is the right signal for meaning components.** Raw `P(k|ice)` and `P(k|steam)` both ≈3e-3 for `k=water` (uninformative) and ~1e-5 for `k=fashion`; only `P(k|ice)/P(k|steam)` cancels noise from non-discriminative probes and separates `solid` (ice) from `gas` (steam). The paper shows this ratio is better at discriminating relevant vs. irrelevant and between relevant words, and argues word-vector learning should start from it rather than raw probabilities.
- **Derivation from desiderata → log-bilinear form.** Require `F(w_i,w_j,w̃_k)=P_ik/P_jk` (Eq.1) to depend only on difference `(w_i-w_j)^T w̃_k` (Eq.2-3) for linearity, then enforce homomorphism `F((w_i-w_j)^T w̃_k)=F(w_i^T w̃_k)/F(w_j^T w̃_k)` for `w↔w̃, X↔X^T` exchange symmetry → `F=exp` → `w_i^T w̃_k = log P_ik = log X_ik - log X_i` (Eq.6). Absorb `log X_i` into bias `b_i`, add `b̃_k` → **`w_i^T w̃_j + b_i + b̃_j = log X_ij`** (Eq.7). Ill-defined for `X_ij=0` (log diverges) but weighting sidesteps it.
- **Weighted least squares with capped weighting is the engineering core.** Objective `J = Σ f(X_ij)(w_i^T w̃_j + b_i + b̃_j - log X_ij)^2` (Eq.8). `f` must satisfy: `f(0)=0` → train only on non-zero `X` (sparse — 1 pass to build `X`, then iterate over non-zeros, not corpus windows), non-decreasing (rare pairs not overweighted), and capped at 1 for large `X_ij` (frequent pairs span 8-9 orders, not overweighted). Choice `f(x)=(x/100)^{3/4}` if `x<100` else `1` (Eq.9, `x_max=100, α=3/4`, Fig.1) mirrors Word2Vec's `U^{3/4}` noise distribution for same dynamic-range reason. Training via AdaGrad, 50 iterations, shuffling; 6B-token `X` with 400K vocab is sparse and fast.
- **Empirically superior under controlled comparison.** On GigaWord5+Wikipedia 2014 (6B tokens, 400K vocab, symmetric window 10): GloVe 50D 33% →100D 51% →200D 62% →300D **75%** analogy total (semantic 81%, syntactic 69%); CBOW/Skip-gram lower at each dim. Corpus scaling 1B (59%) →6B (75%) →42B Common Crawl (77%) shows diminishing returns after 6B. WordSim353 similarity Spearman ~60-70% (vs 50-60% for Word2Vec/SVD); CoNLL03 NER F1 88.81 (GloVe 50D) vs 88.5 Skip-gram vs 88.32 CBOW vs 88.2 random — consistent win with `w + w̃` sum vs `w` alone. Notes §1.4: "consistently outperforms word2vec ... given same corpus, vocabulary, window size, and training time. It achieves better results faster, and also obtains the best results irrespective of speed" ([[source-cs224n-word-vectors-ii-glove-evaluation]]).
- **Caveat from the hyperparameter audit ([[source-improving-distributional-similarity]]).** Levy et al. (TACL 2015) show that much of the reported gap between embedding families — including GloVe-vs-SGNS comparisons — stems from system design choices and hyperparameter tuning (window size, sub-sampling, negative-sampling count) rather than the algorithms themselves; tuned count-based PPMI+SVD pipelines match predictive models with "mostly local or insignificant performance differences... no global advantage to any single approach." Read together: GloVe's derivation explains *why* linear structure exists, but family-level rankings should be treated as configuration-sensitive, not architectural verdicts.
- **Unifies two families and explains Word2Vec's success.** Related work: LSA (term-document) and HAL/COALS/PPMI/HPCA (term-term) compress counts but lack analogy linearity; Bengio 2003, CBOW/Skip-gram, vLBL/ivLBL learn via local predictions but ignore global repetition. §3.3 shows Skip-gram can be re-expressed as weighted cross-entropy over `X`, but softmax normalization is bottleneck; GloVe replaces normalization with least squares on logs — faster, more stable (AdaGrad, shuffling), leverages repetition.

## How It Works

```
Corpus (6B tokens, window 10 symmetric)
        │
        ▼ (1 pass)
Co-occurrence matrix X (V=400K, sparse)
  X_ij = # j in context of i
  X_i = Σ_k X_ik ,  P_ij = X_ij / X_i
        │
        ▼ Example ratios (Table 1)
  i=ice, j=steam, k=solid/water/gas/fashion
  P(k|ice)/P(k|steam): 8.9 / 0.085 / 1.36 / 0.96
  → motivates ratio as signal
        │
        ▼ Derivation
  F((w_i - w_j)^T w̃_k)=P_ik/P_jk
  → F=exp → w_i^T w̃_k + b_i + b̃_k = log X_ik
        │
        ▼ Weighted least squares (GloVe)
  J = Σ_{i,j: X_ij>0} f(X_ij)(w_i^T w̃_j + b_i + b̃_j - log X_ij)^2
  f(x)=(x/100)^{0.75} if x<100 else 1
  Train: AdaGrad, shuffle non-zeros, 50 iters
        │
        ▼
Vectors: W (word) + W̃ (context), often final = W + W̃
        │
        ▼
Inference: cosine nearest neighbor, analogy
  vec("king")-vec("man")+vec("woman") ≈ vec("queen")
  75% on 19,544 Mikolov questions
```

**Hyperparameters:** `x_max=100`, `α=3/4` (stable broad optimum), window 10 symmetric, dim 50-300 (300 best), vocab 400K (capped), AdaGrad init 0.05, final vectors sum `w + w̃` (+2-3% over `w` alone). Biases `b_i, b̃_j` learn log frequency offsets.

**Alternative hacks (from slides, §2):** Raw counts span 8-9 orders → log, `min(X,100)`, ignore function words, ramped windows, correlation→0 for negatives — all predecessors that GloVe's `f` subsumes more principledly.

## Practical Implications

- **When to choose GloVe vs. Word2Vec:** Given same data/compute, GloVe is faster to best accuracy and more sample-efficient on analogy; Word2Vec (NEG/subsampling) is simpler to implement streaming without building `X`. Modern practice often uses pretrained GloVe (e.g., `glove.6B.300d`, `glove.42B.300d` at `nlp.stanford.edu/projects/glove/`) as frozen features for retrieval/classification where count-based stability helps, while contextual [[transformer]] embeddings dominate for polysemy.
- **Retrieval and NER backbone before dense retrievers:** GloVe vectors as features for [[retrieval-augmented-generation]] (similarity search via cosine) and sequence labeling (NER window classification) show that global log-bilinear pretraining transfers to extrinsic tasks — explicit evaluation science (intrinsic analogy/WordSim353 correlation vs extrinsic NER F1) in CS224N notes §2.
- **Engineering:** Build `X` once (expensive but amortized), then train only on non-zeros (sparse) — contrast with Word2Vec's per-window SGD. Need AdaGrad for infrequent pairs (like Word2Vec's Adagrad/DistBelief). OOV still unrepresentable (later fixed by FastText subwords); polysemy still unsolved (bank river vs finance → contextual embeddings).
- **Scaling lesson:** Dim and corpus must scale together (Table 2 theme from Word2Vec notes) — 50D plateaus at 1B, 300D needs 6B; Common Crawl 42B → only 75%→77% shows count-based saturates earlier than predictive scaling suggests.

## Connections

- **Direct successor and foil to [[word2vec]].** Both produce static [[embeddings]]; GloVe re-derives Word2Vec's empirical linear regularities from first principles and replaces NEG/Huffman softmax + subsampling with `f(X_ij)` weighting + AdaGrad. Paper §3.3 and CS224N notes §1.3 show Skip-gram's objective is implicitly a weighted cross-entropy over `X` — GloVe makes it explicit and avoids softmax denominator. GloVe outperforms Word2Vec in controlled experiments but shares its static, word-level [[tokenization]] limits.
- **Produces [[embeddings]] (distributed representations).** One vector (actually `w + w̃`) per type, like Word2Vec; used identically as lookup `W_e ∈ ℝ^{V×D}` for retrieval, analogy, similarity, and as first layer features for NER/CRF.
- **Consumed by [[pretraining]] / [[retrieval-augmented-generation]] / [[transformer]] pipelines.** Same self-supervised pretraining story as Word2Vec (predict log co-occurrence instead of context), same retrieval use (cosine search over `W_e`), but contextual [[self-attention]] transformers later learn `w_i` per *occurrence* to fix polysemy that GloVe shares with Word2Vec.
- **Evaluation methodology shared.** Uses Mikolov's 19,544-question analogy set (5 semantic types: common capital, all capitals, currency, city-in-state, man-woman + 9 syntactic types: adjective→adverb, opposite, comparative, superlative, present participle, nationality adjective, past tense, plural nouns/verbs) with cosine nearest, discarding queries, exact-match — and WordSim353/MEN similarity correlation (§2 of notes) — future evaluation via [[evaluation]] style robustness/bias tests.
- **Contrasts with contextual embeddings:** Like Word2Vec, GloVe is type-level → cannot distinguish "bank" senses; ELMo/BERT/[[transformer]] contextualize via [[self-attention]].
- **Evaluation methodology critiqued by [[source-evaluation-methods-unsupervised-word-embeddings]]:** Schnabel et al. show analogy/similarity leaderboards (the very metrics behind GloVe's 75% claim) correlate weakly with downstream quality and that different embedding methods win on different direct-intrinsic criteria — reinforcing that family choice should be application-driven.

## Open Questions

- Is `f(x)=(x/100)^{3/4}` optimal or just broad optimum? Paper shows sensitivity low but not theoretical — could data-dependent `f` (e.g., per-domain `x_max`) improve rare-word weighting vs. Word2Vec's `1-√(t/f)` subsampling?
- Can count-based GloVe be extended with subword (FastText) and negative sampling hybrids to get best of both? (e.g., `f` + `U^{3/4}` negative sampling for zeros?)
- For 42B Common Crawl, GloVe's gain 75%→77% saturates while Word2Vec's phrase model (1310.4546) gains 66%→72% with 6B→33B — is global matrix saturation fundamental or artifact of `x_max=100` cap?
- How to debias GloVe whose linear regularities (king-queen = man-woman) encode occupational/gender biases — same open question as [[embeddings]] and [[word2vec]] (§ Open Questions), with added count-based amplification via `log X_ij`?

## Sources

- [[source-glove-global-vectors-for-word-representation]]
- [[source-cs224n-word-vectors-ii-glove-evaluation]]
- CS224N 2026 Lecture 2: Word Vectors (Slides) — Word2Vec, Negative Sampling, GloVe, Evaluation
- [[source-distributed-representations-of-words-and-phrases-and-their-compositionality]]
- [[source-efficient-estimation-of-word-representations-in-vector-space]]
- [[source-improving-distributional-similarity]] — hyperparameter audit contextualizing GloVe-vs-Word2Vec claims.
- [[source-evaluation-methods-unsupervised-word-embeddings]] — direct-intrinsic evaluation critique of analogy/similarity benchmarks.

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
