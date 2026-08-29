---
type: source-summary
title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding"
summary: The seminal October 2018 (NAACL 2019) paper from Google Research that introduced BERT — Bidirectional Encoder Representations from Transformers.
status: draft
visibility: public
author: "Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova (Google AI Language)"
source-type: paper
url: "https://arxiv.org/abs/1810.04805"
date-published: 2019-05-24
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
key-concepts:
  - "[[bert]]"
  - "[[pretraining]]"
  - "[[transformer]]"
  - "[[tokenization]]"
  - "[[embeddings]]"
key-entities:
  - "[[google-research]]"
aliases:
  - wiki/source-bert-pre-training-of-deep-bidirectional-transformers
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The seminal October 2018 (NAACL 2019) paper from Google Research that introduced BERT — Bidirectional Encoder Representations from Transformers.</p>
<p class="kb-provenance">Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova (Google AI Language), 2019-05-24. <a href="https://arxiv.org/abs/1810.04805">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 2 of 32 figures on this page were not found in [https://arxiv.org/abs/1810.04805](https://arxiv.org/abs/1810.04805): `10.7`, `96.3`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The seminal October 2018 (NAACL 2019) paper from [[google-research]] that introduced **BERT** — **Bidirectional Encoder Representations from Transformers**. Unlike prior unidirectional LMs (OpenAI GPT left-to-right) or shallowly concatenated bi-LMs (ELMo), BERT pre-trains a deep bidirectional [[transformer]] encoder via a **Masked Language Model (MLM, Cloze)** objective plus **Next Sentence Prediction (NSP)** on BooksCorpus (800M words) + English Wikipedia (2.5B words). Fine-tuning adds only one task-specific output layer and updates all parameters, achieving state-of-the-art on 11 NLP tasks (GLUE 80.5, +7.7; SQuAD v1.1 F1 93.2, +1.5; SQuAD v2.0 F1 83.1, +5.1) and establishing the **pre-train then fine-tune** paradigm for bidirectional encoders.

## Key Takeaways
1. **Masked LM enables deep bidirectionality.** Masking 15% of WordPiece tokens at random and predicting them (80% `[MASK]`, 10% random token, 10% unchanged) solves the "see itself" problem of bidirectional LM training — every layer fuses left and right context, unlike GPT's causal mask or ELMo's shallow concatenation. Ablation: LTR & No NSP collapses SQuAD F1 from 88.5 to 77.8 (-10.7) and MRPC 86.7→77.5, even with a BiLSTM added.
2. **Next Sentence Prediction (NSP) for sentence-pair understanding.** 50% IsNext / 50% NotNext on `[CLS]` vector C. Removing NSP hurts QNLI 88.4→84.9 (-3.5), MNLI-m 84.4→83.9, and SQuAD 88.5→87.9 — later shown partially replaceable by better document-level sampling (RoBERTa), but critical for 2019 QA/NLI.
3. **Unified input representation & two model sizes.** WordPiece 30K vocab + `[CLS]`/`[SEP]` + learned segment embeddings (A/B) + position embeddings → single packed sequence handles single-sentence and sentence-pair tasks. BERT_BASE (L=12, H=768, A=12, 110M params — GPT-size) and BERT_LARGE (L=24, H=1024, A=16, 340M params) demonstrate that **larger pre-trained model → better fine-tuning even on tiny datasets** (MRPC 3.6K examples): scaling from 110M to 340M gains +1–4 points per GLUE task, an early scaling law for fine-tuning.
4. **Minimal task-specific architecture — fine-tune all parameters.** Sentence-level tasks use `C` (`[CLS]` final hidden) + `W ∈ ℝ^{K×H}` softmax; token-level tasks (SQuAD, NER) use `T_i` per-token vectors + start/end vectors `S, E`. All 11 tasks fine-tune in ≤1 hour on a single Cloud TPU from the *same* pre-trained checkpoint. Feature-based ablation (frozen BERT + 2-layer BiLSTM) still strong: concatenating last 4 layers reaches 96.1 F1 on NER vs 96.3 fine-tuned, showing BERT's representations are broadly useful.
5. **Training recipe & data discipline.** 1M steps, batch 256 sequences × 512 tokens (128K tok/batch), Adam 1e-4 with warmup + linear decay, dropout 0.1, GeLU. Critical: **document-level corpus** (contiguous sentences) not shuffled sentence-level (Billion Word) to preserve long-range dependencies; duplication factor 10 with masked-LM variation and 90/10 split of seq-len 128 vs 512. Pre-training cost ~4 days on 16 Cloud TPUs (64 TPU chips) for LARGE.

## Detailed Notes

### Architecture — Bidirectional Transformer Encoder ( §3, Figure 2)
- Multi-layer Transformer encoder per Vaswani et al. (2017) via `tensor2tensor`; `FFN = 4H` (3072 for BASE, 4096 for LARGE).
- Input embedding = token + segment + position (learned, max 512). Special tokens: `[CLS]` (aggregate), `[SEP]` (separator), `[MASK]` (MLM), `[UNK]`.
- Bidirectional self-attention (encoder) vs GPT's causal decoder — the architectural distinction the paper hinges on.

### Pre-training Tasks (§3.1, Figure 3 pick)
- **MLM (§3.1 Task #1):** 15% masking follows Taylor (1953) Cloze; loss only on masked positions. Mitigates pre-train/fine-tune `[MASK]` mismatch via 80/10/10 rule; Appendix C.2 shows masking 80% + keeping 10% random is best (MTRM > All Mask).
- **NSP (§3.1 Task #2):** `C` used for binary IsNext; 97–98% accuracy at convergence despite triviality. Closely related to Jernite et al. (2017) / Logeswaran & Lee (2018) sentence objectives but transfers *all* parameters, not just sentence embeddings.

### Fine-tuning I/O (§3.2, Figure 4 pick)
- Self-attention over concatenated pair `[CLS] A [SEP] B [SEP]` unifies encoding and cross-attention — no separate cross-attention as in Parikh et al. (2016) / Seo et al. (2017).
- Degenerate `text-∅` pair for single-sentence tasks; token-level classifier on first sub-token for NER (case-preserving WordPiece + maximal document context).

### Experiments (§4)
- **GLUE (9 tasks, Table 1):** BERT_LARGE 82.1 avg (80.5 official leaderboard, excl. WNLI) vs GPT 75.1, Pre-OpenAI SOTA 74.0, BiLSTM+ELMo+Attn 71.0. Gains concentrated on low-resource CoLA 60.5 vs 35.0, RTE 70.1 vs 56.0.
  - Fine-tune: batch 32, 3 epochs, LR ∈ {5e-5, 4e-5, 3e-5, 2e-5}, random restarts on small datasets (LARGE unstable).
- **SQuAD v1.1 (Table 2):** Single LARGE F1 90.9 (EM 84.1) vs BiDAF+ELMo 85.8; Ensemble 91.8, +TriviaQA ensemble 93.2 SOTA. Training: LR 5e-5, batch 32, 3 epochs; score `S·T_i + E·T_j`.
- **SQuAD v2.0 (Table 3):** No-answer as `[CLS]` span; threshold `τ` on `s_null = S·C+E·C` vs best non-null `max S·T_i+E·T_j`; F1 83.1 (+5.1) with no TriviaQA.
- **SWAG (Table 4):** Vict-α style 4-way continuation scoring via `C`; LARGE 86.3 test vs GPT 78.0, ESIM+ELMo 59.2; BASE 81.6. Human 85.0–88.0 — BERT surpasses expert single.

### Ablation Studies (§5, Tables 5–6; Appendices C–D)
- **§5.1 Effect of Pre-training Tasks (Table 5):** No NSP -0.5 MNLI-m, -3.5 QNLI, -0.6 SQuAD; LTR & No NSP -2.3 MNLI, -11.0 MRPC vs BASE — deep bidirectionality dominates.
- **§5.2 Effect of Model Size (Table 6, 5 restarts avg):** (3/768/12) ppl 5.84 → (24/1024/16) ppl 3.23; MNLI 77.9→86.6, MRPC 79.8→87.8, SST-2 88.4→93.7 — monotonic gains even at 3.6K training examples, contradicting prior 200→600 saturation. Largest prior Transformer encoder was 100M (Vaswani L=6) vs BERT_LARGE 340M.
- **§5.3 Feature-based (Table 7, CoNLL-2003 NER):** Fine-tune 94.9/92.4 vs feature LSTM (Embed 91.0, Second-to-Last 95.6 dev; Best Concat Last 4 96.1) — within 0.3 F1, proving representation quality independent of fine-tuning.
- **Appendix A Details:** Illustration of masking procedure (duplication factor 10), NSP sampling, WordPiece 30K; comparison BERT vs ELMo (LSTM, independent LTR/RTL, shallow concat, frozen features) vs GPT (Transformer decoder, LTR, fine-tuning with task-specific input transforms).
- **Appendix C Additional Ablations:** Training steps 1M vs 500K; masking variants; NSP alternatives.

### Relation to Prior & Follow-up
- Prior: Collobert & Weston (2008) word embeddings; Dai & Le (2015), Howard & Ruder (2018), Radford et al. (2018/GPT) fine-tuning; Peters et al. (2017/2018 ELMo) feature-based + bi-LM concatenation; Melamud et al. (2016) Cloze with LSTMs.
- This paper's MLM is Cloze (Taylor 1953) + denoising autoencoder (Vincent 2008) variant (predict only masked, not reconstruct all).
- Follow-up corrections: RoBERTa (Liu et al. 2019) removes NSP, dynamic masking, larger batch, more data — shows NSP less valuable with proper document batching; SpanBERT, ALBERT, ELECTRA refine MLM.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 5 passages in this section could not be located in the stored source ([https://arxiv.org/abs/1810.04805](https://arxiv.org/abs/1810.04805)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. ... BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers." — Abstract

> "In order to train a deep bidirectional representation, we simply mask some percentage of the input tokens at random, and then predict those masked tokens. We refer to this procedure as a 'masked LM' (MLM), although it is often referred to as a Cloze task." — §3.1

> "We do not always replace 'masked' words with the actual [MASK] token. ... 80% [MASK], 10% random, 10% unchanged ... To mitigate [pre-train/fine-tune mismatch]." — §3.1

> "The advantage of [fine-tuning approaches] is that few parameters need to be learned from scratch." — §2.2

> "Increasing the model size ... leads to large improvements on very small scale tasks, provided that the model has been sufficiently pre-trained." — §5.2

## Concepts Introduced or Referenced
- [[bert]] — The model itself; bidirectional encoder, MLM+NSP pre-training, 110M/340M configs, WordPiece 30K.
- [[transformer]] — Bidirectional encoder variant vs GPT decoder; self-attention over concatenated pair as cross-attention.
- [[pretraining]] — Masked LM as self-supervised pre-training objective; document-level corpus requirement; 1M steps regime.
- [[tokenization]] — WordPiece 30K, `[CLS]`/`[SEP]`/`[MASK]` special tokens, segment + position embeddings.
- [[embeddings]] — Contextual token representations `C, T_i` vs static Word2Vec; per-token vs sentence aggregate.
- [[in-context-learning]] / [[supervised-fine-tuning]] — Fine-tuning paradigm (pre-train then fine-tune) vs few-shot ICL (GPT-3) and feature-based ELMo.
- [[self-attention]] — Bidirectional vs causal attention, the architectural lever.

## Critical Assessment
**Strengths:** Landmark elegance — MLM is a one-line change enabling deep bidirectionality with minimal new machinery; unified fine-tuning architecture handles 11 disparate tasks with one pre-trained checkpoint; rigorous ablations isolating bidirectionality vs NSP vs size; strong reproducibility (code + BERT_BASE/LARGE releases); immediate practical impact (HuggingFace `transformers` default).

**Limitations / Gaps:** NSP later shown largely dispensable (RoBERTa) — conflates sentence-order signal with topic signal; static `[MASK]` mismatch not fully resolved (ELECTRA's replaced-token detection is cleaner); performance claims partially time-bound (GLUE SOTA quickly surpassed by larger models, but paradigm remains); evaluation is fine-tuning-only (no zero/few-shot); doc-level corpus filtering under-specified vs modern dedup pipelines (Llama 3).

**Contradictions / Notes vs. existing wiki:** No direct contradiction — complements [[source-attention-is-all-you-need]] (encoder variant) and [[source-language-models-are-few-shot-learners]] (fine-tuning vs ICL paradigm). Existing [[pretraining]] page frames pre-training as autoregressive next-token prediction only; this source expands the taxonomy to **masked LM (BERT)** vs **causal LM (GPT/Llama)** vs **prefix LM (T5)**. The [[tokenization]] page emphasizes BPE; BERT's WordPiece 30K is a closely related subword variant to cross-reference.

## Sources
- Paper PDF: https://arxiv.org/pdf/1810.04805.pdf
- Saved raw: [https://arxiv.org/abs/1810.04805](https://arxiv.org/abs/1810.04805)
- Code: https://github.com/google-research/bert
- Citations: Devlin et al., NAACL-HLT 2019

---

**Source:** BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding by Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova (Google AI Language) — <https://arxiv.org/abs/1810.04805>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
