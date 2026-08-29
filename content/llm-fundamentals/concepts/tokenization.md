---
type: concept
title: "Tokenization"
summary: Tokenization is the preprocessing step that converts raw human text (strings of characters/bytes) into a sequence of discrete integer IDs (tokens) that a neural network can process.
visibility: public
aliases:
  - Byte Pair Encoding
  - BPE
  - Subword Tokenization
  - SentencePiece
  - wiki/tokenization
tags:
  - llm-fundamentals
  - eval-safety
created: 2026-08-23
updated: 2026-08-26
status: draft
sources:
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "Jurafsky & Martin SLP3 Chapter 2: Words and Tokens"
  - "[[source-promptingguide-research-llm-tokenization]]"
  - "[[source-neural-machine-translation-subword-units]]"
  - "[[source-unsupervised-cross-lingual-representation-learning]]"
  - "[[source-do-all-languages-cost-same-tokenization]]"
  - "[[source-layer-normalization]]"
  - "[[source-cs336-lecture01-overview-tokenization]]"
  - "[[source-cs336-lecture02-pytorch-resource-accounting]]"
related:
  - "[[transformer]]"
  - "[[pretraining]]"
  - "[[prompt-engineering]]"
  - "[[multilinguality]]"
  - "[[inference]]"
  - "[[evaluation]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Tokenization is the preprocessing step that converts raw human text (strings of characters/bytes) into a sequence of discrete integer IDs (tokens) that a neural network can process.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/llm-fundamentals/concepts/multilinguality">Multilinguality</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-deep-dive-into-llms-like-chatgpt">Deep Dive into LLMs like ChatGPT</a></li><li><a href="/llm-fundamentals/sources/source-promptingguide-research-llm-tokenization">LLM Tokenization — Karpathy Lecture Summary</a></li><li><a href="/llm-fundamentals/sources/source-neural-machine-translation-subword-units">Neural Machine Translation of Rare Words with Subword Units</a></li><li><a href="/llm-fundamentals/sources/source-unsupervised-cross-lingual-representation-learning">Unsupervised Cross-lingual Representation Learning at Scale</a></li><li><a href="/llm-fundamentals/sources/source-do-all-languages-cost-same-tokenization">Do All Languages Cost the Same? Tokenization in the Era of Commercial Language Models</a></li><li><a href="/llm-fundamentals/sources/source-layer-normalization">Layer Normalization</a></li><li><a href="/llm-fundamentals/sources/source-cs336-lecture01-overview-tokenization">CS336 Lecture 01 — Overview, Tokenization</a></li><li><a href="/llm-fundamentals/sources/source-cs336-lecture02-pytorch-resource-accounting">CS336 Lecture 02 — PyTorch (einops), Resource Accounting (FLOPs, Memory, Arithmetic Intensity)</a></li></ul></nav>
</aside>

## Overview
**Tokenization** is the preprocessing step that converts raw human text (strings of characters/bytes) into a sequence of discrete integer IDs (tokens) that a neural network can process. Modern Large Language Models predominantly use **Byte Pair Encoding (BPE)** and its successor **SentencePiece Unigram** to construct subword vocabularies typically ranging between 32,000 and 250,000 tokens. The choice of tokenizer determines vocabulary size $V$, sequence length $N$, embedding cost, and critically — cross-lingual fairness, as shown in [[source-do-all-languages-cost-same-tokenization]] where the same information can cost **up to 5× more tokens** in non-Latin scripts.

## Key Ideas
- **Subwords, not Words or Characters:** Character-level processing results in sequences that are too long (expensive $O(N^2)$ [[self-attention]]), while word-level processing cannot handle out-of-vocabulary (OOV) words or morphologically rich languages (German compounding, agglutination). Subwords strike an optimal balance between vocabulary size and sequence length, and enable open-vocabulary translation by compositionality, as first demonstrated in [[source-neural-machine-translation-subword-units]].
- **Byte Pair Encoding (BPE) — Sennrich et al. 2016:** An iterative compression algorithm in [[source-neural-machine-translation-subword-units]]. Starting with characters + end-of-word marker `</w>`, BPE counts the most frequent adjacent pair (`A`,`B`) weighted by word frequency (ignoring cross-word boundaries) and merges them into new symbol `AB` until reaching `num_merges` (sole hyperparameter). Final $V = V_{\text{char}} + \text{num\_merges}$. At inference, split unknown words into characters and apply learned merges — no UNKs.
  - *Textbook formulation (Jurafsky & Martin Ch 2):* presents the Bostrom & Durrett (2020) training algorithm (Fig 2.6) with greedy ordered merges at encoding time; **byte-level BPE** operates on UTF-8 bytes (256 base symbols) so any string round-trips through the vocabulary with zero UNKs and an illegal-sequence filter; GPT-4o ships ≈200K merges (Tiktokenizer demo). New research direction: **SuperBPE / BoundlessBPE** (Liu et al. 2025; Schmidt et al. 2025) add a second merge stage *across whitespace*, producing multi-word "superword" tokens (Fig 2.7).
  - *Pre-tokenization is policy, not plumbing:* the GPT-2 regex (Fig 2.15, `\p{L}`/`\p{N}` classes) hard-codes which boundaries may never be merged across (contractions, numbers, punctuation, whitespace); tokenizer bias against non-Latin scripts is therefore structural, inherited from this regex plus UTF-8 byte costs.
  - *Joint vs independent BPE:* Learning merges on union of source+target vocabularies (joint BPE, 89.5k merges) improves segmentation consistency for names/cognates across languages versus independent (59.5k), crucial for transliteration EN→RU where independent BPE learned `p|rak|ri|ti` → `пра|крит|и` inconsistency causing `rak→pra` errors.
  - *Alternatives:* Character n-grams (+ shortlist) viable but less compressed (550M char tokens vs 112M BPE vs 100M words on German training corpus; 63k vs 1.75M types). Frequency-based compound splitting / Morfessor / hyphenation do not solve OOV (643/237/230 UNKs on newstest2013).
