---
type: concept
title: "Word2Vec"
summary: Word2Vec is the pair of shallow log-linear architectures — Continuous Bag-of-Words (CBOW) and Continuous Skip-gram — introduced by Mikolov et al. (Google, 2013) in Efficient Estimation of Word Representations in Vector…
visibility: public
aliases:
  - CBOW
  - Skip-gram
  - Continuous Bag-of-Words
  - Continuous Skip-gram
  - wiki/word2vec
tags:
  - llm-fundamentals
  - rag
created: 2026-08-25
updated: 2026-08-25
status: draft
sources:
  - "[[source-efficient-estimation-of-word-representations-in-vector-space]]"
  - "[[source-distributed-representations-of-words-and-phrases-and-their-compositionality]]"
  - "CS224N 2026 Lecture 2: Word Vectors (Slides) — Word2Vec, Negative Sampling, GloVe, Evaluation"
  - "[[source-cs224n-winter2023-lecture1-notes-introduction-word2vec]]"
  - "[[source-glove-global-vectors-for-word-representation]]"
related:
  - "[[embeddings]]"
  - "[[glove]]"
  - "[[tokenization]]"
  - "[[transformer]]"
  - "[[pretraining]]"
  - "[[retrieval-augmented-generation]]"
  - "[[self-attention]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Word2Vec is the pair of shallow log-linear architectures — Continuous Bag-of-Words (CBOW) and Continuous Skip-gram — introduced by Mikolov et al. (Google, 2013) in Efficient Estimation of Word Representations in Vector…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/embeddings">Embeddings</a></li><li><a href="/llm-fundamentals/concepts/glove">GloVe</a></li><li><a href="/llm-fundamentals/concepts/tokenization">Tokenization</a></li><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-efficient-estimation-of-word-representations-in-vector-space">Efficient Estimation of Word Representations in Vector Space</a></li><li><a href="/llm-fundamentals/sources/source-distributed-representations-of-words-and-phrases-and-their-compositionality">Distributed Representations of Words and Phrases and their Compositionality</a></li><li><a href="/llm-fundamentals/sources/source-cs224n-winter2023-lecture1-notes-introduction-word2vec">CS224N Winter 2023 Lecture Notes 1 (Draft): Introduction and Word2Vec</a></li><li><a href="/llm-fundamentals/sources/source-glove-global-vectors-for-word-representation">GloVe: Global Vectors for Word Representation</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview

**Word2Vec** is the pair of shallow log-linear architectures — **Continuous Bag-of-Words (CBOW)** and **Continuous Skip-gram** — introduced by Mikolov et al. (Google, 2013) in [[source-efficient-estimation-of-word-representations-in-vector-space]] and completed in the NIPS 2013 follow-up [[source-distributed-representations-of-words-and-phrases-and-their-compositionality]] (Negative Sampling, subsampling, phrases) for learning high-quality distributed word vectors from billions of words at minimal compute. By removing the non-linear hidden layer of feedforward NNLMs and RNNLMs and adopting Huffman-tree hierarchical softmax (later superseded by Negative Sampling with DistBelief Adagrad), Word2Vec made it possible in 2013 to train 300–1000-dimensional [[embeddings]] on 1.6–6B words in hours instead of weeks, famously demonstrating that linear algebraic offsets capture linguistic regularities such as `vector("King") - vector("Man") + vector("Woman") ≈ vector("Queen")`. The full Word2Vec practice as taught in CS224N 2026 Lecture 2: Word Vectors (Slides) — Word2Vec, Negative Sampling, GloVe, Evaluation and [[source-cs224n-winter2023-lecture1-notes-introduction-word2vec]] includes both the Efficient Estimation core and the 1310.4546 extensions.

## Key Ideas

- **Two complementary architectures, one framework.** Both are log-linear classifiers with a shared projection layer and no hidden non-linearity, trained with stochastic gradient descent:
  - **CBOW** averages the [[embeddings]] of `N=8` surrounding words (4 history + 4 future) — order invariant, bag-of-words — to predict the middle word. Fastest; slightly best on syntactic analogies (64% syntactic vs 24% semantic on 320M-word 640-D comparison, Table 3 of 1301.3781).
  - **Skip-gram** inverts CBOW: the current word predicts up to `C=10` words on each side. For each token, a random window `R∈[1,C]` is sampled (distant words down-weighted) yielding `2R` classifications. Slower but far stronger on semantics (55% semantic vs 24% CBOW, same data).
