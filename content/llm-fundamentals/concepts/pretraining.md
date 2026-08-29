---
type: concept
title: "Pretraining"
summary: Pretraining is the foundational and most computationally demanding phase of LLM development.
visibility: public
aliases:
  - Base Model Training
  - Self-Supervised Pretraining
  - wiki/pretraining
tags:
  - llm-fundamentals
created: 2026-08-23
updated: 2026-08-25
status: draft
sources:
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "Jurafsky & Martin SLP3 Chapter 9: Masked Language Models (syllabus: 'The Transformer')"
  - "[[source-language-models-are-few-shot-learners]]"
  - "[[source-nlp-almost-from-scratch]]"
  - "[[source-training-compute-optimal-large-language-models]]"
  - "[[source-bert-pre-training-of-deep-bidirectional-transformers]]"
  - "[[source-llama-3-herd-of-models]]"
  - "[[source-contextual-word-representations-a-contextual-introduction]]"
  - "[[source-history-human-language-understanding]]"
  - "Learning Representations by Back-Propagating Errors"
  - "[[source-learning-long-term-dependencies]]"
  - "[[source-difficulty-training-rnns]]"
related:
  - "[[transformer]]"
  - "[[tokenization]]"
  - "[[scaling-laws]]"
  - "[[in-context-learning]]"
  - "[[supervised-fine-tuning]]"
  - "[[chinchilla]]"
  - "[[gopher]]"
  - "[[bert]]"
  - "[[llama-3]]"
  - "[[embeddings]]"
  - "[[rnn]]"
  - "[[backpropagation]]"
  - "[[self-attention]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Pretraining is the foundational and most computationally demanding phase of LLM development.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/llm-fundamentals/concepts/transformer">Transformer</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/tokenization">Tokenization</a></li><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li><li><a href="/fine-tuning/concepts/supervised-fine-tuning">Supervised Fine-Tuning</a></li><li><a href="/llm-fundamentals/entities/chinchilla">Chinchilla</a></li><li><a href="/llm-fundamentals/entities/gopher">Gopher</a></li><li><a href="/llm-fundamentals/concepts/bert">BERT</a></li><li><a href="/llm-fundamentals/entities/llama-3">Llama 3</a></li><li><a href="/llm-fundamentals/concepts/embeddings">Embeddings</a></li><li><a href="/llm-fundamentals/concepts/rnn">Recurrent Neural Network</a></li><li><a href="/llm-fundamentals/concepts/backpropagation">Backpropagation</a></li><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-deep-dive-into-llms-like-chatgpt">Deep Dive into LLMs like ChatGPT</a></li><li><a href="/llm-fundamentals/sources/source-language-models-are-few-shot-learners">Language Models are Few-Shot Learners</a></li><li><a href="/llm-fundamentals/sources/source-nlp-almost-from-scratch">Natural Language Processing (Almost) from Scratch</a></li><li><a href="/llm-fundamentals/sources/source-training-compute-optimal-large-language-models">Training Compute-Optimal Large Language Models (Chinchilla)</a></li><li><a href="/llm-fundamentals/sources/source-bert-pre-training-of-deep-bidirectional-transformers">BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding</a></li><li><a href="/llm-fundamentals/sources/source-llama-3-herd-of-models">The Llama 3 Herd of Models</a></li><li><a href="/llm-fundamentals/sources/source-contextual-word-representations-a-contextual-introduction">Contextual Word Representations: A Contextual Introduction</a></li><li><a href="/llm-fundamentals/sources/source-history-human-language-understanding">Human Language Understanding &amp; Reasoning</a></li><li><a href="/llm-fundamentals/sources/source-learning-long-term-dependencies">Learning Long-Term Dependencies with Gradient Descent is Difficult</a></li><li><a href="/llm-fundamentals/sources/source-difficulty-training-rnns">On the Difficulty of Training Recurrent Neural Networks</a></li></ul></nav>
</aside>

