---
type: source-summary
title: "Transfusion: Predict the Next Token and Diffuse Images with One Multi-Modal Model"
summary: The Aug 2024 Meta paper (arXiv 2408.11039, CS224n Week 9 – Multimodality, Luke Zettlemoyer) introduces Transfusion, a recipe for training a single transformer over mixed sequences of discrete text tokens (next-token…
status: draft
visibility: public
author: "Chunting Zhou, Lili Yu, Arun Babu, Kushal Tirumala, Michihiro Yasunaga, Leonid Shamis, Jacob Kahn, Xuezhe Ma, Luke Zettlemoyer, Omer Levy (Meta, Waymo, USC)"
source-type: paper
url: "https://arxiv.org/abs/2408.11039"
date-published: 2024-08-20
date-ingested: 2026-08-25
tags:
  - multimodal
  - llm-fundamentals
  - inference
key-concepts:
  - "[[multimodal-ai]]"
  - "[[image-generation]]"
  - "[[pretraining]]"
  - "[[inference]]"
key-entities:
  - "[[meta]]"
  - "[[llama-3]]"
---

# Transfusion: Predict the Next Token and Diffuse Images with One Multi-Modal Model

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 23 of 44 figures on this page were not found in [https://arxiv.org/abs/2408.11039](https://arxiv.org/abs/2408.11039): `4.69`, `61.5`, `59.1`, `27.2`, `18.0`, `29.6`, `32×32`, `16.8`, `16.7`, `7.72`, `8.41`, `4.28`, `25.5`, `24.3` (+9 more). They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The Aug 2024 Meta paper (arXiv 2408.11039, CS224n Week 9 – Multimodality, Luke Zettlemoyer) introduces **Transfusion**, a recipe for training a single transformer over mixed sequences of **discrete text tokens (next-token prediction) and continuous image patches (diffusion)**. At each step the same transformer sees 50/50 text/image data and is optimized on `L = L_LM + λ·L_DDPM` (λ=5) where image patches are produced by an 86M VAE (256²→32×32×8 latents) and optionally compressed via linear or U-Net down/up blocks. A novel **semi-causal attention** (causal across elements, bidirectional within an image's patches) lets patches attend to each other. Controlled comparisons versus Chameleon's discretization at identical FLOPs (6ND) show Transfusion scales better **in every modality**: reaches Chameleon parity at **34% FLOPs for FID (text→image), 32% for CLIP, 22% CIDEr (image→text), and 49–60% for text perplexity**; on text alone it degrades less than Chameleon's LM-on-image-tokens + stability mods. Ablations show bidirectional attention and U-Net patch encoders (enabling 16-patch images at 64× serving saving) are crucial. Scaling to 7B (+0.27B U-Net) on 2T tokens (692M images) yields a model competitive with SDXL/DALL·E 2 on GenEval and Llama-1 on text – "best of both worlds" in one model.

## Key Takeaways
1. **Hybrid loss unification**: Keep images continuous – no quantization bottleneck. Text: cross-entropy next-token; image: DDPM noise-prediction MSE `L_DDPM = E|| ε - ε_θ(x_t,t,c)||²` with cosine schedule, T=1000 train / 250 steps inference, CFG. Losses summed per-token (text) and per-image (diffusion) with λ=5. Model conditions on noisy `x_t` during training (downstream tokens see noisy images).
2. **Data representation**: Text = Llama-2 tokenizer integers; image = VAE latent patches sequenced L→R top→bottom; BOI/EOI special tokens bracket images. Two patchification options: (a) linear (+ timestep embedding), (b) U-Net down/up blocks (replaces AdaLayerNorm with LN) – latter adds 0.27B params but enables aggressive compression.
3. **Transfusion attention**: Beyond standard causal mask, patches **within same image attend bidirectionally** (Figure 4). Ablation: linear model FID 61.3→20.3 with bidirectional; U-Net already has internal bidirectionality so gap smaller (16.8→16.7). Critical for generation quality.
4. **Controlled superiority over Chameleon**: 5 scales (0.16B–7B, Llama config table), 0.5T tokens, 2M batch, AdamW 3e-4 cosine, same VAE data/compute (VQ-VAE vs VAE differ only by codebook loss 16k codes). Chameleon needs stability fixes (QK-Norm, post-norm, denom loss, LR 1e-4) incurring cost. Results log-metric vs log-FLOPs: Transfusion Pareto-dominates. Largest 7B table: C4 PPL 7.72 vs 8.41, Wiki 4.28 vs 4.69, Llama Acc 61.5 vs 59.1, CIDEr 27.2 vs 18.0, FID 16.8 vs 29.6, CLIP 25.5 vs 24.3. **Surprise**: even text-only improves under Transfusion – hypothesis: diffusion needs fewer params for images → more capacity for text, or no output-distribution competition.
5. **Patch size trade-offs**: Latent→pixel patch mapping studied (1×1→8²/1024 patches →8×8→64²/16 patches). Linear degrades with larger patches (FID 21→43.5 at 16 patches); **U-Net improves with larger patches on image tasks** (FID 16.7→16.1 at 64→16 patches) because more images seen per batch, at cost of text PPL 10.3→11.4. Enables 16-patch images – 64× attention saving.
6. **U-Net inductive bias**: Beyond param count: 7B with linear vs U-Net (+3.8% params) still gains – CIDEr 19.1→28.1 at 1.4B, FID 19.4→16.6. Small model with U-Net beats larger linear model.
7. **Large-scale 7B+U-Net on 2T**: 1T text + ~5 epochs 692M images (≈1T patches/256 per image), Shutterstock 380M + 220M public (no people) + CC12M + aesthetic upweight last 1%. Figure 2 samples (avocado armchair etc.) show high aesthetic. GenEval → outperforms DALL·E 2, SDXL; text benchmarks → Llama-1 parity. Validated inference with CFG tuned per benchmark (optimal 3–5, not 5). Image editing via noised masked continuation also demonstrated.
8. **Decoding algorithm**: Switches modes: LM mode sample BOI → append pure noise `x_T` (n patches for desired size) → denoise T steps (each step overwrites `x_t` with `x_{t-1}`, no access to prior timesteps) → append EOI → back to LM. Enables arbitrary interleaving.

## Detailed Notes

### Background (Sec 2)
- LM loss Eq1: `L_LM = E[-log P_θ(y_i|y_<i)]`. Diffusion forward: `x_t = √ᾱ_t x_0 + √(1-ᾱ_t) ε`, reverse learns `ε_θ(x_t,t,c)`. Noise schedule cosine; inference peels noise iteratively; CFG contrasts conditional/unconditional.
- Latent VAE: 256²→32×32×8 tensor (each latent =8×8 pixel patch conceptually), CNN encoder/decoder, reconstruction+regularization; VQ-VAE adds codebook commitment β=0.25, 16,384 codes.

### Transfusion Architecture (Sec 3)
- Transformer = Llama flavor (SwiGLU, RoPE) – "despite name, could work with other backbones".
- Modality-specific lightweight encoder/decoder (<0.5% params linear, negligible) though U-Net larger. Modality embeddings not needed due to BOI/EOI.
- Training: Per image, add noise before patchification → compute image-level diffusion loss. Gradient flows through noisy context – discussed Sec 4.3.4 (noising variants).
- Inference detailed algorithm – handles variable image sizes via n patches.

### Experiments Setup (Sec 4.1)
- Eval: Wikipedia/C4 PPL, Llama-2 suite avg 0-shot (HellaSwag, PIQA, SIQA, WinoGrande, ARC-e/c, BoolQ); MS-COCO: CIDEr (cap), FID/CLIP (gen, 30k →5k for ablations); GenEval for large model.
- Data: 0.5T ablation = Llama-2 corpus 2T tokens subsampled + Shutterstock 380M images (center-cropped 256², random caption order 80% caption-first). Large-scale 2T adds diversity.
- Model configs: Table 2 – 0.16B (16L 768d) to 7B (32L 4096d 32 heads).
- Optimization: same as Chameleon baseline but LR 3e-4 (Chameleon needs 1e-4 for stability).

### Controlled Comparison (Sec 4.2)
- Log-log regression lines; thresholds for Chameleon outliers (FID≤100 etc.). Table 4 ablation of text degradation: Transfusion +0.3 PPL on C4 vs Chameleon +0.9 from stability mods alone +0.8 from LM on image tokens → total +1.7, explaining text gap.
- Theoretical FLOPs `6ND` used to factor out shorter sequence length advantage of Transfusion (fewer tokens per image) – fair comparison.

### Architecture Ablations (Sec 4.3)
- **Attention**: Table 5 numbers above.
- **Patch size**: Table 6 comprehensive; bold global best vs underlined arch-best.
- **U-Net vs linear**: Table 7 scaling; 0.16B linear vs U-Net (Δ106% params) large gain, but at 7B Δ3.8% still wins.
- **Image noising**: (truncated) discusses conditioning on noisy images vs clean – leaving downstream text conditioning on noise is acceptable.

### Comparison to Lit (Sec 4.4)
- 7B Transfusion GenEval vs SDXL etc. – competitive without separate text encoder. Also supports image editing (inpainting via mask noising shown Appendix C).

## Notable Quotes
> "We show it is possible to fully integrate both modalities, with no information loss, by training a single model to both predict discrete text tokens and diffuse continuous images."

> "Transfusion combines the language modeling loss function (next token prediction) with diffusion to train a single transformer over mixed-modality sequences."

> "Adding U-Net down and up blocks … enables Transfusion to compress larger image patches with relatively small loss to performance, potentially decreasing the serving costs by up to 64×."

## Concepts Introduced or Referenced
- [[multimodal-ai]] — Reference architecture for unified discrete+continuous modeling; replaces early-fusion discretization.
- [[image-generation]] — Diffusion vs autoregressive generation trade-off; GenEval, FID/CLIP, CFG, VAE latents.
- [[pretraining]] — Mixed 50/50 sampling, λ balancing, large-scale data curation, epoch handling.
- [[inference]] — Dual-mode decoding (LM sampling + iterative denoising), attention masking at serve, CFG tuning.
- [[multimodal-cot]] — Could leverage Transfusion's joint reasoning but not directly evaluated.

## Critical Assessment
**Strengths**: Rigorous controlled FLOPs-matched comparison to Chameleon (identical VAE training, same data, theoretical FLOPs) → clean scaling law; demonstrates hybrid loss superiority across *all* modalities, not just image; practical U-Net compression addresses serving cost, a key deployment concern; large-scale 7B validates real-world generative quality.

**Weaknesses**: λ=5 untuned; no ablation of diffusion schedule or loss weighting per token vs per image; large-scale data includes Shutterstock licensed (unreproducible); text benchmark suite limited to perplexity + Llama-2 suite – missing MMLU/HELM holistic view; image-noising conditioning on noisy context may limit downstream text quality (acknowledged but not fully resolved).

**Contradictions / Synthesis**: Directly contradicts Chameleon's discretization premise – shows quantization loses information and costs text capacity. Supports MoT's later claim that modality competition hurts dense models – Transfusion's modality-specific loss is first step; MoT extends to modality-specific parameters. Together, Chameleon (token) → Transfusion (diffusion) → MoT (sparsity) forms clear evolutionary arc for [[multimodal-ai]] toward efficient unified models.

---

**Source:** Transfusion: Predict the Next Token and Diffuse Images with One Multi-Modal Model by Chunting Zhou, Lili Yu, Arun Babu, Kushal Tirumala, Michihiro Yasunaga, Leonid Shamis, Jacob Kahn, Xuezhe Ma, Luke Zettlemoyer, Omer Levy (Meta, Waymo, USC) — <https://arxiv.org/abs/2408.11039>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
