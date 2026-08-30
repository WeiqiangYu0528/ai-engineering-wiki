---
type: concept
title: "Multimodal AI"
summary: Multimodal AI is the class of foundation models that jointly perceive, process, and generate data across modalities — text, images (and extended to video, audio/speech) — within a unified architecture.
visibility: public
aliases:
  - Mixed-Modal Models
  - Vision-Language Models
  - Early Fusion
  - wiki/multimodal-ai
tags:
  - multimodal
  - llm-fundamentals
created: 2026-08-25
updated: 2026-08-26
status: draft
sources:
  - "[[source-chameleon]]"
  - "[[source-transfusion]]"
  - "[[source-mixture-of-transformers]]"
  - "[[source-scaling-laws-mixed-modal]]"
  - "[[source-retrieval-augmented-multimodal]]"
  - "[[source-scaling-autoregressive-multimodal]]"
  - "[[source-lmfusion]]"
  - "[[source-promptingguide-techniques-multimodalcot]]"
  - "[[source-promptingguide-guides-4o-image-generation]]"
  - "[[source-llama-3-herd-of-models]]"
  - "[[source-visual-sketchpad]]"
  - "[[source-cs336-lecture17-alignment-multimodality]]"
related:
  - "[[image-generation]]"
  - "[[multimodal-cot]]"
  - "[[pretraining]]"
  - "[[scaling-laws]]"
  - "[[retrieval-augmented-generation]]"
  - "[[instruction-tuning]]"
  - "[[inference]]"
  - "[[alignment]]"
  - "[[evaluation]]"
  - "[[interpretability]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Multimodal AI is the class of foundation models that jointly perceive, process, and generate data across modalities — text, images (and extended to video, audio/speech) — within a unified architecture.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/multimodal/concepts/image-generation">Image Generation with LLMs</a></li><li><a href="/prompt-engineering/concepts/multimodal-cot">Multimodal Chain-of-Thought (Multimodal CoT)</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li><li><a href="/fine-tuning/concepts/instruction-tuning">Instruction Tuning</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/fine-tuning/concepts/alignment">AI Alignment</a></li><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li><li><a href="/eval-safety/concepts/interpretability">Interpretability</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/multimodal/sources/source-chameleon">Chameleon: Mixed-Modal Early-Fusion Foundation Models</a></li><li><a href="/multimodal/sources/source-transfusion">Transfusion: Predict the Next Token and Diffuse Images with One Multi-Modal Model</a></li><li><a href="/multimodal/sources/source-mixture-of-transformers">Mixture-of-Transformers: A Sparse and Scalable Architecture for Multi-Modal Foundation Models</a></li><li><a href="/multimodal/sources/source-scaling-laws-mixed-modal">Scaling Laws for Generative Mixed-Modal Language Models</a></li><li><a href="/multimodal/sources/source-retrieval-augmented-multimodal">Retrieval Augmented Multimodal Language Modeling (RA-CM3)</a></li><li><a href="/multimodal/sources/source-scaling-autoregressive-multimodal">Scaling Autoregressive Multi-Modal Models: Pretraining and Instruction Tuning (CM3Leon)</a></li><li><a href="/multimodal/sources/source-lmfusion">LMFusion: Adapting Pretrained Language Models for Multimodal Generation</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-multimodalcot">Prompt Engineering Guide — Multimodal CoT Prompting</a></li><li><a href="/multimodal/sources/source-promptingguide-guides-4o-image-generation">OpenAI 4o Image Generation Guide — Prompt Engineering Guide (DAIR.AI) Guides</a></li><li><a href="/llm-fundamentals/sources/source-llama-3-herd-of-models">The Llama 3 Herd of Models</a></li><li><a href="/multimodal/sources/source-visual-sketchpad">Visual Sketchpad: Sketching as a Visual Chain of Thought for Multimodal Language Models</a></li><li><a href="/multimodal/sources/source-cs336-lecture17-alignment-multimodality">CS336 Lecture 17 — Multimodal Models (Percy Liang, Wed May 27) — Alignment · Multimodality</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Multimodal AI** is the class of foundation models that jointly perceive, process, and generate data across modalities — text, images (and extended to video, audio/speech) — within a unified architecture. The CS224n Week 9 trajectory (Luke Zettlemoyer) traces an evolutionary arc from **late-fusion encoders** (Flamingo, LLaVA, IDEFICS: separate ViT encoder grafted onto LLM) to **early-fusion token models** pioneered by [[source-chameleon]] (Chameleon: fully discrete, early-fusion, 34B on 9.2T tokens) and refined by [[source-transfusion]] (hybrid discrete-diffusion in one transformer) and [[source-mixture-of-transformers]] (MoT: modality-sparse towers). Three optional papers complete the design space: [[source-scaling-laws-mixed-modal]] derives **when mixing modalities helps vs hurts** (competition→synergy interaction term, 250+ runs, 7 modalities); the retrieval line [[source-retrieval-augmented-multimodal]] → [[source-scaling-autoregressive-multimodal]] (RA-CM3 → CM3Leon) shows **retrieval-augmented pretraining buys synergy early** (CM3Leon: zero-shot COCO FID 4.88 with 5× less compute than Parti); and [[source-lmfusion]] shows a pretrained Llama-3 can be **adapted** into a generator by freezing text towers and training parallel image modules at 50% FLOPs. **CS336 Lecture 17** ([[source-cs336-lecture17-alignment-multimodality]], Percy Liang) supplies the *pedagogical ladder* underlying this evolution: **CLIP (400M pairs, ViT-L/14@336) → SigLIP (WebLI billion, sigmoid BCE, 5d/32 TPUv4) → LLaVA (158K GPT-4-synth, single W) → LLaVA-OneVision (SigLIP + AnyRes tiling, length-balanced multi-image/video) → Qwen-VL family (Qwen-VL → Qwen2-VL MRoPE/2×2 merge → Qwen3-VL SigLIP-2/interleaved MRoPE/DeepStack/256K/235B-A22B) → Chameleon (VQ-VAE 1024 tokens, QK-Norm+z-loss)** — framing the field goal as an **omni model** (any→any modality, understanding + generation) and identifying the *token imperative* (`Transformers speak tokens`) and *comprehension vs generation* fidelity trade-off as load-bearing. These models enable **arbitrary interleaving** — text→image generation, image→text understanding, and full mixed-modal documents — as a direct generalization of unimodal LLM tasks.

