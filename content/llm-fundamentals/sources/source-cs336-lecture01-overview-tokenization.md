---
type: source-summary
title: CS336 Lecture 01 — Overview, Tokenization
summary: Lecture 01 (lecture01.py, 762 lines, Percy Liang) frames CS336 Spring 2026 Language Modeling from Scratch around one question — how to train the best model given fixed resources (data + hardware).
status: draft
visibility: public
author: "Percy Liang"
source-type: article
url: "https://cs336.stanford.edu/lectures/?trace=lecture_01"
date-published: 2026-03-30
date-ingested: 2026-08-26
tags:
  - llm-fundamentals
  - mlops
key-concepts:
  - "[[tokenization]]"
  - "[[transformer]]"
  - "[[pretraining]]"
  - "[[scaling-laws]]"
  - "[[inference]]"
key-entities:
  - "[[stanford-university]]"
aliases:
  - wiki/source-cs336-lecture01-overview-tokenization
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Lecture 01 (lecture01.py, 762 lines, Percy Liang) frames CS336 Spring 2026 Language Modeling from Scratch around one question — how to train the best model given fixed resources (data + hardware).</p>
<p class="kb-provenance">Percy Liang, 2026-03-30. <a href="https://cs336.stanford.edu/lectures/?trace=lecture_01">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary
Lecture 01 (`lecture_01.py`, 762 lines, Percy Liang) frames CS336 Spring 2026 *Language Modeling from Scratch* around one question — **how to train the best model given fixed resources (data + hardware)**. It introduces the five course pillars (basics → systems → [[scaling-laws]] → data → alignment) and the unifying lens **expressivity / stability / efficiency**. The second half is a hands-on [[tokenization]] unit: from Unicode string to BPE, with live `tiktoken` (GPT-5, 200k vocab) demos, compression-ratio trade-offs, and the trajectory toward byte-level models (ByT5 / MegaByte / BLT / H-Net). Raw preserved at [https://cs336.stanford.edu/lectures/?trace=lecture_01](https://cs336.stanford.edu/lectures/?trace=lecture_01) and trace viewer `https://cs336.stanford.edu/lectures/?trace=lecture_01`.

## Key Takeaways
1. **Course philosophy — efficiency as first-class objective.** Tomorrow's data-constrained regime flips today's compute-constrained choices; tokenization, architecture, data filtering and scaling recipes all become efficiency trade-offs (e.g., raw bytes is elegant but compute-inefficient with quadratic attention).
2. **Tokenizer formalism and why it matters.** `Tokenizer.encode: str → list[int]` / `decode` must round-trip; GPT-5 byte-level BPE compresses ~1000 bytes → ~250 tokens, vocab size controls sparsity vs sequence length (attention is $O(N^2)$). Leading-space bundling (`" world"`), start-vs-middle word splits, and digit chunking are observable artifacts.
3. **Taxonomy of suboptimal baselines.** Character (Unicode codepoint), byte (UTF-8 0–255), and word tokenizers each fail: too long / no OOV handling but long seq, or vocabulary blow-up + UNKs. BPE (Gage 1994 → Sennrich 2016 → GPT-2) wins because it is data-driven, merging the most frequent adjacent byte pair iteratively.
4. **Modern blueprint previewed.** Transformer refinements that Assignment 1 implements: pre-norm, [[positional-encoding]] RoPE, SwiGLU FFN, no bias terms, plus attention variants (GQA/MLA), SSM/linear hybrids (Mamba), MoE MLPs, and shape hyperparameters.
5. **Trajectory to tokenizer-free.** ByT5 (2021), MegaByte (2023), BLT (2024), T-Free, H-Net (2025) cited as frontier byte-level attempts — not yet frontier-scale, but the "dream" that satisfies variable-length, adaptive-compute chunks.

## Detailed Notes

### Course framing (why this course exists)
- Researchers increasingly disconnected from underlying tech; course restores "from scratch" intuition.
- Current LM landscape: API models vs open weights (Llama/Mistral/Qwen), rapid 2024–2025 dense releases.
- Pipeline framing: `what_is_this_program()` → five units map to Assignments 1–5.

### Syllabus efficiency thesis
- **Resources = data + hardware** (compute, memory, bandwidth). All design decisions answer *best model for fixed resources*.
- Systems (kernels/parallelism/inference), tokenization (bytes vs BPE), architecture (KV sharing, sliding window), data filtering (don't waste compute on bad tokens), scaling laws (tune hyperparameters on small FLOPs) all instantiate efficiency.
- Preview: today compute-constrained → tomorrow data-constrained, so today's choices may invert.

### Basics unit (Assignment 1 teaser)
- Tokenization: atoms of the model.
- Architecture: Transformer + activations (ReLU→SwiGLU), positions (sinusoidal→RoPE), norms (LayerNorm→RMSNorm→QK-Norm), attention sparsity, MoE — "shape" as hyperparameter.
- Training: loss (multi-token prediction), optimizer (AdamW/SOAP/Muon), init (Xavier/muP), schedule (cosine/WSD), regularization, batch size, MoE load-balancing.
- Assignment 1 leaderboards: TinyStories / OpenWebText, minimize perplexity in 45 min on a B200.

### Tokenization deep dive
- **Live demo:** `get_gpt5_tokenizer()` (tiktoken), `string="Hello, 🌍! 你好!"` round-trips; `compression_ratio = bytes/tokens` inspected; `vocab ≈200K` inspected via `var/gpt5_tokenizer_vocab.txt`.
- **Observations via tiktokenizer.vercel.app:** leading space in token, `hello` vs ` hello` differ, numbers split every few digits.
- **CharacterTokenizer:** `encode = list(map(ord,string))` — simple but long, ASCII-limited intuition.
- **ByteTokenizer:** `string.encode("utf-8")` → 0–255; any string round-trips, no UNK, but sequence 4× longer than BPE.
- **WordTokenizer:** word splits fail on OOV, compound, morphologically rich languages.
- **BPE — training:** `train_bpe("the cat in the hat", num_merges=3)` interactive demo; start from bytes, iteratively `most_frequent_pair → merge`, vocab = 256 + merges.
- **BPE — inference:** `BPETokenizer(params).encode("the quick brown fox")` applies merges greedily; assignment extensions: avoid looping over all merges, preserve `<|endoftext|>`, apply GPT-2 regex pre-tokenization, optimize speed.
- Defined desirable property: chunks should be variable-length and allocate more capacity to "interesting" regions (text, video, DNA).

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 2 passages in this section could not be located in the stored source ([https://cs336.stanford.edu/lectures/?trace=lecture_01](https://cs336.stanford.edu/lectures/?trace=lecture_01)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Whatever solution needs to satisfy: (1) chunks should be abstractions of the sequence, (2) chunks should be variable — allocate more model capacity to interesting chunks." — lecture_01.py `tokenization()` summary

> "The dream: tokenizer-free model architectures, which operate directly on bytes. These are promising, but have not yet been scaled up to the frontier." — lecture_01.py `basics()`

## Concepts Introduced or Referenced
- [[tokenization]] — BPE as practiced standard; character/byte/word baselines; compression vs vocab trade-off; pre-tokenization regex; assignment BPE implementation.
- [[transformer]] — Original (2017) vs modern pre-norm/RoPE/SwiGLU/no-bias blueprint; assignment architecture overview.
- [[pretraining]] — Full supervision next-token training setup that motivates tokenization + architecture choices.
- [[scaling-laws]] — Compute-optimal $C=6ND$, $D\approx20N$ preview with Marin 1e23 FLOPs live example.
- [[inference]] — Prefill (compute-bound) vs decode (memory-bound) preview under Systems.
- [[positional-encoding]] — Sinusoidal → RoPE evolution noted.
- [[self-attention]] — Quadratic $O(N^2)$ cost that makes tokenizer compression matter.

## Critical Assessment
- **Strength:** Executable lecture (`edtrace` trace viewer) makes tokenization claims inspectable (`@inspect` compression ratio, vocab, round-trip assert) rather than slide-ware; cleanly separates *efficiency lens* from traditional NLP *linguistic* lens.
- **Complement to wiki:** Existing [[tokenization]] page is strong on multilingual fairness (Ahia 5× cost) and SentencePiece Unigram, but thin on CS336's *systems* motivations (quadratic attention cost, byte-level frontier) and on live BPE walkthrough — this lecture fills that gap.
- **Gap:** Lecture 01 BPE demo omits regex pre-tokenization details and special-token handling that cause real-world bugs; deferred to Assignment 1.
- **Forward link:** Sets up Lecture 02's resource accounting ($6ND$ FLOPs derives from Transformer matmuls) and Lecture 03's architecture variants (why RoPE/SwiGLU were chosen).

---

**Source:** CS336 Lecture 01 — Overview, Tokenization by Percy Liang — <https://cs336.stanford.edu/lectures/?trace=lecture_01>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
