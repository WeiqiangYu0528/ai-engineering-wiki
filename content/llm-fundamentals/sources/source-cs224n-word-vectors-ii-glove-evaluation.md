---
type: source-summary
title: "CS224N Lecture Notes Part II: Word Vectors II — GloVe, Evaluation and Training"
summary: Winter 2019 Lecture Notes Part II (Mundra et al., Manning/Socher, 13 pages, cs224n-2019-notes02-wordvecs2.pdf) is the companion to Note 1 that finishes the word-vector story.
status: draft
visibility: public
author: "Rohit Mundra, Emma Peng, Richard Socher, Ajay Sohmshetty, Amita Kamath (Christopher Manning, Richard Socher instructors)"
source-type: article
url: "https://web.stanford.edu/class/cs224n/readings/cs224n-2019-notes02-wordvecs2.pdf"
date-published: 2019-01-01
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
  - rag
key-concepts:
  - "[[glove]]"
  - "[[embeddings]]"
  - "[[word2vec]]"
  - "[[tokenization]]"
  - "[[retrieval-augmented-generation]]"
key-entities:
  - "[[stanford-university]]"
aliases:
  - wiki/source-cs224n-word-vectors-ii-glove-evaluation
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Winter 2019 Lecture Notes Part II (Mundra et al., Manning/Socher, 13 pages, cs224n-2019-notes02-wordvecs2.pdf) is the companion to Note 1 that finishes the word-vector story.</p>
<p class="kb-provenance">Rohit Mundra, Emma Peng, Richard Socher, Ajay Sohmshetty, Amita Kamath (Christopher Manning, Richard Socher instructors), 2019-01-01. <a href="https://web.stanford.edu/class/cs224n/readings/cs224n-2019-notes02-wordvecs2.pdf">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

Winter 2019 Lecture Notes Part II (Mundra et al., Manning/Socher, 13 pages, `cs224n-2019-notes02-wordvecs2.pdf`) is the companion to Note 1 that finishes the word-vector story. It is structured in three acts: **(1) GloVe** (Pennington, Socher & Manning 2014) as the count-based counterpart to Word2Vec's predictive models — deriving `f(X_ij)(w_i^T w̃_j + b_i + b̃_j - log X_ij)^2` with weighting `f(x)=(x/x_max)^α` (`x_max=100`, `α=3/4`) training only on non-zero co-occurrences, and showing it consistently outperforms Word2Vec on the analogy task given same corpus/vocab/window/time and is faster; **(2) Evaluation of word vectors** as a science — intrinsic (analogy `king-man+woman≈queen` via cosine nearest neighbor, WordSim353 human correlation, categorization) vs extrinsic (real task e.g., NER "Chris Manning lives in Palo Alto" window classification), with discussion of correlation, hyperparameter tuning via analogies, and how to train/fine-tune vectors with task parameters; **(3) Motivation for neural networks** via window classification as the simplest neural model for NLP tasks, bridging embeddings to the deep architectures that follow.

## Key Takeaways

