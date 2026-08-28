---
type: source-summary
title: "Music Transformer: Generating Music with Long-Term Structure"
summary: The September 2018 Google Magenta paper (Huang et al., arXiv 1809.04281, ICLR 2019) demonstrates the first successful Transformer for minute-long symbolic music generation with coherent long-term structure.
status: verified
visibility: public
author: "Cheng-Zhi Anna Huang, Ashish Vaswani, Jakob Uszkoreit, Noam Shazeer, Ian Simon, Curtis Hawthorne, Andrew M. Dai, Matthew D. Hoffman, Monica Dinculescu, Douglas Eck (Google Magenta / Brain)"
source-type: paper
url: "https://arxiv.org/abs/1809.04281"
date-published: 2018-09-12
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
  - multimodal
  - inference
key-concepts:
  - "[[transformer]]"
  - "[[self-attention]]"
  - "[[positional-encoding]]"
  - "[[pretraining]]"
key-entities:
  - "[[google-research]]"
  - "[[deepmind]]"
verified-by: agent
verified-on: 2026-08-27
---

# Music Transformer: Generating Music with Long-Term Structure

## Summary
The **September 2018 Google Magenta paper (Huang et al., arXiv 1809.04281, ICLR 2019)** demonstrates the first successful Transformer for **minute-long symbolic music generation with coherent long-term structure**. Building on **Shaw et al. 2018 relative position representations**, the authors propose a **memory-efficient relative attention** that cuts intermediate memory from **O(L²D)→O(LD)** via a **"skewing" trick** (pad→reshape→slice to align `Q E_r^T` to `S_rel`), enabling training on **L=2048 event sequences (60s, 10ms resolution)** vs prior O(L²D) limit 650 on 16GB. On **J.S. Bach Chorales (16th-note grid, 1024-length)** and **Piano-e-Competition (MIDI-like events, 2048)** datasets, relative Transformers achieve **SOTA NLL (1.835 Piano-e-Comp vs 1.861 baseline, 1.969 LSTM)**, generate **primed continuations that elaborate motifs with repetition/variation and phrase structure**, and **harmonize melody→performance seq2seq**, with listening tests showing **relative > baseline Transformer significantly** in musicality.

## Key Takeaways
1. **Music needs relative timing & pitch more than absolute**: Absolute sinusoids (Vaswani) fail to capture musical **periodicity, transposition invariance, and ABA reuse**. Shaw's relative embeddings `E_r` (shape H×L×D_h, distance −L+1..0) add `S_rel` to `QK^T/√D_h` (Eq 3) — each head learns distance bias. Extending to **pitch interval and inter-onset time** (JSB) further improves NLL 0.357→0.335 (Table 2) — shows relational inductive bias encodes musical grammar (scales, arpeggios recur at regular distances).
2. **Memory bottleneck solved**: Shaw's formulation materializes **R (L×L×D_h)** containing E_r gathered per pair → `S_rel = Q R^T` costs **O(L²D)** (e.g., L2048, D512, H8 → 8.5GB). **Efficient algorithm**: Observe terms needed already in `Q E_r^T` (L×L) (query dot each relative embedding) but misaligned (absolute-by-relative indexing). **Skew** to absolute-by-absolute by **padding dummy column, reshape (L+1)×L, slice last L rows** (Figure 1) — aligns `(i_q, r)` to `(i_q, j_k = r−(L−1)+i_q)`. Memory **0.52MB vs 1.1GB per head** at L2048, max length **3500 vs 650** on 16GB, **6× faster** at L650 (Table 1). Same time O(L²D) but practical.
3. **Relative local attention extension**: For even longer sequences, chunk into **non-overlapping blocks** (block size 512, cf. Liu 2018 Wikipedia, Parmar Image Transformer). Global would be L², local per block (N=L/M)². Adapt skew with **pad-right, flatten+pad-row, reshape (N+1)×(2N−1), slice** (Figure 2) — handles left-block (unmasked, distances −2N+1..−1) and right-block (masked global-like). Local relative NLL 1.840 ≈ global 1.835 (Table 3) — building RF across layers suffices, enables future very-long.
4. **Data representations**: **JSB**: 4-voice (SATB) chorales on 16th-note grid → serialize **S₁A₁T₁B₁S₂... (1024 common)** — position maps directly to time+voice grid, relative helps learn grid grammar (samples now always advance 4 steps per time). **Piano-e-Competition**: competition MIDI (1100 pieces 80/10/10, expressive 10ms) → **MIDI-like sparse events**: 128 NOTE_ON, 128 NOTE_OFF, 100 TIME_SHIFT (10ms), 32 VELOCITY (388 vocab) — **~2K per minute vs 6K–18K fixed grid** — challenges prior LSTM 15s/500 tokens limit; demonstrates relative works even when position ≠ time (event-based).
5. **JSB results (Table 2)**: Baseline Transformer 0.417 NLL → +concat sinusoids 0.398 → +instrument labels 0.370 → **Relative 0.357** → +concat+instrument 0.347 → **+relative pitch+time 0.335** (all note-wise val). Beats Coconet chronological 0.436 (orderless 0.238 lower bound). Samples: baseline drifts, relative maintains **grid and regular cadenced phrases** (Figure 3); first layer timing embeddings sufficient (closest to raw content).
6. **Piano-e-Competition results (Table 3)**: **Relative global 1.835** vs baseline 1.861, local relative 1.840, LSTM 1.969. **Priming** (Chopin Étude Op.10 No.5, 2× training length generated): relative elaborates motif with **clear contour, repetition & variation**, baseline uniform, LSTM drifts; relative generalizes beyond train length, baseline deteriorates (Figure 4, Appendix C attention visualizations show motifs attended). **Harmonization seq2seq** (melody 100ms grid → performance): relative **2.066→1.786** conditional NLL. **Human eval** (180 comparisons, 60 pairs ×3 raters, Likert): relative > baseline significantly; aggregate LSTM > Transformer despite higher perplexity but head-to-head not significant — perplexity ≠ musicality.
7. **Training details**: Tensor2Tensor, 6L, 8h, hs256–512, att=hs/2, ff 1024–2048, dropout 0.1, 0.1 LR early stopping, crops 2048 (Piano) /1024 (JSB), augmentations pitch transposition ±3 semitones, time stretch 0.95–1.05, max relative distance = L/2 (global) or 2 blocks (local).

