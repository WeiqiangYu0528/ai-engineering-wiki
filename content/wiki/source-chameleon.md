---
type: source-summary
title: "Chameleon: Mixed-Modal Early-Fusion Foundation Models"
summary: The May 2024 FAIR at Meta paper (arXiv 2405.09818, CS224n Week 9 Tue – Multimodality, Luke Zettlemoyer) presents Chameleon, a family of early-fusion, fully token-based mixed-modal foundation models (7B and 34B) that…
status: draft
visibility: public
author: "Chameleon Team, FAIR at Meta"
source-type: paper
url: "https://arxiv.org/abs/2405.09818"
date-published: 2024-05-16
date-ingested: 2026-08-25
tags:
  - multimodal
  - llm-fundamentals
  - open-source
key-concepts:
  - "[[multimodal-ai]]"
  - "[[image-generation]]"
  - "[[pretraining]]"
  - "[[alignment]]"
key-entities:
  - "[[meta]]"
  - "[[llama-3]]"
---

# Chameleon: Mixed-Modal Early-Fusion Foundation Models

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 3 of 36 figures on this page were not found in [https://arxiv.org/abs/2405.09818](https://arxiv.org/abs/2405.09818): `15.6`, `16.9`, `95.3`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The May 2024 FAIR at Meta paper (arXiv 2405.09818, CS224n Week 9 Tue – Multimodality, Luke Zettlemoyer) presents **Chameleon**, a family of **early-fusion, fully token-based mixed-modal** foundation models (7B and 34B) that represent both text and images as discrete tokens in a single transformer trained from scratch. By quantizing 512×512 images into 1,024 tokens (codebook 8,192 via VQGAN-style tokenizer, BPE 65k total) and interleaving them with text, Chameleon generates and reasons over arbitrary mixed sequences – text-only, image-text pairs, or full interleaved documents – in one autoregressive pass. The paper details stability innovations (QK-Norm, post-norm reordering, z-loss) that enable training on ~10T tokens (first stage 80%: 2.9T text + 1.5T text-image + 400B interleaved; second stage 20%: + high-quality + instruction data), its SFT alignment recipe, and evaluations showing SOTA image captioning/VQA, text parity with Mixtral 8x7B/Gemini-Pro, and **human-preferred (60.4% vs Gemini-Pro, 51.6% vs GPT-4V)** long-form mixed-modal generation. It is the token-discretization baseline later outperformed by [[source-transfusion]] and accelerated by [[source-mixture-of-transformers]].

## Key Takeaways
1. **Early-fusion token unification**: Unlike late-fusion encoders (Flamingo, LLaVA, IDEFICS with separate ViT) or grafted diffusion decoders, Chameleon **quantizes images to discrete tokens** and feeds them through *identical* transformer layers. Enables any ordering (image→text captioning or text→image generation) without modality-specific encoder/decoder at inference.
2. **Scale**: 9.2T tokens seen (2.1 epochs), 5× Llama-2, context 8k; tokenizer BPE 65k including image codes; licensed images upsampled for faces 2×; OCR-text images are weak point due to tokenizer reconstruction.
3. **Stability recipe is the core contribution**: Standard Llama architecture diverges at >8B/1T tokens due to **softmax logit drift** – modalities compete by growing norms beyond bf16 range (Fig. 5). Fixes: **QK-Norm** (LayerNorm on Q/K before attention, Dehghani 2023), **Swin-style norm reordering** (`x + attention_norm(attention(x))` bounding SwiGLU multiplication), **z-loss** (`1e-5 log²Z`), plus dropout 0.1 for 7B (34B without dropout). Without these, Chameleon-7B diverges by 20% epoch; 34B needs all three.
4. **Two-stage pre-training + SFT**: Stage1 unsupervised mixture (text / text-image pairs with 50% image-first rotation / interleaved web); Stage2 downweights Stage1 by 50% and mixes instruction sets. SFT categories: Text (1.6M, inherited Llama-2), Code (14k, CodeLlama), Visual Chat (15.6k), Image Gen (64k aesthetic-filtered, ≥6 classifier, top 64k closest to 512²), Interleaved (16.9k), Safety (95.3k including Rainbow Teaming, Pick-A-Pic, cyber, mixed-modal). **Modality balancing critical** else model learns unconditional prior.
5. **Inference challenges solved**: Per-step data-dependent decoding (inspect token to decide image vs text path, CPU-GPU copy), modality-constrained masking, fixed-size image blocks (1,024 tokens) vs variable text; PyTorch + xformers kernels, fused image-block generation when not streaming.
6. **Evaluations**:
   - **Text**: Matches Mixtral 8x7B & Gemini-Pro on commonsense/reasoning; outperforms Llama-2.
   - **Image→Text**: SOTA captioning/VQA vs Flamingo, IDEFICS, LLaVA-1.5.
   - **Text→Image**: "Non-trivial" generation (FID/CLIP competitive but later shown 34× less efficient than Transfusion).
   - **Mixed-modal human eval** (1,048 prompts: 42% mixed input, 12 task categories: brainstorming, comparison, hypothetical etc.): **55.2% fully fulfills** vs 37.6% Gemini+, 44.7% GPT-4V+; pairwise win rates 60.4% vs Gemini+, 51.6% vs GPT-4V+ (69.1%/61.7% vs text-only versions). Strong in brainstorming/comparison/hypothetical; weak in identification/reasoning. Inter-annotator Krippendorff α 0.338 (moderate due to partial vs full subjectivity).
7. **Resources**: 7B: 1,024 A100s, 856k GPU-hours; 34B: 3,072 A100s, 4.28M GPU-hours on RSC (Quantum InfiniBand) & alignment on Elastic Fabric; AdamW β1 0.9 β2 0.95 ε 1e-5, wd 0.1, grad clip 1.0, LR 1e-4 warm-up 4k exponential decay to 0.

## Detailed Notes

### Tokenization (Sec 2.1)
- Image tokenizer: VQGAN-based (Gafni 2022), 512²→1,024 tokens, codebook 8192, licensed-only data. Face upsampling. Limitation: heavy text in images reconstructs poorly → caps OCR.
- BPE tokenizer: sentencepiece, 65,536 vocab (57k text + 8k image), trained on subset of final mixture.

### Data (Sec 2.2)
- First stage: Llama-2 + CodeLlama 2.9T text tokens; 1.4B text-image pairs →1.5T tokens; 400B interleaved web tokens (filtered as for pairs). Independent of Meta product data.
- Second stage: + filtered instruction tuning trains; exact mix proprietary but proportion of image/text tokens held constant.

### Stability Deep Dive (Sec 2.3)
- **Diagnosis**: Output norms of last layer grow unchecked → predicts divergence. Softmax translation invariance (`softmax(z)=softmax(z+c)`) lets modalities compete by norm inflation; bf16 overflow triggers late divergence.
- **Ablations**: Fig 6 – without QK-Norm divergence; Fig 8 – dropout helps 7B but not 34B; norm-reordering needed for 34B. Z-loss essential for final softmax.
- **Table 1**: Chameleon 7B/34B: 4.4T tokens, LR 1e-4, 2.1 epochs, QK-Norm ✓, z-loss 1e-5; vs Llama-1/2: 1–2T, LR 3e-4/1.5e-4, no norm fixes.
- Optimization: batch 8M (7B) /12M (34B) tokens; 2.1 epochs =9.2T tokens; 600k steps plotted.

### Alignment (Sec 3)
- Lightweight SFT per Zhou 2023: cosine LR 1e-5, wd 0.1, batch 128, seq 4096, packing with delimiter, loss masked on prompts, dropout 0.05, z-loss retained. Images in prompt: padded (preserve info); in answer: center-cropped (aesthetic).
- Safety data covers violence, controlled substances, privacy, sexual content; includes synthetic Rainbow Teaming, Pick-A-Pic, cyber; mixed-modal prompts via manual+auto expansion – crucial for multimodal attack vectors.

### Human Evals (Sec 4)
- Prompt collection via vendor: scenario-based creative prompts (e.g., "kitchen – how to cook pasta? show layout"); filtered by 3 annotators for clarity & mixed-modal expectation →1,048 prompts. 12 categories distribution reveals user intent taxonomy for mixed-modal assistants.
- Baselines: GPT-4V, Gemini-Pro + enhanced versions with DALL-E 3 via caption tags (`<caption>`), making them strictly stronger – Chameleon still wins.
- **Absolute**: fulfillment rates above; safety: 0 objectionable unanimous.
- **Relative**: three-way preference (win/tie/loss) – Chameleon vs Gemini+ 41.5/34.5/24.0; vs GPT-4V+ 35.8/31.6/32.6; agreement: ~30-35% unanimous, ~55-58% 2/3, 9-13% no agreement.

### Benchmarks (Sec 5)
- VQA/captioning tables (cut off in truncated fetch) show 34B > prior SOTA on COCO captioning (CIDEr) and VQAv2.
- Limitations noted: English-only, no video, OCR weakness, FID not human-perfect.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 3 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2405.09818](https://arxiv.org/abs/2405.09818)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "By quantizing images into discrete tokens, analogous to words in text, we can apply the same transformer architecture to sequences of both image and text tokens, without the need for separate image/text encoders or domain-specific decoders."

> "Chameleon marks a significant step forward in a unified modeling of full multimodal documents."

> "Uncontrolled growth of output norms is a strong indicator of future training divergence."

## Concepts Introduced or Referenced
- [[multimodal-ai]] — Canonical early-fusion token-based mixed-modal document model; direct generalization of unimodal tasks.
- [[image-generation]] — Autoregressive image token generation vs diffusion; fixed-size block trade-offs; aesthetic filtering.
- [[pretraining]] — Two-stage mixture, stability at scale, data balancing.
- [[alignment]] — Modality-balanced SFT, safety with mixed-modal attack vectors.
- [[evaluation]] — Long-form mixed-modal human eval beyond static benchmarks (Schaeffer 2023 critique); HELM-style multi-metric but human.

## Critical Assessment
**Strengths**: First open large-scale demonstration of stable early-fusion training from scratch; thorough ablations isolate each stability fix; human eval is novel and well-controlled (enhanced baselines); maintains text performance while adding image – non-trivial.

**Weaknesses**: Discrete quantization is information bottleneck (Transfusion later shows 34× FLOP disadvantage for FID, 5× CLIP); tokenizer weakest on text-heavy images; 9.2T tokens is expensive (≈5× Llama-2) for parity text results; safety tuning data details proprietary; no comparison to Transfusion-style diffusion in original.

**Context**: Serves as **baseline** for [[source-transfusion]] (which beats it at <⅓ compute for image) and [[source-mixture-of-transformers]] (which achieves same quality at 55.8% FLOPs via sparsity). Validates that modality competition drives instability – motivates MoT's modality-specific decoupling. Complements [[image-generation]] but via autoregressive route vs GPT-Image 4o.

**Open question**: Can quantization be improved (larger codebook, residual) to close gap to diffusion, or is continuous diffusion fundamentally superior for pixels? Chameleon-34B without dropout suggests norm reordering generalizes.

---

**Source:** Chameleon: Mixed-Modal Early-Fusion Foundation Models by Chameleon Team, FAIR at Meta — <https://arxiv.org/abs/2405.09818>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