- **SentencePiece Unigram — Kudo 2018 / XLM-R:** Used in [[source-unsupervised-cross-lingual-representation-learning]] for 100 languages. Trains a unigram language model directly on raw text (no language-specific pre-tokenization), with large shared vocabulary **250K** and sampling $\alpha=0.3$. Simplifies multilingual pipeline, handles code-switching by removing language embeddings, and with no performance loss vs BPE+tokenization (Figure 7). Yet still exhibits script variance, though less than OpenAI tokenizers.
- **Root Cause of LLM Quirks:** Many apparent reasoning failures are artifacts of tokenization:
  - *Spelling / Letter Counting:* The word "strawberry" is tokenized as chunks (e.g. `str` + `awberry`). The model never directly "sees" individual letters unless forced to spell character by character.
  - *Arithmetic:* Numbers like `12847` may be split unpredictably (e.g., `12` + `847`), making column arithmetic difficult without whitespace padding.
  - *Language Inequity — the 5× cost multiplier:* In [[source-do-all-languages-cost-same-tokenization]] (Ahia et al. 2023, 22 typologically diverse languages), English compresses efficiently (~4 chars/token), whereas non-Latin scripts often require multiple tokens per word. For parallel FLORES-200 sentences, Telugu, Amharic, Bengali, Tamil require ~5× tokens vs English on `cl100k_base` (GPT-4) and `p50k_base` (GPT-3). Even mid-resource Indic non-Latin close to **5×** → proportional API billing inflation ($0.002/1K tokens), XLSUM prompting+generation **4× higher** for Telugu/Amharic, and reduced effective context (4,096 token window fits 0 shots for Telugu majority vs multiple for English, harming in-context learning utility).
- **Byte-level nuance:** Fragmentation not solely data imbalance — rooted in linguistic properties and UTF-8 bytes per character (Telugu 3 bytes/char vs English 1) and agglutinative morphology; byte-fallback in BPE amplifies.
- **Words are not obvious units (Jurafsky & Martin Ch 2):** orthographic word vs type vs token ($|V|$ vocabulary vs $N$ token count), disfluencies, clitics (*I've*, *'s*), and morphological typology (isolating Vietnamese → polysynthetic Koryak; agglutinative vs fusional; Greenberg 1960 morphemes-per-word index) explain *why* subwords approximate morphemes better than words or characters across languages. Rule-based desiderata persist in production: $45.55, m.p.h., URLs, hashtags, Penn Treebank conventions — the classical layer beneath modern BPE.
- **Corpora encode values:** every tokenizer/pretokenizer inherits its corpus's variation dimensions — language variety (AAE), code-switching, genre, demographics, time — formalized via datasheets (Gebru et al. 2020) / data statements (Bender et al. 2021); documentation of tokenizer fragmentation rates per language is an ethical obligation for API providers.