## Overview
**Pretraining** is the foundational and most computationally demanding phase of LLM development. It involves training a massive [[transformer]] neural network on trillions of tokens of text scraped from the internet using self-supervised objectives — **causal (autoregressive) next-token prediction** for decoder models (GPT, [[llama-3]]) or **masked language modeling (Cloze)** for encoder models ([[bert]]). The resulting "Base Model" acts as a statistical compressor and simulator of web text, acquiring broad world knowledge, linguistic grammar, and [[in-context-learning]] capabilities. The 2018 [[bert]] masked-LM paradigm and the 2024 [[llama-3]] 15T-token data pipeline bookend the modern understanding of pre-training at opposite ends of scale. Historical lineage — from 1986 [[backpropagation]] (Learning Representations by Back-Propagating Errors) through 1994's proof that [[rnn]]s struggle with long-term gradient transport ([[source-learning-long-term-dependencies]]) and its 2013 clipping remedy ([[source-difficulty-training-rnns]]), to the Dædalus history that frames the 2018 self-supervised break ([[source-history-human-language-understanding]]) — explains why pretraining migrated from recurrent to attention-based substrates.

## Key Ideas
- **Lossy Compression of the Internet:** As framed by [[andrej-karpathy]], pretraining can be understood as compressing petabytes of web text into gigabytes of neural network weights. The model extracts general grammar, world knowledge, and reasoning patterns.
- **Two Families of Objective — Causal LM vs Masked LM:** Modern pre-training splits into (a) **causal/autoregressive LM** (GPT, [[llama-3]]): `ℒ = -∑ log P(t_i | t_<i)` with causal masking, the dominant paradigm for generative LLMs; and (b) **masked LM / Cloze** ([[bert]]): randomly mask 15% of WordPiece tokens (80% `[MASK]`, 10% random, 10% unchanged) and predict only masked positions with bidirectional context — enabling deep bidirectionality where every layer fuses left and right context. [[source-bert-pre-training-of-deep-bidirectional-transformers]] §5.1 proves MLM dominates LTR: replacing MLM with left-to-right LM collapses SQuAD F1 88.5→77.8 and MRPC 86.7→77.5, irrecoverable even with a BiLSTM. BERT adds **Next Sentence Prediction (NSP)** (50% IsNext on `[CLS]` vector C) for sentence-pair tasks, later shown partially replaceable by document-level contiguous batching (RoBERTa). Prefix LM (T5/UL2) is a third hybrid.
- **Masked-LM training regimes (Jurafsky & Martin Ch 9, SLP3 Chapter 9: Masked Language Models (syllabus: 'The Transformer')):** loss computed only on the masked set $M$: $\mathcal{L} = -\frac{1}{|M|}\sum_{i\in M}\log P(x_i|h^L_i)$ (ELECTRA, Clark et al. 2020, instead trains on *all* positions via a replaced-token-detection head); input = word + position + segment embeddings with `[CLS]`/`[SEP]`. Corpus regimes: BERT = Wikipedia + BooksCorpus 3.3B words (BooksCorpus since dropped for IP reasons; modern encoders use filtered web + Wikipedia exactly like causal models), ~40 epochs to converge; **RoBERTa variant** drops NSP, packs contiguous sentences to length 512 with doc-boundary `[SEP]`, batches 8K–32K. Multilingual encoders sample data/vocab as $q_i = p_i^{\alpha}/\sum_j p_j^{\alpha}$ with $\alpha=0.3$ upweighting rare languages (XLM-R: ~300B tokens / 100 languages) — see [[multilinguality]]. Encoder spec scale: BERT ~100M vs XLM-R ~550M params.
- **Proto-pretraining — Collobert et al. 2011 ([[source-nlp-almost-from-scratch]]):** the direct ancestor of the self-supervised paradigm. A ranking criterion — corrupt the middle word of a window, train to score true > corrupted — over 852M Wikipedia+RCV1 words produced the first influential neural [[embeddings]] without an expensive softmax partition function; initializing supervised models' lookup tables from this LM closed most of the gap to feature-engineered SOTA across POS/chunking/NER/SRL. The ranking idea simplifies into negative-sampling [[word2vec]] (2013), then contextualizes into ELMo/BERT — the "pretrain representations on unlabeled text → fine-tune" template is fully formed here in 2011, including dictionary "breeding" curricula (5K→130K) that anticipate modern data-scaling practice.
- **Data Engineering & Sampling Mixture — the 15T-token lesson:**
  - *Data Sources:* Common Crawl, FineWeb, RedPajama, WebText2, Books, Wikipedia, GitHub code, ArXiv papers — as in [[source-language-models-are-few-shot-learners]] (GPT-3, 300B) and scaled to 15.6T in [[source-llama-3-herd-of-models]] (50% general, 25% math/reasoning, 17% code, 8% multilingual).
  - *Quality Filtering & Reweighting:* GPT-3 upsampled Wikipedia/Books/WebText; Llama 3 extends to custom HTML parsing (preserves math/code/alt-text, strips markdown), PII/safety domain blocklists, n-gram/KL/dirty-word heuristics, and **DistilRoberta classifiers** (Wikipedia-referenced + Llama-2-judged) plus domain-specific code/math classifiers — the longest section of the Llama 3 report. Knowledge classification downsamples over-represented arts/entertainment; mix tuned via scaling-law sweeps.
  - *Deduplication:* MinHash / LSH global doc dedup + URL dedup (keep-latest) + aggressive **line-level dedup** (lines >6× per 30M bucket, ccNet-style) to remove boilerplate/cookie warnings and prevent memorization and contamination — critical for document-level corpora (BERT already required contiguous documents, not shuffled Billion Word; Llama 3 generalizes to three dedup tiers).
  - *Annealing:* Llama 3 upsamples high-quality code/math at LR decay — 8B GSM8K +24% / MATH +6.4% (405B negligible due to stronger ICL), and doubles as a data-valuation probe.