- **Complexity accounting drives the design.** Total cost `O = E × T × Q` with `E` epochs, `T` tokens, `Q` per-example cost. NNLM: `Q = N·D + N·D·H + H·V`; RNNLM: `Q = H·H + H·V`; CBOW: `Q = N·D + D·log₂(V)` (Eq. 4); Skip-gram: `Q = C·(D + D·log₂(V))` (Eq. 5). The `H·V` and `N·D·H` terms vanish without the hidden layer, leaving softmax as the bottleneck.
- **Huffman hierarchical softmax is essential — then Negative Sampling supersedes it.** A binary tree over the vocabulary reduces softmax from `V` to `log₂(V)` outputs; Huffman coding (short codes for frequent words) further cuts it to `~log₂(Unigram_perplexity(V))` — about 2× faster than a balanced tree at 1M vocab ([[source-efficient-estimation-of-word-representations-in-vector-space]] §2.1). This makes hidden-layer-free training viable at scale, but [[source-distributed-representations-of-words-and-phrases-and-their-compositionality]] shows **Negative Sampling (NEG)** — `J_neg = -log σ(u_o^T v_c) - Σ_{k=1}^K log σ(-u_k^T v_c)` with `σ=1/(1+exp(-x))`, `K=5–20` small / 2–5 large, noise `P_n(w)=U(w)^{3/4}/Z` — outperforms HS (59% vs 47% total without subsampling, Table 1 of 1310.4546) and slightly outperforms NCE. NEG needs only samples, not noise probabilities, and is the *standard* word2vec implementation per CS224N 2026 Lecture 2: Word Vectors (Slides) — Word2Vec, Negative Sampling, GloVe, Evaluation slide 26.
- **Subsampling of frequent words is load-bearing for speed and quality.** In large corpora "the"/"a"/"in" occur hundreds of millions of times but carry little information (France-Paris informative, France-the not). Mikolov 1310.4546 §2.3: each word discarded with `P(w_i)=1-√(t/f(w_i))`, `t≈1e-5`, preserving rank but aggressively dropping frequent tokens → 2–10× speedup (NEG-5 38→14 min, 59→60%; HS 41→21 min, 47→55%, Table 1) and better rare-word vectors. Combined with random `R∈[1,C]` down-weighting distant words, updates become sparse: only window + `k` negatives touched per step.
- **Scale matters jointly: data *and* dimension.** Training on Google News (~6B tokens, vocab 1M) with ablations over 24M–783M tokens and 50–600-D shows diminishing returns from data or dimension alone (Table 2 of 1301.3781) — the 2013 pitfall was 50–100-D vectors on huge data. Single-CPU CBOW-300 trains on 783M words in ~1 day (36% total analogy accuracy), Skip-gram-300 in ~3 days (53%); one epoch on 2× data beats three epochs on 1× (Table 5). With DistBelief (50–100 replicas, Adagrad), CBOW-1000 and Skip-gram-1000 reach 63.7% and 65.6% total accuracy on 6B words in ~2 days × 125–140 core-equivalents. Large-data NEG+subsampling pushes total to ~61% (vs 53% without, Table 1 of 1310.4546).
- **Analogy evaluation as a lens on linear structure — with caveats.** The paper introduced the 19,544-question Semantic-Syntactic Word Relationship test (8,869 semantic + 10,675 syntactic; 5 semantic types, 9 syntactic types — Table 1) — e.g., Athens:Greece :: Oslo:Norway (common capital), apparent:apparently :: rapid:rapidly (adverb), great:greater :: tough:tougher. Evaluation computes `X = vector("biggest")-vector("big")+vector("small")` and returns the nearest cosine neighbor (exact match required, query words discarded). Word2Vec decisively beats prior public vectors (≤12–25% total) and the RNNLM (24.6%) with up to 53–66% total (Tables 4, 6 of 1301.3781). Notes emphasize exact-match penalizes synonyms (ceiling ~60% understates quality) and static vectors cannot handle polysemy ("bank" river vs finance) — previews contextual [[transformer]].
- **Phrases and additive compositionality extend the paradigm.** [[source-distributed-representations-of-words-and-phrases-and-their-compositionality]] §4–5: phrases like "Boston Globe" or "Air Canada" cannot compose from words → data-driven bigram score `(count(w_i w_j)-δ)/(count(w_i)·count(w_j))` > threshold → single token; 2–4 passes with decreasing threshold build longer phrases (e.g., "San Jose Mercury News"). Trained on 1B (up to 33B) news tokens, phrase analogy set (3,218 questions, 5 categories: newspapers, NHL/NBA teams, airlines, executives — e.g., Montreal:Montreal Canadiens :: Toronto:Toronto Maple Leafs) reaches 72% with HS+subsampling 1000-D. Separately, **additive compositionality** emerges: `vec("Russia")+vec("river")≈vec("Volga River")`, `vec("German")+vec("airlines")≈vec("Lufthansa")` — sum of vectors ≈ product of context distributions (AND), explaining why addition works.

