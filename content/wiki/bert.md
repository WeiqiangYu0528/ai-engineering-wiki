---
type: concept
title: "BERT"
summary: BERT (Bidirectional Encoder Representations from Transformers) is the 2018 Google AI Language model that made deep bidirectional pre-training practical and established the modern pre-train then fine-tune paradigm.
visibility: public
aliases:
  - "Bidirectional Encoder Representations from Transformers"
  - "Masked Language Model"
  - "MLM"
tags:
  - llm-fundamentals
created: 2026-08-25
updated: 2026-08-25
status: draft
sources:
  - "[[source-bert-pre-training-of-deep-bidirectional-transformers]]"
  - "[[source-contextual-word-representations-a-contextual-introduction]]"
related:
  - "[[transformer]]"
  - "[[pretraining]]"
  - "[[tokenization]]"
  - "[[embeddings]]"
  - "[[self-attention]]"
  - "[[word2vec]]"
  - "[[supervised-fine-tuning]]"
  - "[[llama-3]]"
---

# BERT

## Overview
**BERT** (Bidirectional Encoder Representations from Transformers) is the 2018 Google AI Language model that made **deep bidirectional pre-training** practical and established the modern **pre-train then fine-tune** paradigm. Introduced by Devlin et al. in [[source-bert-pre-training-of-deep-bidirectional-transformers]] (NAACL 2019) and contextualized historically by Smith in [[source-contextual-word-representations-a-contextual-introduction]], BERT replaces causal language modeling with a **Masked Language Model (MLM, Cloze)** objective — masking 15% of tokens and predicting them from bidirectional context — plus **Next Sentence Prediction (NSP)**, to pre-train a Transformer **encoder** on BooksCorpus + English Wikipedia. With only one added output layer per downstream task, BERT set state-of-the-art on 11 NLP benchmarks (GLUE, SQuAD, SWAG) and remains the canonical encoder-only architecture.

## Key Ideas
- **Deep bidirectionality via MLM is the core innovation.** Prior models were either unidirectional (GPT: left-to-right causal attention) or shallowly bidirectional (ELMo: independent forward/backward LSTMs concatenated). BERT's Cloze-style masking solves the "see itself" problem — a masked token cannot attend to its own identity — so every Transformer layer fuses left and right context. The 80% `[MASK]` / 10% random / 10% unchanged rule mitigates the pre-train/fine-tune `[MASK]` mismatch while still training the model to produce robust representations. Ablation in [[source-bert-pre-training-of-deep-bidirectional-transformers]] §5.1: replacing MLM with left-to-right LM collapses SQuAD F1 88.5→77.8 and MRPC 86.7→77.5, even when a BiLSTM is added at fine-tuning — deep bidirectionality is not recoverable by shallow post-hoc fusion.
- **NSP teaches sentence-pair understanding.** 50% IsNext / 50% NotNext classification on the `[CLS]` aggregate vector `C` gives the model a cheap sentence-relationship signal from any monolingual corpus (unlike supervised NLI). Removing NSP hurts QNLI -3.5 and MNLI/SQuAD modestly; later work (RoBERTa) shows NSP's value depends on document-level batching, but in 2018 it was essential for QA/NLI gains over GPT.
- **Unified input representation handles all task shapes.** WordPiece 30K vocab + special tokens `[CLS]` (aggregate), `[SEP]` (separator), `[MASK]` (pre-training) + learned segment embeddings (sentence A vs B) + position embeddings → single packed sequence `[CLS] A [SEP] B [SEP]`. This lets sentence-pair tasks (entailment, paraphrase, QA) reuse the same self-attention as cross-attention — no separate cross-attention stack (cf. Parikh et al. 2016). Single-sentence tasks use degenerate `text-∅` pair.
- **Scale matters even for small fine-tuning sets — an early scaling law.** BERT_BASE (L=12, H=768, A=12, 110M) vs BERT_LARGE (L=24, H=1024, A=16, 340M) shows monotonic gains on GLUE even at 3.6K training examples (MRPC 79.8→87.8) with matched hyperparameters — contradicting prior saturation at 200→600 hidden dims. This foreshadows Chinchilla/Llama 3 scaling laws: larger pre-trained capacity transfers to data-scarce tasks when fine-tuned end-to-end.
- **Fine-tune all, but features alone are already strong.** BERT fine-tunes *all* parameters per task (batch 32, 3 epochs, LR 2–5e-5, 1 hour on Cloud TPU) from one shared checkpoint — only `W ∈ ℝ^{K×H}` (classification) or `S, E ∈ ℝ^H` (span) are new. Yet frozen BERT as a feature extractor (concatenating last 4 layers → 2-layer BiLSTM) reaches 96.1 F1 on CoNLL-2003 NER vs 96.3 fine-tuned, showing encoded knowledge is not an artifact of fine-tuning.

## How It Works

### Model Stack
- **Encoder:** Multi-layer bidirectional Transformer per Vaswani et al. (2017) (`FFN=4H`: 3072 BASE, 4096 LARGE), GeLU, dropout 0.1, `max_seq=512`, LayerNorm + residual.
- **Input:** `embedding = TokenEmbedding(WordPiece) + SegmentEmbedding(A/B) + PositionEmbedding(learned)`. `[CLS]`'s final hidden `C` aggregates sequence; each `T_i` represents token `i` contextually.