- **Governed by [[scaling-laws]] — Chinchilla → Llama 3 overtraining:** Empirical power laws demonstrate that validation loss predictably scales as a power-law function of compute budget ($C$), parameter count ($N$), and dataset size ($D$). Pre-Chinchilla, GPT-3 (175B/300B tokens) and [[gopher]] (280B/300B) followed Kaplan's $N \propto C^{0.73}, D \propto C^{0.27}$ and were dramatically undertrained. Post-Chinchilla [[source-training-compute-optimal-large-language-models]], the field adopted **equal scaling** $N \propto C^{0.5}, D \propto C^{0.5}$ ($\approx 20$ tokens per parameter), exemplified by [[chinchilla]] (70B on 1.4T tokens) outperforming a 4× larger model at the same FLOPs. [[source-llama-3-herd-of-models]] §3.2.1 validates this with IsoFLOPs → `N*(C)=A·C^0.53` and a **two-stage NLL→accuracy forecast** accurate across 4 orders, but shows **inference-optimal overtraining** is now standard: 405B at 15.6T (≈38 tok/param, near-optimal) while 8B on 15T (≈1,875 tok/param) is 94× Chinchilla-optimal, deliberately amortizing serving cost.
- **Compute-Optimal vs Inference-Optimal Data Budget:** Chinchilla rule-of-thumb $D_{opt} \approx 20 \times N$ minimizes *training* FLOPs at fixed loss; however, for production the *lifetime* cost (one training + billions of inferences) favors **overtraining small models** — e.g., 8B on 15T tokens. Table 3 of [[source-training-compute-optimal-large-language-models]] projects 10B → 205B tokens, 67B → 1.5T, 175B → 3.7T, 280B → 5.9T; Llama 3 demonstrates the industry deliberately exceeds these by up to 100× for small models.
- **LR Schedule Must Match Data Budget:** Chinchilla's key fix: cosine LR (10× decay) should span $\approx D$ tokens; fixed long schedule (130B horizon) overestimates loss at small D and biases toward oversized models. Llama 3 follows this with 2000-step warmup → cosine →0.1 peak, and uses **continued pre-training** (8K→128K via RoPE θ=500K + doc-boundary masking) plus **annealing** (linear decay on quality data) as the LR tail.
- **Bidirectional vs Causal Architecture Choice:** [[bert]] uses bidirectional encoder (all layers attend both ways) for understanding tasks; GPT/Llama use causal decoder (left-only) for generation. The choice is not merely implementation — it determines whether the pre-trained representation can condition on future context, with ~10-point SQuAD gap between the two on identical data.
- **Base Model Behavior:** A base model is a document completer, **not an assistant**. If prompted with a question, it may generate another question or continue text in the style of an internet forum or exam sheet. (Llama 3 base also exhibits this before its iterative SFT→RS→DPO post-training.)
- **Historical Arc:** [[source-nlp-almost-from-scratch]] (Collobert 2011: ranking-LM embeddings + semi-supervised init — the "almost from scratch" manifesto) → [[source-contextual-word-representations-a-contextual-introduction]] traces discrete integers → Brown clusters → count-based → [[word2vec]] (Mikolov 2013, 1.6B words) → ELMo (2018, BiLSTM [[rnn]] LM, 9–16% relative error reductions) → [[bert]] (2018, 45% over ELMo on SQuAD) — the lineage that makes the 1.4T→15T data scaling of Chinchilla/Llama legible as the next step. Manning's four-era history ([[source-history-human-language-understanding]]: 1950-69 MT → 1970-92 rule-based SHRDLU → 1993-2012 empirical ML → 2013-present deep/self-supervised) situates pretraining as Era 4's culmination; [[backpropagation]]'s 1986 distributed-representation lesson and the 1994/2013 vanishing-gradient diagnoses explain why that era required [[transformer]]'s $O(1)$ [[self-attention]] path to scale pretraining beyond recurrent limits.

