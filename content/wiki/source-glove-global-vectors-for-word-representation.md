---
type: source-summary
title: "GloVe: Global Vectors for Word Representation"
summary: Pennington, Socher & Manning (Stanford NLP, EMNLP 2014, http://nlp.stanford.edu/pubs/glove.pdf) analyze why vector arithmetic regularities (e.g., king - queen ≈ man - woman) emerge and make the conditions explicit.
status: draft
visibility: public
author: "Jeffrey Pennington, Richard Socher, Christopher D. Manning"
source-type: paper
url: "http://nlp.stanford.edu/pubs/glove.pdf"
date-published: 2014-10-01
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
  - rag
key-concepts:
  - "[[glove]]"
  - "[[embeddings]]"
  - "[[word2vec]]"
  - "[[tokenization]]"
  - "[[pretraining]]"
key-entities:
  - "[[stanford-university]]"
---

# GloVe: Global Vectors for Word Representation

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 2 of 26 figures on this page were not found in [http://nlp.stanford.edu/pubs/glove.pdf](http://nlp.stanford.edu/pubs/glove.pdf): `783M`, `61%`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Pennington, Socher & Manning (Stanford NLP, EMNLP 2014, `http://nlp.stanford.edu/pubs/glove.pdf`) analyze why vector arithmetic regularities (e.g., `king - queen ≈ man - woman`) emerge and make the conditions explicit. They observe that **ratios of co-occurrence probabilities** `P(k|ice)/P(k|steam)` — not raw probabilities — best discriminate meaning (e.g., `k=solid` ratio 8.9, `k=gas` 8.5e-2, `k=water` 1.36, Table 1 on 6B tokens), and derive that this implies a **global log-bilinear regression** `w_i^T w̃_j + b_i + b̃_j ≈ log X_ij`. The resulting **GloVe** (Global Vectors) is a **weighted least squares** model `J=Σ f(X_ij)(w_i^T w̃_j + b_i + b̃_j - log X_ij)^2` with weighting `f(x)=(x/x_max)^α` (x_max=100, α=3/4) that trains only on **non-zero** entries of the word-word co-occurrence matrix. Combining global matrix factorization efficiency with local window semantics, GloVe reaches **75% total analogy accuracy** (80%+ semantic) on the Mikolov 19,544-question set (vs. ~53% Skip-gram/36% CBOW at 783M) and consistently outperforms Word2Vec given same corpus/vocab/window/time, with better similarity correlation (WordSim353) and NER (CoNLL F1 88.81).

## Key Takeaways

1. **Ratio of co-occurrence probabilities is the right starting point.** Raw `P(k|ice)` vs `P(k|steam)` both ≈3e-3 for `k=water` (uninformative) and ~1e-5 for `k=fashion`; only `P(k|ice)/P(k|steam)` (8.9, 8.5e-2, 1.36, 0.96, Table 1) cancels noise from non-discriminative probes and separates discriminative ones. GloVe is explicitly derived to encode this ratio linearly: `F((w_i-w_j)^T w̃_k)=P_ik/P_jk` → `F=exp` → `w_i^T w̃_k = log P_ik` → with biases `w_i^T w̃_j + b_i + b̃_j = log X_ij` (Eq.7). This explains why differences `w_i-w_j` capture meaning components — a property earlier Word2Vec papers described empirically but not derived.
2. **Weighted least squares on the sparse co-occurrence matrix — efficient and scalable.** Objective `J=Σ f(X_ij)(w_i^T w̃_j + b_i + b̃_j - log X_ij)^2` (Eq.8) has three design goals for `f`: `f(0)=0` → trains only on non-zero `X` (not full sparse matrix or every corpus window — 1 pass to build `X`, then iterate over non-zeros), non-decreasing (rare pairs not overweighted), and capped at 1 for large `X_ij` (frequent pairs not overweighted spanning 8-9 orders of magnitude). `f(x)=(x/100)^{3/4}` if `x<100` else 1 satisfies all (Fig.1). 6B-token `X` has ~sparse non-zeros; training 50 AdaGrad iterations is faster per epoch than Skip-gram scanning windows, and counts repetition is leveraged (not re-scanned).
3. **State-of-the-art empirical wins under controlled comparison.** On 6B (GigaWord5+Wikipedia 2014) 400K vocab, symmetric window 10, GloVe 300D reaches **75% analogy total** (vs. 59-61% NEG-5/15 in Mikolov NIPS 2013 Table 1 and 53% Skip-gram 783M in 1301.3781 Table 4). Ablations: dim 50→100→200→300 = 33%→51%→62%→75% (data/dim must scale together); corpus 1B Wikipedia 59% vs 6B 75% vs 42B Common Crawl 77% (diminishing returns after 6B). WordSim353 similarity: GloVe ~70% Spearman vs Skip-gram ~50-60% and SVD variants lower; CoNLL03 NER: GloVe beats CBOW/Skip-gram/random (e.g., 50D F1 88.81 vs 88.5 vs 88.32). Qualitatively neighbors and t-SNE show meaningful substructure (e.g., frog→frogs/toad/litoria).
4. **Bridges two families — unifies count-based and window-based views.** Related work shows LSA/HAL/COALS/HPCA compress counts but lack analogy structure; Bengio 2003, Collobert, Mikolov CBOW/Skip-gram, vLBL/ivLBL capture analogy but ignore global counts. §3.3 shows Skip-gram itself can be re-expressed as weighted cross-entropy over `X`, but softmax normalization is the bottleneck; GloVe replaces that with least squares on logs, discarding normalization. Benefits: as fast as Word2Vec, less sensitive to window sampling, more stable with AdaGrad and shuffling.
5. **Bias terms and symmetric vectors matter.** `b_i` absorbs `log X_i = log Σ_k X_ik` (Eq.6→7) to make objective exchangeable (`w ↔ w̃`, `X ↔ X^T`). Final vectors often use `w_i + w̃_i` (or average) — improves over `w` alone because both capture same corpus but different roles. Rare-word weighting via `f` is gentler than Word2Vec's subsampling `1-√(t/f)` — instead down-weights frequent co-occurrences softly via `f` cap, not by discarding tokens.

## Detailed Notes

### Derivation Sketch (§3)

- Define `X_ij` co-occurrence count of `j` in context of `i` (symmetric window 10, one pass, 400K vocab). `P_ij = X_ij / X_i`.
- **Ice/steam example** (Table 1): demonstrates ratio's superiority; motivate `F(w_i, w_j, w̃_k)=P_ik/P_jk` (Eq.1).
- **Linearity desideratum**: restrict to `(w_i - w_j)^T w̃_k` (Eq.2) so vector differences encode ratio; then dot product prevents dimension mixing (Eq.3).
- **Homomorphism requirement** for exchange symmetry: `F((w_i - w_j)^T w̃_k)=F(w_i^T w̃_k)/F(w_j^T w̃_k)` (Eq.4) → `F(w_i^T w̃_k)=P_ik` (Eq.5) → `F=exp`, `w_i^T w̃_k = log P_ik = log X_ik - log X_i` (Eq.6).
- **Absorb `log X_i` into bias `b_i`**, add `b̃_k` for `w̃_k` symmetry → `w_i^T w̃_k + b_i + b̃_k = log X_ik` (Eq.7). Ill-defined for `X_ik=0` (log diverges) but `f(0)=0` avoids evaluating those entries. Alternative `log(1+X)` considered but less principled.

### Objective and Weighting (§3.2)

- **Objective Eq.8**: `J=Σ f(X_ij)(w_i^T w̃_j + b_i + b̃_j - log X_ij)^2`
- `f` Eq.9: `f(x)=(x/x_max)^α if x < x_max else 1`, `x_max=100`, `α=3/4`. Evaluated alternatives: linear underperforms for rare, hard cutoff overweights frequent. 3/4 power also appears in Word2Vec's `U^{3/4}` noise distribution — similar motivation (compress dynamic range).
- **Training**: AdaGrad, initial 0.05, 50 iterations, shuffling non-zero entries each epoch, parallel.

### Related Work Linkage (§2)

- Matrix factorization: LSA (Deerwester 1990) term-document, HAL (Lund & Burgess 1996) term-term, COALS (Rohde 2006) entropy, PPMI (Bullinaria & Levy 2007), HPCA (Lebret & Collobert 2014) — all compress 8-9 orders counts but no analogy linearity.
- Window methods: Bengio 2003 NPLM, Collobert & Weston 2008, CBOW/Skip-gram, vLBL/ivLBL (Mnih & Kavukcuoglu 2013), explicit PPMI (Levy et al. 2014) — learn via local predictions but ignore global repetition.
- GloVe's global regression subsumes both: trains on global counts (like LSA) but log-bilinear form yields Word2Vec's linear structure.

### Experiments (§4)

- **Setup**: Corpora Wikipedia 2010 (1B), Wikipedia 2014+GigaWord5 (6B, 400K vocab), Common Crawl (42B). Baselines: SVD, SVD-S/L, CBOW (Mikolov 2013), Skip-gram (HS/NEG), ivLBL. Evaluation: analogy (Mikolov 19,544, cosine nearest excluding queries), WordSim353/MEN similarity (Spearman), CoNLL03 NER with CRF using vectors as features.
- **Analogy Results Table**: GloVe 300D/6B 75% total (semantic 81%, syntactic 69%); 50D 33%, 100D 51%, 200D 62% — monotonic with dim. Word2Vec best reported here (CBOW 35%, Skip-gram 55% on same 6B? internal reproduction) below GloVe at each dim. Common Crawl 42B GloVe 300D 77% — marginal gain.
- **Similarity**: WordSim353 GloVe 60.1 vs Skip-gram 46, etc. MEN similarly.
- **NER**: F1 88.81 (GloVe 50D) vs 88.5 Skip-gram vs 88.32 CBOW vs 88.2 random — consistent win, larger with 300D.
- **Ablations**: Without weighting, frequent pairs dominate; shuffling important; sum `w + w̃` beats `w` alone by ~2-3% on analogy.

### Qualitative (§5)

Nearest neighbors show morphology/semantics; analogy examples (e.g., Athens:Greece :: Oslo:Norway, apparent:apparently :: rapid:rapidly) solved via vector addition; t-SNE visualizations show clusters by semantic type and syntactic role.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 4 of 9 passages in this section could not be located in the stored source ([http://nlp.stanford.edu/pubs/glove.pdf](http://nlp.stanford.edu/pubs/glove.pdf)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Recent methods for learning vector space representations ... have succeeded in capturing fine-grained semantic and syntactic regularities ... but the origin of these regularities has remained opaque." — Abstract

> "The ratio of the co-occurrence probabilities cancels out noise from non-discriminative words like water and fashion, so that large values correlate well with properties specific to ice." — Table 1 caption/discussion

> "We propose a specific weighted least squares model that trains on global word-word co-occurrence counts and thus makes efficient use of statistics. The model produces a word vector space with meaningful substructure." — Abstract

> "F(w_i, w_j, w̃_k) = P_ik / P_jk" — Eq.1 starting point, §3.1

> "w_i^T w̃_j + b_i + b̃_j = log(X_ij)" — Eq.7 final log-bilinear form

> "J = Σ f(X_ij) (w_i^T w̃_j + b_i + b̃_j - log X_ij)^2" — Eq.8 GloVe objective

> "f(x) = (x/x_max)^α if x < x_max else 1, with x_max=100, α=3/4" — Eq.9 weighting

> "Our model efficiently leverages statistical information by training only on the nonzero elements in a word-word co-occurrence matrix." — Abstract

> "It achieves 75% on a recent word analogy task ... and also outperforms related models on similarity tasks and named entity recognition." — Abstract

## Concepts Introduced or Referenced

- [[glove]] — The paper *is* GloVe; introduces Global Vectors as weighted least squares log-bilinear regression on co-occurrence ratios — the flagship count-based embedding contrasting with [[word2vec]]'s predictive approach.
- [[embeddings]] — GloVe vectors are the alternative dense static embeddings to Word2Vec (distributed representations), used as features for [[retrieval-augmented-generation]], NER, similarity; discuss `w + w̃` sum as final embedding.
- [[word2vec]] — Direct baseline and theoretical counterpart: §3.3 re-derives Skip-gram as implicit factorization of log co-occurrence, showing GloVe avoids softmax normalization yet captures same linear structure; consistently outperforms CBOW/Skip-gram at same compute.
- [[tokenization]] — Same 400K vocab with co-occurrence window counting (symmetric 10); contrasts with Word2Vec's fine-grained window sampling; later subword tokenizers address OOV that both share.
- [[pretraining]] — Self-supervised pretraining on 1B/6B/42B tokens with AdaGrad; scaling analysis (dim vs corpus) parallels [[scaling-laws]] before it was formalized.
- [[retrieval-augmented-generation]] — GloVe vectors as retrieval embeddings (similarity task) and NER features; comparison of similarity metrics (cosine, correlation) relevant to vector DB retrieval.
- [[self-attention]] / [[transformer]] — Pre-transformer contextual predecessor; GloVe's global log-bilinear intuition foreshadows attention's dot-product similarity ( `w_i^T w̃_j` ≈ log co-occurrence ≈ attention logit).

## Critical Assessment

**Strengths:** Elegant theoretical bridge — derives log-bilinear form from first principles (ratio → vector difference → homomorphism → exp) rather than empirical trick; practical weighting function solves 8-9 order dynamic range without discarding tokens (unlike subsampling which drops data); training only on non-zeros gives efficiency competitive with Word2Vec while leveraging global counts; thorough controlled comparisons (same corpus/window/vocab/dim/time) show consistent win + faster convergence; open code/vectors accelerated adoption.

**Limitations / Gaps:** Derivation assumes `log X_ij` target is ideal, but `log` undefined for zeros — `f(0)=0` sidesteps but not fully justified; weighting hyperparameters (`x_max=100`, `α=3/4`) empirical, not strongly theory-driven (sensitivity tables show broad optimum but still tuned); 75% analogy on 6B vs Word2Vec's 61% (NEG 300D) is not apples-to-apples to the original 1301.3781 single-machine 53% — need controlled re-run; static vectors share Word2Vec's polysemy/OOV limits (later fixed by subword/contextual models); Common Crawl 42B only marginal gain over 6B suggests data scaling saturates for count-based.

**Contradictions / Notes vs. existing wiki:** No direct contradiction — complements [[source-efficient-estimation-of-word-representations-in-vector-space]] (1301.3781) and [[source-distributed-representations-of-words-and-phrases-and-their-compositionality]] (1310.4546) which together define Word2Vec's predictive lineage; contrast to highlight is that GloVe claims "global matrix factorization + local window" advantages, while Mikolov 2013 argues shallow window models beat factorization — CS224N 2019 notes synthesize: GloVe produces meaningful substructure and *does* outperform Word2Vec on analogy given same constraints (notes §1.4), resolving tension; final [[glove]] concept page should present GloVe as count-based regression, not as Word2Vec variant.

---

**Source:** GloVe: Global Vectors for Word Representation by Jeffrey Pennington, Richard Socher, Christopher D. Manning — <http://nlp.stanford.edu/pubs/glove.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
