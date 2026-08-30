---
type: concept
title: "Embeddings"
summary: Embeddings (distributed representations) are dense, continuous vectors ∈ ℝ^D (typically D = 50–4096) that encode discrete symbols — words, subwords, sentences, or documents — such that geometric proximity corresponds to…
visibility: public
aliases:
  - Distributed Representations
  - Word Embeddings
  - Vector Representations
  - Dense Vectors
  - wiki/embeddings
tags:
  - llm-fundamentals
  - rag
created: 2026-08-25
updated: 2026-08-26
status: draft
sources:
  - "[[source-efficient-estimation-of-word-representations-in-vector-space]]"
  - "[[source-distributed-representations-of-words-and-phrases-and-their-compositionality]]"
  - "[[source-glove-global-vectors-for-word-representation]]"
  - "CS224N 2026 Lecture 2: Word Vectors (Slides) — Word2Vec, Negative Sampling, GloVe, Evaluation"
  - "[[source-cs224n-word-vectors-ii-glove-evaluation]]"
  - "[[source-cs224n-winter2023-lecture1-notes-introduction-word2vec]]"
  - "[[source-improving-distributional-similarity]]"
  - "[[source-evaluation-methods-unsupervised-word-embeddings]]"
  - "CS224n 2026 Lecture 01: Introduction and History of NLP (Slides)"
related:
  - "[[word2vec]]"
  - "[[glove]]"
  - "[[tokenization]]"
  - "[[transformer]]"
  - "[[pretraining]]"
  - "[[retrieval-augmented-generation]]"
  - "[[self-attention]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Embeddings (distributed representations) are dense, continuous vectors ∈ ℝ^D (typically D = 50–4096) that encode discrete symbols — words, subwords, sentences, or documents — such that geometric proximity corresponds to…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/llm-fundamentals/concepts/tokenization">Tokenization</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/word2vec">Word2Vec</a></li><li><a href="/llm-fundamentals/concepts/glove">GloVe</a></li><li><a href="/llm-fundamentals/concepts/tokenization">Tokenization</a></li><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-efficient-estimation-of-word-representations-in-vector-space">Efficient Estimation of Word Representations in Vector Space</a></li><li><a href="/llm-fundamentals/sources/source-distributed-representations-of-words-and-phrases-and-their-compositionality">Distributed Representations of Words and Phrases and their Compositionality</a></li><li><a href="/llm-fundamentals/sources/source-glove-global-vectors-for-word-representation">GloVe: Global Vectors for Word Representation</a></li><li><a href="/llm-fundamentals/sources/source-cs224n-word-vectors-ii-glove-evaluation">CS224N Lecture Notes Part II: Word Vectors II — GloVe, Evaluation and Training</a></li><li><a href="/llm-fundamentals/sources/source-cs224n-winter2023-lecture1-notes-introduction-word2vec">CS224N Winter 2023 Lecture Notes 1 (Draft): Introduction and Word2Vec</a></li><li><a href="/llm-fundamentals/sources/source-improving-distributional-similarity">Improving Distributional Similarity with Lessons Learned from Word Embeddings</a></li><li><a href="/llm-fundamentals/sources/source-evaluation-methods-unsupervised-word-embeddings">Evaluation methods for unsupervised word embeddings</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview

**Embeddings** (distributed representations) are dense, continuous vectors `∈ ℝ^D` (typically `D` = 50–4096) that encode discrete symbols — words, subwords, sentences, or documents — such that geometric proximity corresponds to semantic and/or syntactic similarity. Popularized in the modern era by [[word2vec]] (Mikolov et al. 2013, [[source-efficient-estimation-of-word-representations-in-vector-space]] + [[source-distributed-representations-of-words-and-phrases-and-their-compositionality]] (NEG/subsampling/phrases)) and its count-based counterpart [[glove]] (Pennington et al. 2014, [[source-glove-global-vectors-for-word-representation]]), embeddings are the substrate for nearly every LLM capability: they form the first layer of [[transformer]]s, the index of [[retrieval-augmented-generation]], and the transferred knowledge of [[pretraining]].

## Key Ideas