## How It Works

```
Feedforward NNLM (Bengio 2003)          CBOW (1301.3781)              Skip-gram (1301.3781)
─────────────────────────               ────────────────                ──────────────────
1-of-V (N=10) → shared proj N×D        bag-of-words: average          current word
         ↓                               4+4 context vectors             ↓
    dense P =500–2000                    ↓ (shared proj)               projection D
         ↓ (N·D·H matmul)               projection D                    ↓
    hidden H=500–1000                log-linear +                   log-linear +
         ↓                             Huffman softmax                Huffman softmax → NEG
    softmax over V (H·V)               → predict middle word         → predict 2R context words
Q=N·D+N·D·H+H·V                        Q=N·D+D·logV                  Q=C·(D+D·logV)
```

**Modern (1310.4546) training setup:** For each position `t`, predict `2R` context words (`R∼[1,C]`). Loss per pair:

- Original: `P(o|c)=exp(u_o^T v_c)/Σ_V exp(u_w^T v_c)` → Huffman `log₂(V)` via tree.
- Standard: `J_neg = -log σ(u_o^T v_c) - Σ_{k=1}^K log σ(-u_k^T v_c)` (slide 27 of CS224N 2026 Lecture 2: Word Vectors (Slides) — Word2Vec, Negative Sampling, GloVe, Evaluation), `K=5–20` (small) or 2–5 (large), noise `U^{3/4}/Z`.

**Subsampling:** Before scanning, discard `w_i` with `P(w_i)=1-√(t/f(w_i))`, `t≈1e-5` (§2.3 of 1310.4546, §3.3 of [[source-cs224n-winter2023-lecture1-notes-introduction-word2vec]]). **Phrases:** Pre-process corpus with bigram score (Eq.6 of 1310.4546) threshold passes → single tokens.

**Optimization:** SGD, initial `lr=0.025` linearly decayed to 0; 1–3 epochs; DistBelief asynchronous Adagrad for distributed (50–100 replicas). Vocabulary 1M (30k ablations), `D` up to 1000. Published C++ `word2vec` (code.google.com/p/word2vec) billions words/hour; >1.4M entity vectors on >100B words. Sparse updates: only window + `k` negatives rows touched per step → hash/ sparse-row ops critical at millions of vectors (slides 28-29).

**Sentence completion use:** Skip-gram scores sentence by summing predictions of surrounding words given missing word; Skip-gram alone 48.0% on MSR Sentence Completion (1,040 questions, 5 choices), **58.9% when combined with RNNLMs** — surpassing prior 55.4% RNNLM-ensemble SOTA (Table 7, 1301.3781). Phrase model + additive composition gives longer-text handling with minimal compute.

## Practical Implications

- **Foundation for static embeddings in production RAG and beyond.** Word2Vec vectors seeded the dense embedding paradigm now core to [[retrieval-augmented-generation]] (chunk embedding, nearest-neighbor vector search), text classification, and legacy [[pretraining]] initialization before contextual [[transformer]] embeddings subsumed type-level semantics. NEG + subsampling are the defaults every implementation still uses ([[source-distributed-representations-of-words-and-phrases-and-their-compositionality]]).
- **Design lesson: trade model capacity for data scale.** Removing the hidden layer is deliberate under-parameterization that buys ability to train on orders-of-magnitude more data — the central scaling argument anticipating Chinchilla-style data×size joint scaling in [[scaling-laws]] discussions. NEG/subsampling push this further by making each window cheaper and less noisy.
- **When to use which:** CBOW for speed and syntactic morphology tasks; Skip-gram (NEG, `K=5–15`) for semantic similarity, analogy, and rare-word handling (better semantics despite similar syntax). NEG outperforms HS in most settings except phrase analogy where HS+subsampling wins (Table 3 of 1310.4546: HS+subsample 47% vs NEG-15 42% on phrases) — task-specific choice. For modern systems, both typically replaced by subword-aware (FastText) or contextual (BERT/Transformer) embeddings, but static Word2Vec remains strong lightweight baseline and pedagogical reference.
- **Phrases and additive composition for retrieval.** Treating "New York Times" as single token solves idiomatic non-compositionality for retrieval (recall on "Air Canada" distinct from "air"+"Canada"); additive `Germany+capital≈Berlin` enables simple longer-text composition without recursive matrices — useful for cheap query expansion before cross-encoder reranking.
- **Engineering cautions:** Static vectors cannot handle polysemy ("bank" river vs finance); analogy metric penalizes synonyms (exact match required) so reported ceilings (~60% exact) understate qualitative utility; OOV unrepresentable — mitigated later by subword [[tokenization]] (BPE) and character n-grams. Frequent-word subsampling threshold `t` heuristic — tune per corpus; `U^{3/4}` power not theoretically derived but empirically robust.