### Pre-training ( §3.1, 1M steps)
1. **Corpus:** BooksCorpus 800M + Wikipedia 2.5B words, **document-level** (contiguous sentences, not shuffled Billion Word) to preserve long spans. Duplication factor 10 with distinct masking per copy; 90% seq-len 128 then 10% seq-len 512.
2. **Masked LM:** Sample 15% WordPiece tokens per sequence; for each, 80%→`[MASK]`, 10%→random vocab, 10%→unchanged; cross-entropy loss only on masked positions. Mitigates mismatch; Appendix C shows 80/10/10 beats all-mask.
3. **NSP:** Sample sentence pair (A, B); B = actual next sentence 50% / random corpus sentence 50%; binary loss on `C`. Accuracy 97–98% at convergence.
4. **Optimization:** Adam, LR 1e-4 with warmup + linear decay, batch 256×512 (131K tokens), weight decay 0.01. Cost: ~4 days on 16 Cloud TPUs (64 chips) for LARGE.

### Fine-tuning (§3.2, Figure 4)
- **Classification / entailment / paraphrase:** `log softmax(C·W^T)` on `C`.
- **Question answering (SQuAD):** `P(start=i) ∝ exp(S·T_i)`, `P(end=j)` similarly; span score `S·T_i + E·T_j`; training = sum log-likelihood of true span. SQuAD v2.0 adds `[CLS]` null span with threshold `τ`.
- **Sequence tagging (NER):** First sub-token `T_i` → label softmax (optionally + BiLSTM/CRF in feature mode).
- All tasks fine-tune end-to-end from same checkpoint; cheap (30 min SQuAD on Cloud TPU).

## Practical Implications
- **Encoder workhorse for understanding tasks.** BERT (and RoBERTa/DistilBERT/ALBERT derivatives) remains the default for NLU where bidirectional context matters: classification, NER, retrieval/reranking, span QA — and as the bi-encoder backbone for [[retrieval-augmented-generation]] dense retrieval. Decoder-only models (GPT/Llama) dominate generation, but BERT-style encoders still lead on efficiency for non-autoregressive tasks.
- **Pre-training vs prompting regimes.** BERT's fine-tuning paradigm contrasts with GPT-3/Llama in-context learning (ICL). In practice: fine-tune BERT when labeled data exists and latency matters; prompt a large decoder when zero/few-shot flexibility matters. Many production stacks use both (BERT retriever + LLM generator).
- **Tokenization lesson.** WordPiece 30K (vs modern BPE 32K–128K) with `[CLS]/[SEP]/[MASK]` conventions influenced all subsequent tokenizers; case-preserving variant for NER (vs uncased for GLUE) shows cased vs uncased tradeoff still relevant.
- **NSP is optional today.** RoBERTa/ELECTRA show MLM + document-level contiguous batching can subsume NSP; when reimplementing BERT pre-training, prioritize dynamic masking and long contiguous documents over NSP.

## Connections
- Extends the [[transformer]] — uses the **encoder** (bidirectional [[self-attention]]) vs GPT's decoder (causal). Unified packing turns self-attention into cross-attention for pairs.
- Core instance of [[pretraining]] — defines the **masked LM** family alongside causal LM (GPT/Llama) and prefix LM (T5). Its document-level corpus requirement and 1M-step recipe shaped later data pipelines (Llama 3's MinHash+line dedup lineage).
- Consumes [[tokenization]] (WordPiece 30K) and produces [[embeddings]] — `C` (sentence aggregate) and `T_i` (contextual token vectors) that supersede static [[word2vec]] vectors by conditioning on full bidirectional context; directly extends the discrete→static→contextual arc in [[source-contextual-word-representations-a-contextual-introduction]] where ELMo (LSTM LM) is the immediate predecessor and BERT is presented as 45% relative error reduction over ELMo on SQuAD.
- Predecessor to [[supervised-fine-tuning]] patterns — fine-tuning all parameters from one checkpoint prefigures instruction tuning (SFT) for Llama; but BERT's fine-tuning is *task-specific* (separate model per task) whereas modern SFT produces a single instruction-following model.
- Contrasts with [[llama-3]] — dense decoder with GQA/128K vocab vs BERT's encoder; 15.6T vs 3.3B tokens; 128K context vs 512; DPO vs no preference optimization.

## Open Questions
- Can BERT-style MLM be revived for decoder pre-training (e.g., prefix LM, UL2 mixture-of-denoisers) to combine bidirectional understanding with autoregressive generation?
- How to best adapt BERT encoders to 8K+ context without quadratic cost — extend position embeddings vs replace with RoPE/ALiBi?
- Does the 80/10/10 masking recipe have a principled optimum, or is replaced-token detection (ELECTRA) strictly dominant?
- For retrieval, are bi-encoder BERT embeddings still Pareto-optimal vs LLM-based embeddings (e.g., Llama-derived) on cost/quality?

## Sources
- [[source-bert-pre-training-of-deep-bidirectional-transformers]]
- [[source-contextual-word-representations-a-contextual-introduction]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