1. **GloVe as principled middle ground between count and predict.** Notes classify prior methods: count-based matrix factorization (LSA, HAL) leverages global statistics but poor analogy (suboptimal space); shallow window-based (skip-gram/CBOW) captures linear linguistic patterns beyond similarity but ignores global counts. GloVe is weighted least squares on global `X_ij` (word-word co-occurrence counts) that makes efficient use of statistics (single pass to build `X`, then least squares on logs) while producing word2vec's linear structure. Conclusion (§1.4): "consistently outperforms word2vec on word analogy given same corpus/vocab/window/time. It achieves better results faster, and also obtains the best results irrespective of speed." — from Pennington et al. Table reproduced conceptually.
2. **GloVe derivation is taught as least-squares fix to cross-entropy.** Start with Skip-gram's global cross-entropy `J = -Σ_iΣ_j X_ij log Q_ij` with `Q_ij=exp(u_j^T v_i)/Σ_w exp(u_w^T v_i)`. Expensive normalization → replace with unnormalized least squares on logs: `Ĵ=Σ_iΣ_j X_i(log P̂_ij - log Q̂_ij)^2 = Σ_iΣ_j X_i(u_j^T v_i - log X_ij)^2` where `P̂_ij=X_ij`, `Q̂_ij=exp(...)`. Large `X_ij` destabilizes → introduce general `f(X_ij)`: **`Ĵ=Σ_iΣ_j f(X_ij)(u_j^T v_i - log X_ij)^2`** (then with biases `w_i^T w̃_j + b_i + b̃_j - log X_ij` in full paper). `f(0)=0` → trains only on non-zero `X` (sparse), non-decreasing, capped at 1 for large counts. Full paper's `f(x)=(x/100)^{3/4}` if `x<100` else 1 is implied.
3. **Evaluation is a first-class methodology, not afterthought.** Motivation figure: expensive full-system evaluation (red subsystem) replaced by simpler intrinsic evaluation (green) for fast iteration. Intrinsic = fast subtask number (analogy, similarity, correlation) to understand system; extrinsic = real task accuracy (takes longer, ground truth for utility; swap one subsystem → win). Notes stress to establish **correlation** between intrinsic and extrinsic before trusting intrinsic. Analogy used to tune `x_max`, `α`, dim, window, corpus size (e.g., Table 2 style scaling). Comparison to published vectors contextualized: intrinsic must be interpreted with corpus/dim mismatch caveats.
4. **Intrinsic evaluation details that matter for reproduction.** Analogy: `a:b::c:?`, compute `X=vec(b)-vec(a)+vec(c)`, nearest cosine **excluding** query words (`a,b,c`) — synonyms counted wrong, so 60% ceiling, and assumes linear structure (what if info is non-linear?). Human judgment: WordSim353 353 pairs (e.g., tiger-cat 7.35, tiger-tiger 10, stock-phone 1.62, stock-jaguar 0.92) → Spearman correlation between cosine distances and human means; this and similar MEN datasets test similarity vs analogy. Notes also discuss handling ambiguity via contexts (one vector per type insufficient → polysemy) and that averaging 10 example analogy vectors → +10% semantic.
5. **Extrinsic evaluation and training for downstream tasks leads naturally to neural nets.** Window classification (e.g., NER window of 5 words: classify center word as person/location/organization or not) shows how word vectors and task weights are jointly trained: freeze vs. update (fine-tune) embeddings, effect of random vs. pretrained initialization, and that extrinsic gain is the ultimate arbiter. Then notes motivate artificial neural networks as a class of models for NLP, using window classification as minimal neural network (softmax over window-averaged vectors) — stepping stone to deeper architectures in subsequent lectures.

## Detailed Notes

### 1 GloVe (§1, pages 1-4)

#### 1.1 Comparison with Previous Methods
- Two families: count-based factorization (LSA, HAL) → global but analogy-poor; shallow window (skip-gram, CBOW) → analogy-rich but local-only.
- GloVe = weighted least squares on global word-word counts → efficient + meaningful substructure.

#### 1.2 Co-occurrence Matrix
- `X`: word-word co-occurrence, `X_ij` = times `j` occurs in context of `i`.
- `X_i = Σ_k X_ik` total contexts for `i`, `P_ij = P(w_j|w_i)=X_ij/X_i`.
- One pass to populate (one-time cost, expensive but amortized); symmetric window counting vs document counting.

#### 1.3 Least Squares Objective (core derivation, pages 2-3)
- Skip-gram softmax `Q_ij=exp(u_j^T v_i)/Σ_W exp(u_w^T v_i)`; global cross-entropy `J=-Σ_iΣ_j X_ij log Q_ij` grouping identical (i,j).
- Drawback: normalization over V expensive → discard normalization factors, unnormalized `P̂_ij=X_ij`, `Q̂_ij=exp(u_j^T v_i)`.
- Least squares: `Ĵ=Σ_iΣ_j X_i(P̂_ij - Q̂_ij)^2` → log version `Ĵ=Σ_iΣ_j X_i(log P̂_ij - log Q̂_ij)^2 = Σ_iΣ_j X_i(u_j^T v_i - log X_ij)^2` — stabilizes large counts.
- Generalize weighting `X_i → f(X_ij)` dependent on both words: **`Ĵ=Σ_iΣ_j f(X_ij)(u_j^T v_i - log X_ij)^2`**; then biases added in full paper `w_i^T w̃_j + b_i + b̃_j`.
- `f` is free; paper chooses `f(x)=(x/x_max)^α` capped at 1 (`x_max=100`, `α=3/4`) — `f(0)=0` so only non-zero trained, Figure 1 plots it.