## Key Ideas
- **Early vs late fusion**: Late-fusion keeps modality encoders separate (efficient for understanding-only but limited interleaving); early-fusion projects all modalities into **shared token space from inception**, allowing seamless cross-modal reasoning and generation at cost of optimization stability and data scale. Chameleon uses **discrete quantization** (VQGAN 512²→1,024 tokens, codebook 8,192, BPE 65k) for full autoregression; Transfusion keeps **continuous latents** (VAE 256²→32×32×8) and avoids quantization bottleneck.
- **Loss hybridization matters**: Chameleon's pure next-token on quantized images is information-lossy — Transfusion replaces it with `L = L_LM + λ·L_DDPM` (λ=5, cosine diffusion schedule, bidirectional intra-image attention) and shows **Pareto dominance** at matched FLOPs (6ND): Chameleon parity at 34% FLOP for FID, 32% CLIP, 22% CIDEr, 49–60% text PPL. Diffusion needs fewer parameters for images, freeing capacity for text.
- **Stability at scale is non-trivial**: Chameleon diagnoses **softmax logit drift** — modalities compete by norm growth beyond bf16, diverging after 20–30% of training. Fix triad: **QK-Norm** (LN on Q/K), **Swin norm reordering** (`x+norm(attn(x))` bounding SwiGLU), **z-loss** (`1e-5 log²Z`), plus dropout (7B) or not (34B). Without, even 7B diverges.
- **Sparsity resolves modality competition**: [[source-mixture-of-transformers]]'s PCA (layers 1,5,17,32) reveals **distinct modality clusters** despite uniform tokens — dense optimization has conflicting dynamics. MoT decouples **all non-embedding params** (FFN, Q/K/V/O, LN) by modality with deterministic routing (no MoE load-balancing issues) while keeping **global self-attention** for cross-modal fusion. Result: same FLOPs per token, `M×` sparse params. 7B MoT matches dense at **55.8% FLOPs (Chameleon), 37.2% for speech (3 modalities), ~33% for image in Transfusion**; 760M MoT beats 1.4B dense. Wall-clock on AWS A100: **47.2% time for image, 75.6% for text**.
- **Mixed-modal scaling laws predict competition→synergy**: [[source-scaling-laws-mixed-modal]] extends Chinchilla `L(N,D)` with a per-modality-pair **interaction term C_{i,j}** modelling competition (positive) or synergy (negative): small N/D → joint training *worse* than unimodal (curse-of-multilinguality analogue); at scale the term crosses zero → synergy, validated with a 30B speech-text model beating unimodal controls. Explains emergent phenomena: **coordinate-ascent loss alternation**, stability correlated with |C| (logit drift), hyperparameter transfer (`η*_mixed ≈ Σ w_j η*_j`). Modality membership itself is empirical (σ=3 cross-perplexity threshold separates 7 modalities). This law is *why* MoT/LMFusion sparsity and CM3Leon retrieval exist — they manufacture synergy below the scale where it emerges naturally.
- **Retrieval augmentation as an early-synergy substitute**: [[source-retrieval-augmented-multimodal]] (RA-CM3) adds a frozen CLIP ViT-L/14 dense retriever (text⊕image averaged, MIPS via FAISS; diversity = redundancy-skip >0.9 + 20% query dropout) to CM3 causal-masked infilling, prepending K∈{0,1,2} multimodal docs in-context with joint loss `L_main + α·L_retr` (α=0.1). Trained from scratch on 150M LAION pairs (2.7B, 256×A100×5d): **FID 29.5→15.7, CIDEr 71.9→89.1** on COCO at <30% of DALL-E's compute, plus faithful entity rendering and multimodal ICL (1-shot classification 0.53→0.78). [[source-scaling-autoregressive-multimodal]] scales this to CM3Leon-7B on licensed 340M Shutterstock pairs with multi-task SFT instruction tuning: **zero-shot MS-COCO FID 4.88 (2 retrieved docs) vs Parti-20B 7.23 at ~5× less compute**, competitive image→text despite only ~3B text tokens (VizWiz 37.6 > Flamingo-9B), controllable editing/grounding via SFT, and self-contained contrastive decoding (CD-K) complementary to CFG.
- **Adaptation instead of pretraining (LMFusion)**: [[source-lmfusion]] attaches parallel modality-specific modules (QKV/O, FFN, LN; shared attention; U-Net diffusion head) to frozen Llama-3 8B, trains only the image path on Transfusion's 380M Shutterstock pairs: **+20% image understanding, +3.6% generation at 50% FLOPs** vs from-scratch Transfusion while text stays intact (+11.6% over Transfusion). Ablations: naive dense finetuning → catastrophic language forgetting; deep separation > shallow (FFN-only); η_text/η_img ratio traces the retention Pareto (freezing is the limit). LLaVAFusion extends VLMs with generation (MMMU/MME/ChartQA/RealWorldQA preserved).
- **Patch compression & serving**: Transfusion's U-Net down/up blocks enable **16 patches per image vs 1024** (64× attention saving) with minimal loss — crucial since image tokens dominate sequence length (Chameleon 1,024 vs Transfusion 16–256). Inference requires per-step data-dependent routing (inspect BOI/EOI to switch LM vs diffusion mode) and fixed-size image blocks, addressed via fused kernels.
 - **Alignment & data**: Two-stage pretraining (80% unsupervised mixture: 2.9T text +1.5T pairs +400B interleaved; 20% + high-quality instruction) → modality-balanced SFT (text 1.6M, visual chat 15.6k, image gen 64k aesthetic ≥6, interleaved 16.9k, safety 95.3k covering Rainbow Teaming & mixed-modal attacks). Balancing prevents unconditional modality prior. CM3Leon shows licensed data + retrieval can beat web-scraped scale; LMFusion shows frozen towers are the strongest preservation mechanism.
 - **CS336 L17 encoder→projector→omni ladder (CLIP/SigLIP/Qwen/Chameleon)**: [[source-cs336-lecture17-alignment-multimodality]] traces *how* images become tokens: CLIP contrastive at 32K batch (image↔text symmetric, requires large-batch softmax; zero-shot ImageNet > supervised ResNet-50) → SigLIP decouples batch via binary BCE (WebLI O(B), 10% keep, 100 langs; 10d/256 TPUv3 → 5d/32 TPUv4); LLaVA minimal `W` projector (Stage 1 freeze vision+LM → Stage 2 `W`+LM, 158K COCO→GPT-4 synth) → LLaVA-OneVision high-res fix (AnyRes `a×b` tiling + 2-layer MLP; SigLIP grid before+after last layer; single-image high-res / multi-image base / video low-res length harmonization; quality>quantity, easy→hard); Qwen ladder (VL 256-token adaptor with 3 stages → 2-VL 675M ViT 2×2→66 tokens + MRoPE + 2fps/16K video → 3-VL SigLIP-2 + interleaved `[t w h ...]` MRoPE, timestamp tokens, sqrt-norm loss, DeepStack fusion, 4-stage 8K→256K, 235B-A22B MoE); Chameleon discrete omni (512²→1024 VQ-VAE tokens, codebook 8192, 80% 2.9T/1.5T/400B mixture, QK-Norm+z-loss for entropy-mismatch stability) → lecture advocates **continuous encoders + Transformer + diffusion** over pure quantization for generation fidelity (OCR gap).