## Connections

- Extends feedforward NNLM (Bengio 2003) and RNNLM baselines by simplifying them; efficiency analysis directly motivates the Huffman softmax design in [[source-efficient-estimation-of-word-representations-in-vector-space]] §2–§3, later superseded by NEG.
- Produces [[embeddings]] — Word2Vec is the canonical method for learning distributed word representations, predating contextual [[self-attention]]/[[transformer]] embeddings and contrasted with count-based [[glove]] (2014) which re-derives its linear regularities as log-bilinear regression on co-occurrence ratios ([[source-glove-global-vectors-for-word-representation]] §3.3).
- Input relies on word-level [[tokenization]] (1-of-V 1M vocab, Huffman frequency classes); contrasts with modern subword tokenizers that address its OOV limitation; phrase tokenization via bigram scoring is precursor to BPE merges.
- Serves as early form of [[pretraining]]: self-supervised prediction on raw text without labels, whose vectors transfer to downstream NLP tasks (sentiment [12], paraphrase [28], SemEval-2012 Task 2 [11,31], KB completion); scale to 100B words/day anticipates LLM pretraining.
- Powers the non-parametric memory of [[retrieval-augmented-generation]]: dense vector indices for similarity search; Skip-gram/CBOW vectors were first widely reused retrieval embeddings before dense retrievers (DPR, etc.); phrase vectors handle idiomatic retrieval.
- Contrasts with [[transformer]] / [[self-attention]]: where Word2Vec learns one vector per type, transformers learn context-dependent vectors via self-attention — the architectural successor that removed recurrence rather than the hidden layer.
- Related to [[scaling-laws]] discussions: paper's Table 2 explicitly demonstrates that dimension and data must scale together (anticipating compute-optimal scaling analysis); 1310.4546 shows large data crucial (phrase 66%→72% from 6B→33B).
- Influences [[glove]] — GloVe's §3 explicitly re-expresses Skip-gram as weighted cross-entropy over `X` and proposes least-squares alternative that trains only on non-zero co-occurrences with weighting `f(X_ij)=(X_ij/100)^{3/4}`; slides 30-37 teach both side-by-side.

## Open Questions

- How to choose between Huffman hierarchical softmax, NEG (`K` and `U^{3/4}` vs other `P_n`), and GloVe's `f(X_ij)` weighting — task-specific optimum (NEG best on word analogy, HS+subsampling best on phrase analogy) vs universal default?
- Can static type-level vectors be salvaged via sense-specific or multi-prototype variants [9], or are contextual embeddings strictly dominant for polysemy and compositionality — and can additive composition (`Russia+river≈Volga`) be systematized beyond qualitative Table 5?
- What is the optimal subsampling `t` and phrase-scoring threshold `δ`/passes for balancing syntactic vs semantic performance across domains and languages (inflectional languages vs English), and for building phrase vocabularies of millions without blowing up `V`?
- With GloVe reaching 75% vs Word2Vec 61% (NEG) on 6B analogy under controlled comparison, is the gap due to objective (least squares vs NEG) or to global `X` vs window scanning — and how does it interact with Common Crawl 42B saturation (GloVe 75%→77% vs Word2Vec phrase 66%→72%)?

## Sources

- [[source-efficient-estimation-of-word-representations-in-vector-space]]
- [[source-distributed-representations-of-words-and-phrases-and-their-compositionality]]
- CS224N 2026 Lecture 2: Word Vectors (Slides) — Word2Vec, Negative Sampling, GloVe, Evaluation
- [[source-cs224n-winter2023-lecture1-notes-introduction-word2vec]]
- [[source-glove-global-vectors-for-word-representation]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