## How It Works
1. **Choose Objective Family:** Causal LM (decoder, left-only) for generative base models (GPT/Llama) vs masked LM (+ optionally NSP) for bidirectional encoders ([[bert]]) — or prefix LM / mixture-of-denoisers for encoder-decoder hybrids. BERT: mask 15% WordPiece (80/10/10), loss only on masked; Llama 3: standard next-token on 15.6T.
2. **Plan Compute-Optimal Scale:** Given FLOPs budget $C$, set $N_{opt} \approx (C/6)^{0.5} \cdot G$ and $D_{opt} \approx (C/6)^{0.5} / G$ (Chinchilla frontier, $G=(\alpha A/\beta B)^{1/(\alpha+\beta)}$; in practice $D \approx 20N$). See [[scaling-laws]] and [[source-training-compute-optimal-large-language-models]] for the three estimation methods (envelope, IsoFLOP, parametric $\hat{L}=E+A/N^{\alpha}+B/D^{\beta}$). For inference-optimal serving, deliberately pick smaller $N$ and train far past $D_{opt}$ (Llama 3 8B on 15T). Validate via [[source-llama-3-herd-of-models]] two-stage NLL→accuracy scaling forecast before committing to full run.
3. **Curate Data Pipeline (Llama-3 grade):** Custom HTML extraction (preserve math/code, strip markdown) → PII/safety blocklists → URL/MinHash/line dedup (3 tiers) → heuristic filters (repetition, dirty words, KL outliers) → DistilRoberta quality classifiers (general + domain-specific code/math) → knowledge classification for mix tuning (50/25/17/8) → scaling-law mix sweeps on small models → final 15T+ corpus at 128K vocab (tiktoken + 28K multilingual). BERT's simpler precursor: BooksCorpus + Wikipedia, duplication factor 10 with fresh masking, 90/10 seq-len 128/512 split, document-level contiguous sentences (critical for NSP/long span).
4. **Batching & Tokenization:** Trillions of tokens are tokenized using [[tokenization]] (BERT: WordPiece 30K; Llama 3: 128K tiktoken-based, 3.94 chars/token) and packed into batches with fixed context length (BERT 128→512, Chinchilla 2K at 1.5M→3M tokens, Llama 3 8K→128K via continued pre-training + RoPE 500K). Apply doc-boundary attention mask (Llama 3) to prevent cross-document attention in long-context phase.
5. **Distributed Compute Cluster:** Synchronous distributed data parallelism (FSDP, Megatron-LM tensor parallelism, pipeline parallelism) across thousands of GPUs/TPUs (Chinchilla/Gopher on TPU v3/v4 with JAX + Haiku; Llama 3 405B on up to 16K H100 with Grand Teton + MAST + Tectonic 240PB @2 TB/s + RoCE 400 Gbps Clos with E-ECMP 16 flows or InfiniBand).
6. **Optimization & Schedule:** AdamW, SwiGLU, cosine schedule matched to $D$ (10× decay over $\approx D$ tokens) with 2000-step warmup, batch 250K–4M tokens (Llama 3), WD=0.1·LR, geLU (BERT) vs SwiGLU (Llama), mixed-precision BF16/FP8 forward/backward + float32 optimizer. BERT: Adam 1e-4, 1M steps, batch 256×512; Three-phase Llama: initial 8K → continued long-context 128K (RoPE adaptation) → annealing (linear decay on high-quality code/math). All trained via [[backpropagation]] (Learning Representations by Back-Propagating Errors) with gradient norm clipping (Pascanu et al. [[source-difficulty-training-rnns]]) to survive high-curvature walls, and gradient computation via matrix calculus in `gradient-notes.pdf`.
7. **Checkpointing & Reliability:** Periodic per-GPU 1MB–4GB state saves; Tectonic burst handling (peak 7 TB/s), frequent checkpointing to bound lost work at 16K-GPU scale.