## Detailed Notes

### Relative Attention Formulation (Section 3.3)
- `RelativeAttention = softmax((QK^T + S_rel)/√D_h) V` where `S_rel = Skew(Q E_r^T)`. E_r learned per head, distances ordered. Pitch/time variants add gathered `Q(R^t+R^p)` (content-dependent, so not skew-able — memory heavy, first layer only).

### Skewing Procedure Formal (Section 3.4.1)
- Transform `Q E_r^T` (L×L, row i_q col r) → `S_rel` (L×L, row i_q col j_k). Formula `j_k = r − (L−1) + i_q`. Steps: pad zero column left, reshape (L+1,L), slice bottom L rows. Visualized Figure 1 gray = masked.

### Domain Representations (Appendix A)
- **A.1 SATB grid**: pianoroll rows=voices, cols=time, serialized raster; MIDI pitch one-hot per token. **A.2 Performance events**: Oore 2018 vocabulary detailed, time-shift aggregates.

### Listening Test (Appendix B)
- 10 primes ×4 models (relative, baseline, LSTM, val set) ×3 comparisons per pair ×3 raters =180. Wilcoxon significance reported B.2.

## Notable Quotes
> "Music relies heavily on repetition to build structure and meaning. ... Self-attention over its own previous outputs allows an autoregressive model to access any part of the previously generated output at every step." — Section 1

> "The original formulation of relative attention requires O(L²D) memory ... This is prohibitive for long sequences such as musical compositions ... We propose an algorithm that reduces their intermediate memory requirement to linear in the sequence length." — Abstract

> "For a sequence of length L=2048 ... we reduce the memory consumption per layer from 8.5 GB to 4.2 MB (per head from 1.1 GB to 0.52 MB) ... allowing us to use GPUs to train the relative self-attention Transformer on long sequences." — Section 1.1

> "Samples from models with relative self-attention were perceived as more coherent than the baseline Transformer model." — Abstract

> "Relative attention was able to generalize to lengths longer than trained but baseline Transformer deteriorates beyond its training length." — Section 4.2.1

## Concepts Introduced or Referenced
- [[transformer]] — Decoder-only generative (language-modeling) for symbolic music; seq2seq encoder-decoder for harmonization.
- [[self-attention]] — From absolute to relative; global vs local block handling; enables long-range coherence.
- [[positional-encoding]] — From absolute sinusoid to **relative distance embeddings with skewing** — efficient form, pitch/time extensions.
- [[pretraining]] — Per-dataset training (not cross-dataset pretraining), NLL evaluation.
- [[multimodal-ai]] — Audio/symbolic music as sequence modality, parallel to image.

## Critical Assessment
- **Strengths**: First long-form music Transformer with SOTA and human-perceived gains; **algorithmically crucial** skewing unlocked future long-sequence relative attention (later used in many LLM relative variants before RoPE dominance); elegant representation pair (grid vs event) shows generality; priming beyond train length hints at **length generalization** via relative bias (later formalized by RoPE extrapolation).
- **Weaknesses**: Content-dependent relative (pitch/time) not skew-able — still O(L²D) and limited to first layer, not scalable to deeper layers; local vs global similar perplexity but qualitative local not evaluated for long-form coherence; human eval shows **perplexity-musicality mismatch** (LSTM rated higher than baseline Transformer despite worse NLL) — evaluation nuance; vocabulary limited to piano, no multi-instrument; no comparison to absolute RoPE (which later supersedes learned E_r).
- **Relation to Image/RoPE**: Shares **Parmar's locality** (chunking) and **Su's relative encoding** goals but solves memory differently (skew vs rotation). RoPE later offers **parameter-free** alternative with decay — Music Transformer’s learned E_r is more expressive per distance but requires O(L) params per head. Both highlight **relative > absolute** for domains with strong periodicity (vision 2D locality, music timing).
- **No contradiction**: Complements [[source-image-transformer]] — both show **Transformer + locality/relative structure** beats RNN/CNN for spatial/temporal long-range dependencies.

---

**Source:** Music Transformer: Generating Music with Long-Term Structure by Cheng-Zhi Anna Huang, Ashish Vaswani, Jakob Uszkoreit, Noam Shazeer, Ian Simon, Curtis Hawthorne, Andrew M. Dai, Matthew D. Hoffman, Monica Dinculescu, Douglas Eck (Google Magenta / Brain) — <https://arxiv.org/abs/1809.04281>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