- **From atomic indices to distributed meaning.** Classical N-gram systems treat words as atomic vocabulary indices with no notion of similarity. Embeddings replace this with dense vectors where cosine distance captures graded similarity — *not just* "France is close to Italy" but that words can have **multiple degrees of similarity** (morphological, syntactic, semantic) simultaneously, measurable via vector offsets [20]. [[source-cs224n-winter2023-lecture1-notes-introduction-word2vec]] (§2) grounds this via Zuko/tea signifier/signified and one-hot motel/hotel orthogonal failure vs. WordNet's incompleteness.
- **Linear regularities emerge from scale — and are explained by ratios.** Training shallow log-linear models on billions of tokens produces `vector("King") - vector("Man") + vector("Woman") ≈ vector("Queen")`, and `X = vector("biggest")-vector("big")+vector("small") → nearest neighbor = "smallest"` — the analogy test harness of [[source-efficient-estimation-of-word-representations-in-vector-space]] covering 19,544 semantic/syntactic questions. [[source-glove-global-vectors-for-word-representation]] (§3) derives this: ratios `P(k|ice)/P(k|steam)` (8.9 vs 0.085 vs 1.36) cancel noise from non-discriminative probes, implying `w_i^T w̃_j + b_i + b̃_j = log X_ij` (Eq.7), so differences `w_i - w_j` encode meaning components linearly. Quality correlates with both data scale and dimensionality; 50–100-D vectors underfit, while 300–1000-D vectors continue to improve when fed more tokens (Table 2 of 1301.3781). GloVe reaches 75% analogy at 300D/6B (vs 53% Skip-gram/36% CBOW at 783M) after same corpus/vocab/window/time.
- **Three historical families, one vector space idea.** **Predictive/window** (Word2Vec CBOW/Skip-gram with NEG `J_neg=-log σ(u_o^T v_c)-Σ_k log σ(-u_k^T v_c)`, noise `U^{3/4}`, subsampling `1-√(t/f)`), **Count-based** ([[glove]] weighted least squares `J=Σ f(X_ij)(w_i^T w̃_j + b_i + b̃_j - log X_ij)^2`, `f(x)=(x/100)^{3/4}` if `x<100` else 1, training only on non-zero `X`), and **Hybrid extensions** (phrases as tokens via bigram score `(count(w_i w_j)-δ)/(count(w_i)count(w_j))` → 72% phrase analogy at 33B, additive compositionality `Russia+river≈Volga River`) — all produce **static/type-level** embeddings (one vector per type, fast/reusable, blind to polysemy). **Contextual** embeddings assign a vector per token *in context* via [[self-attention]] in [[transformer]]s — the modern standard, where the embedding layer is just the first of many learned representations. Understanding static embeddings remains essential for the retrieval and evaluation literature ([[source-cs224n-word-vectors-ii-glove-evaluation]] §2).
- **The embedding matrix as lookup table.** Conceptually `W_e ∈ ℝ^{V × D}` indexed by integer token IDs from [[tokenization]]. During training, the matrix is updated via SGD/Adagrad (or AdaGrad for GloVe); after training, it serves as a nearest-neighbor index: any string is mapped through the same tokenizer → IDs → vectors → cosine search over the matrix or a vector DB. Final GloVe often uses `W + W̃` sum; Word2Vec averages `V` and `U`.
- **Evaluation is a science (CS224N §2).** Intrinsic: analogy via cosine addition (discarding queries, exact-match, ~60% ceiling penalizes synonyms) and WordSim353/MEN human correlation (e.g., tiger-cat 7.35, stock-jaguar 0.92) — fast proxy for tuning `K`, `t`, `x_max`, `α`, `D`, `C`. Extrinsic: real task (e.g., NER "Chris Manning lives in Palo Alto" window classification, CoNLL F1 GloVe 88.81 vs Skip-gram 88.5). Lesson: establish correlation before trusting intrinsic; swap one subsystem → winning ([[source-cs224n-word-vectors-ii-glove-evaluation]] Fig.1).
- **Two audit papers discipline the whole field.** [[source-improving-distributional-similarity]] (Levy et al., TACL 2015) unifies count-based vs predictive families under one hyperparameter framework and shows most reported quality gaps come from tuning choices — window size, sub-sampling, negative sampling — transferable to classic PPMI+SVD pipelines, leaving "no global advantage to any single approach." [[source-evaluation-methods-unsupervised-word-embeddings]] (Schnabel et al., EMNLP 2015) shows indirect intrinsic scores correlate weakly with downstream performance and proposes direct intrinsic evaluation via human-judged nearest neighbors (connotation agreement, categorization, frequency structure); different methods win on different criteria. Together: embedding *quality* claims must isolate hyperparameters and validate against the target application, not leaderboards.
- **Beyond words.** The same mathematics applies to sentence/document embeddings (mean of word vectors, or dedicated encoders like Sentence-BERT), image patches, and code — any modality mapped into a shared vector space for retrieval or alignment. Phrase tokens and additive `sum≈AND` of context distributions (1310.4546 §5) are early forms of compositional document embeddings.