#### 1.4 Conclusion
- GloVe efficiently leverages global statistics (non-zero only), produces meaningful substructure, outperforms word2vec on analogy given same corpus/vocab/window/time; faster and best overall. (Pennington et al. 75% analogy vs word2vec ~61% NCE/HS in same setup.)

### 2 Evaluation of Word Vectors (§2, pages 3-8)

- **Intrinsic evaluation** (§2.1): evaluation on intermediate subtasks (analogy, similarity, correlation) → fast number, helps understand system, but must correlate to real task.
- **Figure 1 motivation**: expensive left subsystem → cheaper green intrinsic proxy.
- **Analogy** (§2.1.1): `man:woman :: king:queen` etc., `X=vec(king)-vec(man)+vec(woman)` nearest cosine (discard inputs). 19,544 questions (8869 semantic + 10675 syntactic, 14 types) table summarized; CBOW 24/64/61, Skip-gram 55/59/56 vs NNLM/RNNLM lower (1301.3781 Table 3). Analogy used to tune hyperparameters — correlation tables show dim vs data joint scaling (Table 2: 50D 23% at 783M vs 600D 50%).
- **Human judgment** (§2.1.2): WordSim353 example rows quoted; correlation (Spearman) evaluation; GloVe plot shows closer to human than prior vectors.
- **Ambiguity**: one vector per type insufficient for polysemy (bank river vs finance) — contexts needed → motivates contextual embeddings/ELMo/BERT next.
- **Extrinsic** (§2.2 onward): real tasks (QA system example with word-vector subsystem: intrinsic analogy vs full QA extrinsic). NER example "Chris Manning lives in Palo Alto." → window classification: `window [-2,+2]` → softmax over classes.
- **Word vectors in training**: discuss training model weights vs word vectors jointly; freezing vs fine-tuning; analogy as proxy for tuning before expensive extrinsic run.
- **Hyperparameters**: effect on analogy (x_max, α, window 5-10, dim 50-300, corpus 1B/6B/42B); diminishing returns unless dim and data scaled together (same Table 2 theme).

### 3 Window Classification & Neural Network Motivation (§3 onward, pages 8-13)