## Practical Implications
- **Compute Cost Barrier & Amortization:** Frontier pretraining requires millions of dollars in compute ($10M–$100M+; Llama 3 405B: 3.8×10²⁵ FLOPs ≈50× Llama 2). However, Chinchilla proves that at a fixed $C$, a smaller model trained longer (e.g., 70B/1.4T) beats a larger undertrained one (280B/300B) while **reducing lifetime cost** — training is once, but [[inference]] is paid billions of times. Llama 3's 8B on 15T (1,875 tok/param) is the logical extreme: pay more pre-training to make every future inference 10× cheaper.
- **Dataset Engineering Is Now First-Class — the 15T lesson:** MassiveText's rebalanced mixture (upweighting MassiveWeb/Wikipedia for 1.4T tokens) and Llama 3's 15T pipeline (HTML parser → PII/safety → 3-tier dedup → quality classifiers → mix sweeps → annealing) show that high-quality data collection, filtering, deduplication, and multi-epoch handling are as critical as model architecture. Document-level contiguous corpora (BERT) → three-tier dedup + line dedup (Llama 3) is the direct lineage.
- **Overtraining for Serving Is Standard:** Many production models deliberately train **beyond** the Chinchilla optimum (e.g., 8B on 15T tokens ≈ 1800 tok/param) to push inference cost even lower — a strategy directly motivated by [[source-training-compute-optimal-large-language-models]]'s amortization argument and validated by [[source-llama-3-herd-of-models]] (405B negligible anneal gain already shows frontier models near saturation vs 8B +24% GSM8K from annealing).
- **Architecture vs Data Tradeoff Made Explicit:** [[bert]] 110M→340M scaling already hinted larger pre-trained models help even at 3.6K fine-tuning examples; Llama 3 chooses *not* to switch to MoE ("dense Transformer ... to maximize training stability") because data/I/O and infra, not MoE, dominate at 400B scale with current tools.
- **Bidirectional Encoders Still Matter for NLU:** [[bert]]-style MLM remains the default for classification/NER/retrieval (bi-encoder dense retrieval for [[retrieval-augmented-generation]]) where bidirectional context matters more than generation — use encoder for understanding, decoder for generation, often both in one stack.
- **30% New Data on 40B Anneal Window as Valuation Probe:** Llama 3's annealing protocol (linear LR→0 on 40B, 30% new data) offers a cheap way to judge domain datasets before full scaling-law sweep — a practical addition to the pretraining toolbox.
- **Foundation for In-Context Adaptation:** The scale and diversity of the pretraining distribution directly determine the model's zero-shot and few-shot [[in-context-learning]] capabilities. Chinchilla's uniform gains on MMLU (+7.6%), BIG-bench (+10.7%), and closed-book QA validate that equal scaling improves all downstream capabilities per FLOP; Llama 3's MGSM 91.6 / QuALITY 95.2 show multilingual/long-context emerge only at 15T+ scale.
- **Open-Source Base Weights:** High-quality open weights (e.g., [[llama-3]] 405B/70B/8B, Mistral, Qwen) allow developers to bypass pretraining and focus on post-training and application engineering; the Llama 3 report's transparency is the most detailed public recipe for doing so.