## How It Works

### Static embeddings (Word2Vec paradigm, 1301.3781 + 1310.4546)

1. **Vocabulary:** top `V` ≈ 400K–1M most frequent words, 1-of-V encoding (later phrase tokens added via bigram scoring passes).
2. **Model:** CBOW predicts middle word from averaged context `Q = N·D + D·log₂(V)`; Skip-gram predicts context from current word `Q = C·(D + D·log₂(V))` — both log-linear, no hidden layer, Huffman hierarchical softmax for `log V` efficiency → in practice **NEG** `log σ(u_o^T v_c)+ Σ_k log σ(-u_k^T v_c)` with `K=5–20` and `U^{3/4}` noise + **subsampling** `P(w)=1-√(t/f)` `t≈1e-5` (sparsely updating only window+Ks).
3. **Training:** SGD on raw text (Google News 6B tokens), linearly decayed `lr 0.025→0`, 1–3 epochs; DistBelief Adagrad for distributed scale-up (50–100 replicas). C++ `word2vec` billions words/hour.
4. **Inference:** `word (or phrase) → row in W_e`; cosine similarity or analogy algebra (`king-man+woman≈queen`, `Russia+river≈Volga River`, `Montreal:Canadiens :: Toronto:Maple Leafs`).

### Static embeddings (GloVe paradigm, 2014)

1. **Co-occurrence:** One pass to build `X_ij` (window 10 symmetric, `X_i=Σ_k X_ik`, `P_ij=X_ij/X_i`).
2. **Objective:** `J=Σ_{X_ij>0} f(X_ij)(w_i^T w̃_j + b_i + b̃_j - log X_ij)^2`, `f(x)=(x/100)^{3/4}` if `x<100` else 1 (only non-zero entries, sparse).
3. **Training:** AdaGrad, shuffle non-zeros, 50 iterations (6B GigaWord5+Wiki).
4. **Inference:** `w_final = w + w̃` often; same cosine search; 75% analogy at 300D/6B.

### Contextual embeddings (Transformer paradigm)

```
Token IDs ──► Embedding matrix W_e (V×D) ──► + Positional encoding
                                                    │
                                                    ▼
                                        Stacked self-attention blocks (N layers)
                                                    │
                                                    ▼
                                            Last-layer hidden states (per-token contextual vectors)
                                                    │
                                                    ▼
                                              LM head / pooled sentence vector
```

Each token's final vector depends on the entire context window via [[self-attention]], enabling distinct vectors for polysemous uses of the same type (e.g., "bank" as river vs. finance) — fixing static's core limitation noted in both CS224N notes and papers.

## Practical Implications

- **The backbone of RAG.** Every [[retrieval-augmented-generation]] pipeline chunks a corpus, embeds chunks into a vector DB (FAISS, Qdrant, Chroma), embeds the query into the same space, and retrieves by nearest-neighbor vector similarity before conditioning generation on retrieved context — the direct application of embedding-space search that Word2Vec validated at scale and [[source-cs224n-word-vectors-ii-glove-evaluation]] evaluates via WordSim353 correlation.
- **Pretraining substrate.** During [[pretraining]], `W_e` is jointly learned with the transformer stack via next-token prediction on trillions of tokens; these embeddings encode much of the model's world knowledge and are reused (or fine-tuned) for downstream tasks, retrieval encoders, and similarity metrics. Static `f` weighting vs NEG/subampling tradeoffs inform modern `U^{3/4}` and capped-loss designs.
- **Evaluation and probing.** Analogy accuracy, word-similarity benchmarks (WordSim353, MEN), and the Microsoft Sentence Completion Challenge (1,040 sentences; Word2Vec+ RNNLM 58.9% SOTA in Table 7 of 1301.3781) are still used to sanity-check embedding quality, though modern evaluation adds bias, robustness, and contextual tests. CS224N §2 warns to correlate intrinsic to extrinsic before optimizing proxy.
- **Engineering tradeoffs.** Dimension (`D`), window size (`C`), `K` negatives, `t` subsampling, `x_max/α` weighting, and training data size jointly determine quality (Table 2 of 1301.3781; GloVe 50D→300D 33%→75%); larger `D` helps only with correspondingly larger `T`. Subword [[tokenization]] (BPE, WordPiece) mitigates the OOV problem of word-level embeddings, and normalization (cosine vs. dot product, length normalization) materially affects retrieval ranking. For production, vector quantization and approximate nearest-neighbor indices trade recall for latency. GloVe's one-pass `X` vs Word2Vec's fine-grained window sampling offers different I/O/compute balances.
- **Static vs. contextual cost:** Static embeddings are tiny (400K×300≈0.5 GB float32) and CPU-searchable; contextual embeddings require a forward pass through a transformer for each query/document, motivating bi-encoder (embedding) vs. cross-encoder (reranking) architectures. Phrase tokens (millions via bigram passes) enlarge `V` but handle idiomatic non-compositionality ("Boston Globe" ≠ Boston+Globe) for retrieval without recurrence.