- Window classification as minimal NLP neural model: take window-averaged word vectors → softmax (or shallow network) to predict NER label; shows backprop through embeddings.
- Motivates artificial neural networks as a class for NLP (next lectures: feedforward, RNN, CNN, transformers).

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 9 of 10 passages in this section could not be located in the stored source ([https://web.stanford.edu/class/cs224n/readings/cs224n-2019-notes02-wordvecs2.pdf](https://web.stanford.edu/class/cs224n/readings/cs224n-2019-notes02-wordvecs2.pdf)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "So far, we have looked at two main classes of methods to find word embeddings. The first set are count-based and rely on matrix factorization (e.g. LSA, HAL). While these methods effectively leverage global statistical information, they are primarily used to capture word similarities and do poorly on tasks such as word analogy, indicating a sub-optimal vector space structure." — §1.1

> "The other set of methods are shallow window-based (e.g. the skip-gram and the CBOW models), which learn word embeddings by making predictions in local context windows. These models demonstrate the capacity to capture complex linguistic patterns beyond word similarity, but fail to make use of the global co-occurrence statistics." — §1.1

> "In comparison, GloVe consists of a weighted least squares model that trains on global word-word co-occurrence counts and thus makes efficient use of statistics. The model produces a word vector space with meaningful sub-structure." — §1.1

> "Populating this matrix requires a single pass through the entire corpus to collect the statistics. For large corpora, this pass can be computationally expensive, but it is a one-time up-front cost." — §1.2 Co-occurrence Matrix

> "J = - Σ_{i=1}^W Σ_{j=1}^W X_ij log Q_ij where the value of co-occurring frequency is given by the co-occurrence matrix X. One significant drawback of the cross-entropy loss is that it requires the distribution Q to be properly normalized, which involves the expensive summation over the entire vocabulary." — §1.3

> "Instead, we use a least square objective in which the normalization factors in P and Q are discarded: Ĵ = Σ_i Σ_j X_i(P̂_ij - Q̂_ij)^2 where P̂_ij=X_ij and Q̂_ij=exp(u_j^T v_i)" — §1.3

> "Ĵ = Σ_i Σ_j f(X_ij)(u_j^T v_i - log X_ij)^2" — Generalized least squares (bias terms added in paper)

> "In conclusion, the GloVe model efficiently leverages global statistical information by training only on the nonzero elements in a word-word co-occurrence matrix, and produces a vector space with meaningful sub-structure. It consistently outperforms word 2vec on the word analogy task, given the same corpus, vocabulary, window size, and training time." — §1.4

> "Intrinsic evaluation of word vectors is the evaluation of a set of word vectors generated by an embedding technique (such as Word 2Vec or GloVe) on specific intermediate subtasks (such as analogy completion). These subtasks are typically simple and fast to compute..." — §2.1

> "If replacing exactly one subsystem with another improves accuracy → Winning!" — §2 extrinsic motivation (from slides, echoed in notes)

## Concepts Introduced or Referenced

- [[glove]] — Dedicated §1 derives GloVe's weighted least squares objective from Skip-gram's cross-entropy; this note is the most accessible derivation bridging count vs predict and is the primary pedagogical source for `f(X_ij)` weighting.
- [[word2vec]] — GloVe compared directly to Skip-gram/CBOW (same objective `Q_ij` and `X_ij` grouping), showing tradeoffs: predictive vs count-based; window sampling vs global matrix.
- [[embeddings]] — Evaluation chapter defines how embedding quality is measured (intrinsic analogy/similarity vs extrinsic task accuracy), including correlation methodology and hyperparameter tuning via analogies.
- [[retrieval-augmented-generation]] — Similarity evaluation (WordSim353 correlation, cosine nearest neighbor) is the retrieval metric; analogy via vector offset is the retrieval query; extrinsic NER window classification is the downstream retrieval-augmented task.
- [[tokenization]] — Co-occurrence vocab 400K/1M discussed; count-based vs window token counting informs later subword choices for OOV.
- [[pretraining]] — Discusses training model weights and word vectors jointly for extrinsic tasks (frozen vs fine-tuned embeddings) — early pretraining/finetuning dichotomy.

## Critical Assessment

**Strengths:** Most balanced treatment of GloVe's derivation among CS224N materials — shows two-step fix (cross-entropy → unnormalized least squares → log to tame large counts → general `f`) with each step's motivation (normalization cost, dynamic range 8-9 orders) rather than just stating final loss; clearly articulates intrinsic vs extrinsic evaluation science with the "expensive left subsystem → cheaper green proxy" figure and concrete numbers (WordSim353 rows, analogy table), and connects hyperparameter tuning explicitly to analogy as proxy.

**Limitations / Gaps:** As 2019 notes, corpus/vocab numbers are pre-modern (1B/6B, 400K vocab) and not directly comparable to today's subword vocabularies; `f(x)=(x/100)^{3/4}` is stated without the paper's full justification (Figure 1 is textual only); notes defer full GloVe bias terms `b_i, b̃_j` to paper — derivation here stops at `f(X_ij)(u_j^T v_i - log X_ij)^2` before biases; evaluation discussion does not yet cover bias/fairness of embeddings (gendered analogies) beyond noting suboptimal structure.

**Contradictions / Notes vs. existing wiki:** No contradiction — fills gap left by [[source-efficient-estimation-of-word-representations-in-vector-space]] (which ends before GloVe) and [[source-distributed-representations-of-words-and-phrases-and-their-compositionality]] (which extends Word2Vec with NEG/subsampling/phrases) by adding the count-based branch; §1.4 "consistently outperforms word2vec given same constraints" should be qualified in wiki as controlled same-corpus experiment from Pennington et al. Table, not universal win across all corpora/dims — notes themselves show GloVe's lead shrinks at 42B vs 6B.

---

**Source:** CS224N Lecture Notes Part II: Word Vectors II — GloVe, Evaluation and Training by Rohit Mundra, Emma Peng, Richard Socher, Ajay Sohmshetty, Amita Kamath (Christopher Manning, Richard Socher instructors) — <https://web.stanford.edu/class/cs224n/readings/cs224n-2019-notes02-wordvecs2.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
