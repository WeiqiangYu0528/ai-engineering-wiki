---
type: source-summary
title: "Image Transformer"
summary: The June 2018 Google Brain paper (Parmar et al., arXiv 1802.05751, ICML 2018) generalizes the Transformer from language to autoregressive image generation with tractable likelihood.
status: draft
visibility: public
author: "Niki Parmar, Ashish Vaswani, Jakob Uszkoreit, Łukasz Kaiser, Noam Shazeer, Alexander Ku, Dustin Tran (Google Brain)"
source-type: paper
url: "https://arxiv.org/abs/1802.05751"
date-published: 2018-06-15
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
aliases:
  - wiki/source-image-transformer
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The June 2018 Google Brain paper (Parmar et al., arXiv 1802.05751, ICML 2018) generalizes the Transformer from language to autoregressive image generation with tractable likelihood.</p>
<p class="kb-provenance">Niki Parmar, Ashish Vaswani, Jakob Uszkoreit, Łukasz Kaiser, Noam Shazeer, Alexander Ku, Dustin Tran (Google Brain), 2018-06-15. <a href="https://arxiv.org/abs/1802.05751">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 22 figures on this page were not found in [https://arxiv.org/abs/1802.05751](https://arxiv.org/abs/1802.05751): `256×3`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The **June 2018 Google Brain paper (Parmar et al., arXiv 1802.05751, ICML 2018)** generalizes the [[transformer]] from language to **autoregressive image generation with tractable likelihood**. By **restricting self-attention to local neighborhoods** (1D flattened vs 2D block partitions with query/memory blocks) and treating pixels as **sequences of channels (256-way categorical or DMOL mixture)**, the **Image Transformer** decouples **receptive field size from parameter count** — achieving 256-pixel receptive fields with fewer FLOPs than 5×5 CNNs when d>RF. On **ImageNet 32×32**, it improves best NLL from **3.83→3.77 bits/dim** (state-of-the-art over Gated PixelCNN) and **2.90 bits/dim on CIFAR-10**; for **4× super-resolution (8×8→32×32)**, encoder-decoder Image Transformers **fool human evaluators 3× more often** (up to 36.1% vs 11% for prior PixelRecursive) while also supporting class-conditional generation.

## Key Takeaways
1. **From PixelRNN/CNN to Transformer**: Autoregressive image models factor `p(x)=∏ p(x_t|x_{<t})`. **PixelRNN** (RNN) has unlimited RF but sequential (expensive); **PixelCNN/PixelCNN++** (CNN) parallel but RF limited (25 with 5×5). Image Transformer keeps **parallel matrix-multiply** of Transformer while achieving **global RF via stacked local attentions** — best of both. Analogous to Vaswani et al. but with 2D locality.
2. **Local self-attention design (Section 3.3, Figures 1–2)**: Scalability bottleneck `O(h·w·l_m·d)` when `l_m = h·w·3` (3072 for 32×32). Solution: **partition into query blocks (l_q=256) and larger memory blocks (l_m=512)** associated per query block. All queries in a block attend to same memory — enables **two batched matmuls** (QK^T, attn·V) per block vs per-pixel. Masks ensure autoregressive (no future). Two schemes:
   - **1D local**: flatten in **raster-scan** order, query blocks non-overlapping contiguous in flattened, memory = query + preceding l_m pixels (can be discontiguous in 2D).
   - **2D local**: partition into **rectangular query blocks contiguous in image space**, memory extends top/left/right by h_m,w_m. Blocks generated raster-scan left→right, top→bottom; within-block also raster. 2D balances horizontal/vertical context vs 1D dominated by immediate predecessors — better with larger images.
3. **Pixel/channel representation (Section 3.1)**: Two regimes: **categorical**: each channel (RGB) as 256-way embedding (channel-specific input, shared output set), tensor `[h, w·3, d]`; **DMOL** (discretized mixture of logistics, from PixelCNN++): 10 mixtures ×10 params (prob+3 means+3 stds+3 coeffs) = **100/pixel** vs **768/pixel categorical** (256×3) → **7× smaller output, denser gradients, lower memory**; captures ordinal intensity and cross-channel dependence; similar NLL (2.90 either).
4. **Positional encoding for 2D**: Added only in first layer. Tested **sin/cos frequency split**: d/2 dims encode row, d/2 encode column+channel vs learned embeddings — **no difference for categorical, learned slightly better for DMOL**. Value includes both spatial coordinates.
5. **Encoder-decoder for super-resolution (Section 5.3)**: **Encoder** operates on **8×8** low-res (192 positions, full attention feasible) with per-pixel RGB embeddings +2D positional, **unmasked** (bidirectional). **Decoder** uses **local self-attention + encoder-decoder attention + FFN** stacks (2–3× fewer encoder layers optimal) and autoregressively generates **32×32** (4× magnification, massively underspecified: hair/makeup/gender invented). Training end-to-end NLL; inference via **tempered categorical sampling τ∈[0.8,1.0]** (lower τ sharper, more "fooling" but less diverse).
6. **Results**: **Generative modeling** Table 4: RF ablation shows monotonic NLL improvement 4.06 (bs 8) →3.47 (16) →3.13 (64) →**2.99 (256)** on CIFAR-10 — validates RF scaling. ImageNet 12-layer 512d 8-head 2048 FFN **3.77 bits/dim** beats PixelSNAIL 3.80. **Conditional** (CIFAR-10 class-conditional via added class embedding per position) similar NLL but perceptual ↑ (cars/trucks/ships realistic). **Super-resolution**: CelebA fool-rate **36.1±2.5% (2D, τ0.8)** vs 11% PixelRecursive, 8.5% srez GAN; CIFAR-10 super-resolution samples carry surprising detail from coarse input. Class-conditional tables show diversity among samples.
7. **Broader impact**: First to show **self-attention superior to convolution for images** at scale, paving path to **Vision Transformer (ViT, 2020) and generative transformers (VQGAN, DALL-E)**. Local block trick anticipates **Sparse Transformer, Longformer, Swin** ideas.

## Detailed Notes

### Architecture Details (Eq 1–2)
- Per layer: `q_a = layernorm(q + dropout(softmax(W_q q (M W_k)^T /√d) M W_v))`, then `q' = layernorm(q_a + dropout(W1 ReLU(W2 q_a)))` with residual+dropout+layernorm after each. Heads 4–8, d 256–512, FF 512–2048, dropout 0.1–0.3, Adam with Vaswani schedule, Tensor2Tensor codebase.

### Loss Comparison
- Categorical: softmax over 256 per channel; DMOL: per pixel logistic mixture, per-channel factorization with learned inter-channel dependence — strictly fewer params, similar likelihood.

### Human Eval (CelebA)
- Pairwise "which is more realistic?" vs ground truth; % fooled reported with std. Temperature tuning critical: τ0.8 best fool-rate (more conservative), τ1.0 more diverse but less convincing.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 4 passages in this section could not be located in the stored source ([https://arxiv.org/abs/1802.05751](https://arxiv.org/abs/1802.05751)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "By restricting the self-attention mechanism to attend to local neighborhoods we significantly increase the size of images the model can process in practice, despite maintaining significantly larger receptive fields per layer than typical convolutional neural networks." — Abstract

> "The number of positions included in the memory ... has tremendous impact ... which has a time complexity in O(h·w·l_m·d)." — Section 3.3

> "We observe significant improvements up to effective receptive field sizes of 256 pixels, while the PixelCNN ... used 25." — Section 1

> "In a human evaluation study, we find that images generated by our super-resolution model fool human observers three times more often than the previous state of the art." — Abstract

## Concepts Introduced or Referenced
- [[transformer]] — Decoder-only (unconditional) and encoder-decoder (super-resolution) variants; local attention as sparse approximation.
- [[self-attention]] — Local neighborhood vs global; query/memory block factorization to retain parallelism.
- [[positional-encoding]] — 2D split sinusoid/learned, per-channel.
- [[pretraining]] — Likelihood training `log p(x)=∑ log p(x_t|x_{<t})`, categorical vs DMOL; CIFAR-10/ImageNet benchmarks.
- [[multimodal-ai]] — Vision as sequence, precursor to ViT and autoregressive image generation.

## Critical Assessment
- **Strengths**: Conceptually minimal yet powerful — shows Transformer universality beyond NLP; decouples RF from params (key advantage over CNN); thorough RF ablation and human eval; open Tensor2Tensor code; 2D local insight (balanced context) validated later (Swin).
- **Weaknesses**: **Quadratic still within blocks** (512) — not truly linear; 1D vs 2D gap modest (0.02 bits) suggests locality scheme not strongly differentiated at 32×32; DMOL vs categorical not deeply analyzed (same NLL but perceptual not compared); ImageNet conditional not trained (labels unavailable) — misses class-conditional SoTA opportunity; later **VQ-VAE/ diffusion** eclipse pure autoregressive for high-res.
- **Relation to RoPE/Music**: 2D absolute positional encoding contrasts with **RoFormer’s 1D RoPE** (could extend to 2D rotation) and **Music Transformer's relative skewing** — image task would benefit from relative 2D bias (not explored). Complements [[source-attention-is-all-you-need]] by proving self-attention's domain generality.

---

**Source:** Image Transformer by Niki Parmar, Ashish Vaswani, Jakob Uszkoreit, Łukasz Kaiser, Noam Shazeer, Alexander Ku, Dustin Tran (Google Brain) — <https://arxiv.org/abs/1802.05751>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