## Connections

- Instantiated concretely by [[word2vec]] (CBOW/Skip-gram, NEG, subsampling, phrases) — the seminal predictive learner in 1301.3781+1310.4546 — and by [[glove]] (weighted least squares on ratios) — the count-based counterpart that explicitly derives linear structure; both extend the same distributional hypothesis from [[source-cs224n-winter2023-lecture1-notes-introduction-word2vec]] (§2.3 Firth 1957).
- Indexed by IDs from [[tokenization]]; word-level 1-of-V schemes give way to subword BPE/WordPiece in modern LLMs to handle OOV and rare words; phrase scoring is precursor to BPE merges.
- First learned layer of [[transformer]]s and consumed by [[self-attention]]; positional encodings are themselves a form of embedding that adds order information; GloVe's `w_i^T w̃_j` dot product prefigures attention logits.
- Represents the self-supervised knowledge accumulated during [[pretraining]]; the same objective (predict context from word or word from context vs. regress `log X_ij`) is a precursor to LLM next-token pretraining; scale lesson (dim+data together, 1 epoch on 2× data ≈3 epochs on 1×) anticipates [[scaling-laws]].
- Enables [[retrieval-augmented-generation]]: query and corpus embeddings form the non-parametric memory searched via cosine/dot-product similarity; embedding quality directly bounds RAG recall and faithfulness; WordSim353 correlation and analogy are retrieval diagnostics.
- Evaluation via vector arithmetic (analogy offsets) and human correlation is a diagnostic of [[in-context-learning]]-relevant relational knowledge before more complex reasoning benchmarks.
- Compared in [[source-cs224n-word-vectors-ii-glove-evaluation]] — count (GloVe) vs window (Word2Vec) taxonomy and intrinsic vs extrinsic methodology unify the two; [[source-evaluation-methods-unsupervised-word-embeddings]] supplies the direct-intrinsic methodology that CS224N §2's "correlate intrinsic to extrinsic" warning formalizes, and [[source-improving-distributional-similarity]] explains *why* the taxonomy's families perform so similarly once tuned.

## Open Questions

- Are sparse or hybrid (sparse+dense) embeddings more interpretable and efficient than purely dense vectors for retrieval, especially over long documents — and can `f(X_ij)`-weighted sparsity be learned like NEG's sparse updates?
- How to unify static efficiency (one vector per type, precomputable, millions of phrase tokens) with contextual expressivity (one vector per occurrence) — e.g., multi-vector retrieval (ColBERT) or Matryoshka embeddings, and does GloVe's `w + w̃` sum offer a template?
- What is the scaling law for embeddings specifically — is there a compute-optimal `D × T` tradeoff analogous to Chinchilla for full LLMs, and why does GloVe saturate 75%→77% from 6B→42B while Word2Vec phrase 66%→72% from 6B→33B?
- How to debias and calibrate embeddings whose linear regularities can amplify stereotypes (e.g., King-Man+Woman=Queen also encodes gendered occupational biases) — shared by both Word2Vec (NEG/subsampling amplifies frequent co-occurrences) and GloVe (`log X_ij` with `f` weighting)?

## Sources

- [[source-efficient-estimation-of-word-representations-in-vector-space]]
- [[source-distributed-representations-of-words-and-phrases-and-their-compositionality]]
- [[source-glove-global-vectors-for-word-representation]]
- CS224N 2026 Lecture 2: Word Vectors (Slides) — Word2Vec, Negative Sampling, GloVe, Evaluation
- [[source-cs224n-word-vectors-ii-glove-evaluation]]
- [[source-cs224n-winter2023-lecture1-notes-introduction-word2vec]]
- [[source-improving-distributional-similarity]] — hyperparameter audit unifying count-based and predictive families.
- [[source-evaluation-methods-unsupervised-word-embeddings]] — direct intrinsic evaluation; critique of analogy-leaderboard proxy metrics.

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/llm-fundamentals/concepts/rnn">Recurrent Neural Network</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