## How It Works
```
Text string ──BPE──► discrete integers ──embedding─┐
                                                  │
Image 512² ──VQGAN (Chameleon) ─► 1024 discrete ──┤─► Shared Transformer (early-fusion)
     OR 256² ──VAE (Transfusion) ─► 32×32×8 ─► patches (16-256) + U-Net ─┘
                                                  │  Attention: causal across seq + bidirectional within image
                                                  │  MoT: modality-specific Q/K/V/O, FFN, LN per tower
                                                  │  Objective: L_LM (text) + λ·L_DDPM (image, λ=5, T=1000/250, CFG 3-5)
                                                  ▼
Interleaved sequence [text | <BOI> image <EOI> | text ...] ─autoregressive/diffusion decode─► mixed document
Metrics: COCO CIDEr/FID/CLIP, GenEval (vs SDXL/DALL·E 2), human preference (Chameleon 60.4% vs Gemini+, 51.6% vs GPT-4V+)
```
 - **Dense Chameleon** path vs **Transfusion** hybrid path converge in MoT: same global attention but towers separate — modular efficiency without losing cross-modal normalization.
- Training: AdamW 3e-4 (Chameleon needs 1e-4), 2M-token batches, 4096 context, 2.1 epochs (9.2T tokens Chameleon) or 0.5T ablation / 2T large-scale (Transfusion).
- **CS336 L17 instantiation:** Percy emphasizes omni training as *80% large-scale unsupervised* (2.9T text / 1.5T pairs / 400B interleaved) + *20% replay+quality* → modality-balanced SFT; stability requires QK-Norm + z-loss (logit drift from entropy mismatch grows beyond bf16 after 20-30% training) and per-token sqrt-norm to avoid video domination — concrete checks linking to [[scaling-laws]] and [[inference]] long-context.