## Connections
- Input data is prepared via [[tokenization]] — WordPiece 30K ([[bert]]) → BPE/tiktoken 128K ([[llama-3]], 3.94 chars/token) evolution.
- Executed on the [[transformer]] architecture — encoder (bidirectional [[self-attention]], [[bert]]) vs decoder (causal, [[llama-3]]); encoder-decoder hybrids (T5) in between. Transformer replaced [[rnn]]s precisely because recurrent product-of-Jacobians vanishing (diagnosed in [[source-learning-long-term-dependencies]] / [[source-difficulty-training-rnns]]) prevented scaling long-context pretraining.
- Trained via [[backpropagation]] through time and depth — the generalized delta rule of Learning Representations by Back-Propagating Errors made practical by matrix-calculus notes and stabilized by gradient clipping.
- Historical narrative in [[source-history-human-language-understanding]] places pretraining as Era 4 culmination (2018 self-supervised break from Era 3 empirical ML).
- Produces [[embeddings]] — from static [[word2vec]] (one vector per type) through contextual ELMo/[[bert]] `T_i` to decoder hidden states; the arc narrated in [[source-contextual-word-representations-a-contextual-introduction]] where ELMo→BERT is the 2018 inflection before 15T decoder scaling.
- Governed by empirical [[scaling-laws]] — Kaplan `C^0.73` → Chinchilla `C^0.5` (20 tok/param) → Llama 3 inference-optimal overtraining (8B on 15T) and two-stage NLL→accuracy forecasting.
- Realized concretely by [[bert]] (340M, 3.3B tokens, MLM+NSP) and [[llama-3]] (405B, 15.6T tokens, causal LM, 128K context) as low/high ends of the pretraining spectrum; instantiated intermediately by [[chinchilla]]/[[gopher]].
- Unlocks zero-shot and few-shot [[in-context-learning]].
- Followed by post-training alignment via [[supervised-fine-tuning]] (+ DPO/RLHF) to produce usable chat assistants — Llama 3's iterative SFT→RS→DPO.
- Contrasts retrieval vs parametric memory with [[retrieval-augmented-generation]] — high-quality pre-training reduces but does not eliminate need for non-parametric retrieval.

## Open Questions
- Are we hitting the "data wall" for high-quality human text on the public internet? Chinchilla-optimal 1T models need 21T tokens; 10T models need 216T — far beyond curated web text, motivating synthetic data and filtered Common Crawl. Llama 3's 15T already required aggressive line dedup + classifier filtering to sustain quality.
- To what degree can synthetic data (model-generated text) replace or surpass natural human web corpora during pretraining without inducing model collapse? Llama 3 uses synthetic data heavily in *post-training* (405B→8B distillation) but not in pre-training — pre-training synthetic remains open.
- How does multi-epoch repetition (when $D <$ unique tokens) modify the $\hat{L}(N,D)$ frontier? Chinchilla assumed single-epoch infinite-data regime; Llama 3's 8B on 15T (many epochs over sub-corpora) suggests the frontier bends under repetition but was not formally modeled.
- Does masked LM have a future at 100B+ scale, or is causal LM strictly dominant for generative agents? Mixture-of-denoisers (UL2) and prefix LM are underexplored at Llama 3 scale.
- Can annealing protocols (30% new data on 40B window) replace full IsoFLOPs sweeps for data valuation at frontier budgets?
- How to pre-train for 128K+ context efficiently without quadratic blowup — RoPE 500K + doc masking (Llama 3) vs continued pre-training schedules remain heuristic.

## Sources
- [[source-training-compute-optimal-large-language-models]]
- [[source-deep-dive-into-llms-like-chatgpt]]
- Jurafsky & Martin SLP3 Chapter 9: Masked Language Models (syllabus: 'The Transformer')
- [[source-nlp-almost-from-scratch]]
- [[source-language-models-are-few-shot-learners]]
- [[source-bert-pre-training-of-deep-bidirectional-transformers]]
- [[source-llama-3-herd-of-models]]
- [[source-contextual-word-representations-a-contextual-introduction]]
- [[source-history-human-language-understanding]]
- Learning Representations by Back-Propagating Errors
- [[source-learning-long-term-dependencies]]
- [[source-difficulty-training-rnns]]

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