## How It Works
1. **Raw Byte/Char Sequence:** Text is encoded into raw UTF-8 bytes/characters plus end-of-word marker.
2. **Regex / Raw Splitting:** Pre-tokenization regex (e.g., in GPT-4's `tiktoken` / `cl100k_base`) or raw SentencePiece on unsegmented text splits text into chunks (words, punctuation, whitespace) to prevent merges across semantic boundaries (XLM-R removes language-specific regex and applies SentencePiece directly on raw text for simplicity).
3. **Merge Table Lookup (BPE):** Encoder iteratively applies learned merges (`get_stats` + `merge_vocab` Algorithm 1) ranked by frequency to collapse byte sequences into integer token IDs. Unigram LM alternative samples segmentation probabilistically during training (subword regularization).
4. **Language Sampling & Vocab Construction (Multilingual):** For 100 languages, sample batches proportional to $(\text{sentences})^\alpha$ with $\alpha=0.3$ to balance high-resource (EN,FR) vs low-resource (SW,UR); vocab capacity trade-off — at fixed total parameters, increasing vocab 32K→256K yields **+2.8% XNLI avg** (Figure 6), 128K→512K **+3%** → more parameters to embeddings outweighs smaller [[transformer]] for 100 languages.
5. **Embedding Layer:** Token IDs index directly into learned embedding matrix $W_e \in \mathbb{R}^{V \times d_{\text{model}}}$ (e.g., 250K × 1024 for XLM-R Large, ~25% of parameters).

## Practical Implications
- **Cost & Latency (Fairness):** API costs and prompt latency directly scale with token counts. In commercial LM-as-a-Service (OpenAI, etc.), inequitable tokenization means speakers of Telugu, Amharic, Bengali etc. pay **5×** for same information and obtain poorer results (Ahia Figure 2, 16, 4). This is regressive: those languages' speakers tend to have lower GDP/HDI, least able to afford premium. Recommendations: byte/character-normalized pricing, parity-aware BPE, script-balanced vocab, transparency per-language fragmentation rates.
- **Prompt Formatting & Numerical Reasoning:** Ensuring spaces, newlines, and digits are tokenized cleanly prevents subtle degradation; number splitting unpredictability motivates whitespace-padded digit tokenization for arithmetic.
- **Context Utilization & Few-shot:** Tokenizer compression ratio dictates how much actual source text fits within context window. Ahia et al. show high-fragmentation languages often cannot fit even one demonstration for few-shot ICL, negating a key LLM capability — utility correlates negatively with fragmentation.
- **Multilingual Model Design:** Choice between 32K (efficient, fragmenting) vs 250K (costly softmax but equitable) is central trade-off illuminated by [[source-unsupervised-cross-lingual-representation-learning]]; allocating vocab capacity critical to alleviating *curse of multilinguality* (see [[multilinguality]]).
- **Training Stability Link:** Longer sequences due to fragmentation increase sequence lengths where [[transformer]] stability matters — [[source-layer-normalization]] shows LN's benefit for long sequences (700 length handwriting) and small batches, relevant to multilingual batches.

## Connections
- Foundational input layer to the [[transformer]] architecture (see [[self-attention]] $O(N^2)$ cost and [[positional-encoding]]).
- Determines sequence length and vocabulary size used in [[pretraining]] (embedding params, compute $C \approx 6ND$) and scaling laws in [[scaling-laws]].
- Affects reasoning and spelling accuracy in [[thinking-models]] and [[prompt-engineering]] formatting choices.
- Karpathy's 11-item diagnostic (spelling, reversal, non-English, arithmetic, SolidGoldMagikarp, YAML>JSON, trailing whitespace) framed in [[source-promptingguide-research-llm-tokenization]] maps each to tokenization and links to [[inference]] cost.
- **Multilingual:** Central to [[multilinguality]] — curse of multilinguality, CC-100 dataset scale, and cross-lingual transfer (XNLI 80.9 vs 66.3 mBERT) all depend on shared subword vocabulary design from [[source-neural-machine-translation-subword-units]] to [[source-unsupervised-cross-lingual-representation-learning]] to [[source-do-all-languages-cost-same-tokenization]] critique.
- **Evaluation:** Directly impacts [[evaluation]] cost metrics and benchmark fairness (Ahia et al. 22 languages, 5 tasks XLSUM/XFACT etc.), plus [[llm-bias]] and digital divide.
- **Normalization:** Longer fragmented sequences amplify need for per-example normalization in [[transformer]] blocks (see LayerNorm invariance to per-example rescaling in [[source-layer-normalization]]).
- **CS336 systems perspective:** [[source-cs336-lecture01-overview-tokenization]] frames tokenization as an *efficiency* choice — 1000 bytes → ~250 tokens (GPT-5 tiktoken 200K vocab) directly cuts quadratic attention cost, and variable-length chunks allocate more capacity to interesting regions. Lecture 01's live BPE demo (`train_bpe("the cat in the hat",3)` → `BPETokenizer.encode`) plus byte/char/word failure analysis grounds the textbook BPE theory in executable code (Assignment 1 pre-tokenization regex, special-token handling). Frontier note from the lecture — ByT5/MegaByte/BLT/H-Net as byte-level successors not yet at frontier — connects to [[source-cs336-lecture02-pytorch-resource-accounting]] where token count sets $C=6ND$ and activation memory $2BDL$.

## Open Questions
- Can future architectures successfully transition to pure byte-level or patch-based modeling without tokenizers (e.g., Byte Latent Transformers) to achieve script parity?
- How to eliminate vocabulary bias against non-English languages without exploding vocabulary memory/softmax overhead (512K still insufficient for parity)? Parity-aware training objectives?
- Should commercial APIs decouple pricing from tokenization (per-character/byte) and how to define information-equivalent pricing?
- Does subword regularization (Unigram sampling) improve robustness to oversplitting for rare compounds/transliteration?

## Sources
- [[source-deep-dive-into-llms-like-chatgpt]]
- Jurafsky & Martin SLP3 Chapter 2: Words and Tokens
- [[source-promptingguide-research-llm-tokenization]]
- [[source-neural-machine-translation-subword-units]]
- [[source-unsupervised-cross-lingual-representation-learning]]
- [[source-do-all-languages-cost-same-tokenization]]
- [[source-layer-normalization]]
- [[source-cs336-lecture01-overview-tokenization]]
- [[source-cs336-lecture02-pytorch-resource-accounting]]

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/llm-fundamentals/concepts/embeddings">Embeddings</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