## Practical Implications
- **Architecture choice**: For understanding-heavy apps (VQA, captioning) late-fusion may suffice; for generation/interleaving (storyboards, instructional docs with images, 4o-style image_gen) early-fusion token/diffusion is superior. If building from scratch, **start with Transfusion recipe** (continuous + diffusion) over Chameleon quantization — 3× more FLOP-efficient and better text retention. Add **MoT sparsity** if adding speech/video or scaling beyond 7B to cut pretraining cost by ~½ and wall-clock by ~½.
- **Budget-constrained decision tree**: (1) Already own a strong LLM → **LMFusion-style adaptation** (cheapest: image-only training at 50% FLOPs, language preserved). (2) Need knowledge/entity-faithful generation without frontier compute → **RA-CM3/CM3Leon retrieval-augmented** route (retrieval substitutes for scale; licensed data viable). (3) Frontier-scale from-scratch budget → Transfusion/MoT; consult [[source-scaling-laws-mixed-modal]] to check whether your (N, D) regime predicts competition (then use sparsity/retrieval) or synergy (mix freely).
- **Serving cost**: Prefer U-Net Transfusion with 16–64 patches per 256² image over 1024-token Chameleon for 10–64× KV-cache saving; balance with text PPL regression (10.3→11.4 at 16 patches). For latency-sensitive mixed docs, use non-streaming fused image-block generation. LMFusion's frozen text tower keeps text serving identical to the base LLM.
- **Stability checklist**: Monitor output norms of last layer — uncontrolled growth predicts divergence; apply QK-Norm + z-loss by default; use norm reordering if SwiGLU + >1T tokens; expect larger competition coefficient C (scaling law) to correlate with instability.
- **Evaluation beyond benchmarks**: Static COCO/VQAv2 saturate; adopt **long-form mixed-modal human eval** (1,048 prompts, 12 categories like brainstorming/comparison) with enhanced baselines (GPT-4V + DALL·E 3 captions) as in Chameleon Sec 4; measure fulfillment (fully/partially/not) and pairwise preference, report Krippendorff α. For image generation, tune CFG per benchmark (3–5) not fixed; CM3Leon adds CLIP rerank + CD-K — report both reranked and single-sample numbers.
- **Safety**: Include mixed-modal safety SFT (image+text adversarial prompts) — text-only safety does not cover cross-modal attacks (e.g., image jailbreak); freezing helps preservation but does not address vision-side harms.

## Connections
- Extends [[image-generation]] (4o autoregressive `image_gen.text2im`) from text→image to arbitrary interleaving; Transfusion's diffusion mode shares schedule/CFG with latent diffusion art; CM3Leon proves the pure-autoregressive route can beat diffusion on FID-per-FLOP with retrieval.
- Grounds [[multimodal-cot]]: two-stage rationale+answer now fused in one early-fusion transformer — rationale can be interleaved text-image. The training-free counterpart is [[source-visual-sketchpad]], which makes existing multimodal LMs emit *drawn* rationales (plots, auxiliary lines, segmentation/depth overlays) via code in a ReAct loop — the tool-composition complement to this page's pretraining-centric fusion papers, and a stated future instruction-tuning target for natively multimodal models like Chameleon.
- Scales with [[pretraining]] (tokenizer design, data pipelines, scaling laws) and [[inference]] (prefix caching, attention kernels); MoT's grouping adds negligible overhead but enables horizontal scaling. [[source-scaling-laws-mixed-modal]] is the direct multimodal extension of [[scaling-laws]].
- The retrieval line connects to [[retrieval-augmented-generation]]: RA-CM3 generalizes text-RAG (DPR/RETRO) to bidirectional image-text retrieval+generation, and CM3Leon's in-context retrieved docs are a visual analogue of [[in-context-learning]].
- CM3Leon's multi-task SFT (editing/grounding/VQA) is vision-domain [[instruction-tuning]], following OPT-IML recipes.
- Intersects [[evaluation]]: HELM incompleteness applies — no single FID/CLIP captures mixed-doc quality; need human holistic. Feeds [[alignment]]: modality-balanced SFT is alignment specialization.
- Shares optimization tension with [[interpretability]]: PCA modality gap is interpretability signal exploited by MoT and by LMFusion's frozen-tower split.

## Open Questions
- Can quantization close gap to diffusion with larger residual codebooks, or is continuous fundamentally superior for pixel fidelity vs text interleaving?
- Does retrieval remain necessary at Chameleon scale (9.2T tokens), or is it strictly an early-regime crutch that the scaling-law interaction term eventually makes redundant? What is the retrieval-vs-parameters iso-FID frontier?
- LMFusion freezes text towers — forfeiting the synergy regime the scaling law predicts at scale. Is there a middle path (low-LR text co-training with replay) that preserves language while gaining cross-modal synergy?
- For tasks requiring tight cross-modal fusion (e.g., diagram reasoning, OCR-heavy interleaving), does MoT's separate towers hurt vs dense? Hybrid MoT+MoE (text tower MoE-4x + image MoT) is promising but unproven at scale.
- How to scale MoT to video (spatio-temporal patches) without exploding sparse params? Asymmetric towers (heavier for video) may help.
- Tokenizer OCR weakness (text-heavy images) caps real-world document modeling — need text-aware image tokenizer.
- Living benchmark for mixed-modal: can we automate human preference (VLM-as-judge) without bias, similar to HELM's living benchmark ethos?

## Sources
- [[source-chameleon]] — Dense early-fusion discrete baseline, stability recipe, human eval.
- [[source-transfusion]] — Hybrid discrete-diffusion, scaling laws vs Chameleon, U-Net compression.
- [[source-mixture-of-transformers]] — Sparse modality-tower scaling, systems wall-clock, deterministic routing.
- [[source-scaling-laws-mixed-modal]] — Competition/synergy interaction term; predicts when mixing helps; hyperparameter transfer.
- [[source-retrieval-augmented-multimodal]] — RA-CM3: multimodal retriever + joint retrieval loss; first bidirectional retrieve-and-generate.
- [[source-scaling-autoregressive-multimodal]] — CM3Leon: licensed-data retrieval-augmented SFT; FID 4.88 at 5× less compute; CD-K decoding.
- [[source-lmfusion]] — Frozen-text adaptation of Llama-3 into a generator at 50% FLOPs; deep separation ablations; LLaVAFusion.
- [[source-cs336-lecture17-alignment-multimodality]] — CLIP/SigLIP/LLaVA/Qwen/Chameleon ladder; AnyRes/MRoPE/DeepStack; stability (QK-Norm+z-loss); omni framing.
- [[source-promptingguide-techniques-multimodalcot]] — Two-stage vision-language CoT precursor.
- [[source-promptingguide-guides-4o-image-generation]] — Autoregressive image generation prompt practice.

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
