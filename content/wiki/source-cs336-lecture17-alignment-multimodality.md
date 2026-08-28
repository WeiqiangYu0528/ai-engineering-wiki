---
type: source-summary
title: "CS336 Lecture 17 — Multimodal Models (Percy Liang, Wed May 27) — Alignment · Multimodality"
summary: "The Spring 2026 CS336 Lecture 17 (lecture17.py trace, Wed May 27, Percy Liang) is the capstone synthesis listed on the schedule as \"Alignment - multimodality\" but executed as \"Lecture 17: multimodal models\" — a…"
status: draft
visibility: public
author: "Percy Liang (Stanford CS336, Spring 2026)"
source-type: article
url: "https://cs336.stanford.edu/lectures/?trace=lecture_17"
date-published: 2026-05-27
date-ingested: 2026-08-26
tags:
  - multimodal
  - llm-fundamentals
  - eval-safety
key-concepts:
  - "[[multimodal-ai]]"
  - "[[image-generation]]"
  - "[[alignment]]"
  - "[[evaluation]]"
  - "[[scaling-laws]]"
key-entities:
  - "[[openai]]"
  - "[[stanford-university]]"
  - "[[huggingface]]"
---

# CS336 Lecture 17 — Multimodal Models (Percy Liang, Wed May 27) — Alignment · Multimodality

## Summary
The **Spring 2026 CS336 Lecture 17 (`lecture_17.py` trace, Wed May 27, Percy Liang)** is the capstone synthesis listed on the schedule as "Alignment - multimodality" but executed as **"Lecture 17: multimodal models"** — a deliberate framing: after Lectures 15-16 solved single-modality post-training (SFT/RLHF/RLVR), the frontier demands **omni models** that input and output *any combination* of modalities. Percy traces the arc from the text→text world (`text ⇒ text`) through the central engineering constraint — *Transformers speak tokens, so everything must become tokens* — to seven canonical encodings: contrastive image encoders (**CLIP**, **SigLIP**) → projector-injected VLMs (**LLaVA**, **LLaVA-OneVision**, **Qwen-VL / Qwen2-VL / Qwen3-VL**) → fully unified early-fusion autoregression (**Chameleon**). The lecture operationalizes alignment *through* multimodality: comprehension vs generation demand different fidelities (semantic vs pixel), training stability requires balancing text against low-information-density image/video tokens, and the concluding recipe favors **continuous encoders + Transformer + diffusion** over pure discretization.

## Key Takeaways
1. **Omni-model framing and token imperative.** Ultimate goal: model handling arbitrary interleavings (e.g., interleaved image-text document in, mixed document out) for both understanding and generation. All roads go through Transformers → so modalities must be mapped to tokens (discrete integral IDs or continuous embeddings), generalizing the BPE challenge from Lecture 01 to vision/audio/video. Two questions organize the lecture: (1) how to *input* non-text (understand images), (2) how to *output* non-text (generate images/audio).
2. **CLIP (Radford et al. 2021, ViT-L/14@336px, 400M pairs) as semantic image tokenizer.** Method: 32K batch, encode image + text, symmetric contrastive (image→text + text→image) vs batched negatives; Viz via `clip.png` + `clip-code.png`. Data: 500K queries × ~20K pairs (no public release; reproduced as OpenCLIP on LAION-5B). Processing: bicubic resize shortest side →336, center-crop to 336². Encoders: ResNet vs ViT (winner ViT-L/14) + attention pooling (query = GAP), text = 63M GPT-2 (BOS..EOS, readout EOS). Result: zero-shot ImageNet beats supervised ResNet-50 on 1.2M; ablation shows contrastive ranking >> direct caption prediction for efficiency. Limitation: semantics only, coarse-grained; requires large-batch softmax.
3. **SigLIP (Zhai et al. 2023) fixes CLIP's batch coupling.** Switches multiclass softmax to *binary* sigmoid per pair: `(text,image) aligned?` (`siglip-code.png`). Data: billion-scale WebLI (scrape + OCR, keep 10% high-quality, 100 languages). Compute: CLIP 10d/256 TPUv3 → SigLIP 5d/32 TPUv4; decoupled loss from batch → efficient <16K, scales to 1M but 32K enough. Parallelism figure shows sharding advantage. Takeaway: same quality at far lower cost / smaller batch requirement — now default encoder downstream.
4. **LLaVA (Liu et al. 2023) — minimal VLM template.** Vision=CLIP ViT-L/14, LM=Vicuna (LLaMA→ShareGPT), connector = single linear `W` (Flamingo's resampler / Q-Former are heavier alternatives). Data synthesis: COCO boxes/captions → GPT-4 prompts (captions or detected objects) → 158K QAs/conversations, paired with images. Training: Stage 1 alignment (freeze vision+LM, train `W` only), Stage 2 finetune (`W`+LM). Diagram + example show recipe's simplicity — most innovation is *data* synthesis, not architecture.
5. **LLaVA-OneVision (Li et al. 2024, after 1.5/Next) → resolution + multi-image/video handling.** Encoder SigLIP (grid features before+after last layer), LM Qwen-2 72B, projector 2-layer MLP. AnyRes (from LLaVA-1.5): to preserve OCR detail, split high-res image into `a×b` tiles matching encoder resolution, encode tiles+concatenate; if context overflow → bilinear downsample. Length balancing: single image → high-res, multi-image → base-res each, video → low-res per frame, so all modalities ≈ same token budget. Data philosophy *quality > quantity* (two figures), training *easy→hard* curriculum; striking transfer: diagram/charts single-image → multi-image; single-image OCR + multi-image relational → GUI agents; circled visual prompts → video. Open-weights+data.
6. **Qwen-VL family as scaling laboratory across three generations.**
   - *Qwen-VL (2023)*: OpenCLIP ViT-bigG/14, 1-layer cross-attention adaptor (2D-PE) compressing to 256 tokens, special `<img>/<box>/<ref>` tokens; 3-stage: (1) large low-quality freeze-LM train vision+adaptor, (2) high-quality ↑resolution train all, (3) instruction freeze-vision train adaptor+LM.
   - *Qwen2-VL (2024)*: 675M ViT, dynamic resolution — each 224² patch via ViT/14 → 2×2 merge → 66 tokens, video 2fps max 16K tokens, **MRoPE** (multimodal RoPE interleaving t/w/h dims), init from Qwen2 + DFN vision `[2309.17425]`; same 3-stage pattern; capabilities collage (OCR, grounding, video).
   - *Qwen3-VL (2025-11, arXiv 2511.21631)*: Qwen-3 dense/MoE to 235B-A22B, 256K context; SigLIP-2 encoder + interleaved MRoPE `[t w h t w h ...]` vs blocked, explicit video timestamps as tokens, square-root-norm per-token loss to prevent long video domination, **DeepStack** cross-layer visual fusion (inject at multiple layers), 4-stage pre (adapter then 8K→32K→256K all-param) + post (long-CoT SFT, distillation, RL). SOTA claims; training details sparse, but architectural deltas (frequency interleaving, timestamp tokens, loss norm) are highlighted as potentially important.
7. **Chameleon (Meta 2024, arXiv 2405.09818) — unified discrete token omni.** Diagnosis: prior VLMs *understand* but cannot *generate* images (need diffusion head). Chameleon maps *everything* to discrete tokens (512² image → VQ-VAE 1024 tokens, codebook 8192, new BPE) for pure autoregression — interleaved `<BOI> image <EOI>` example shows uniform generation/understanding. Training: Stage 1 80% unsupervised (2.9T text + 1.5T text/image + 400B interleaved), Stage 2 20% half replay + half high-quality mixture. **Stability insight**: text low-entropy vs image high-entropy → norm growth + logit drift; fixes QK-Norm + z-loss (linking to Lectures 03-04 stability themes). Trade: elegant but lossy — discretization hurts OCR / fine detail vs continuous + diffusion. Lecture's closing summary endorses *continuous encoders + Transformer + diffusion* as generation path.
8. **Schedule vs content alignment note.** Course schedule lists L17 as "Alignment - multimodality" (Percy). Trace contains no separate "alignment" section beyond multimodal safety implications (the summary's balancing / high-quality mixture hints at safety SFT). Prior lectures 15-16 already formalized alignment (SFT/RLHF/RLVR); L17 frames alignment as emerging frontier of *mixed-modal* alignment (not re-derived). Treat L17 as multimodal capstone that completes the pretraining→post-training→multimodal progression toward Assignment 5 context.

## Detailed Notes

### Framing (Percy's opener)
- `text ⇒ text` world is subset of `multimodal world` figure (`multimodality.png`).
- Omni desiderata: any→any modality mapping, unified model, not pipeline ensemble.
- Constraint: Transformers work → must tokenize. Text tokenization (BPE, Lecture 01/03) was warm-up; vision is harder due to 2D spatiality, variable resolution, dense information.
- Questions explicitly enumerated; organization follows: CLIP/SigLIP (encoding), LLaVA family + Qwen family (injection), Chameleon (omni).
- Closing summary distilled to five bullets; final bullet ("Continuous encoders + Transformer + diffusion models for generation") is forward-looking prescription beyond Chameleon's discretization.

### CLIP Deep-Dive (`clip()`)
- Pre-CLIP CV paradigm: annotated ImageNet → small supervised datasets. Question: exploit O(100M) noisy `(image,caption)`?
- Contrastive batch construction detail (32768 example) plus bidirectional preference; code figure (`clip-code.png`) shows `logit_scale`, `image_features @ text_features.T`.
- Data scale 400M, query-based collection (500K × 20K), no release → OpenCLIP reproducibility via LAION-5B (CLIP-filtered, circular).
- Processing link to `clip/clip.py#L79`; resize/crop recipe exact.
- ViT figure (`vit.png`): patchify 14×14, linear proj, Transformer; attention pooling variant documented.
- Text encoder choice: shallow GPT-2, EOS pooling (contrast to BERT CLS).
- Headline bar: ImageNet zero-shot > supervised legend; efficiency bar chart shows ranking >> captioning at equal FLOPs (caption loss wastes compute on rare words).

### SigLIP Deep-Dive (`siglip()`)
- Motivation: CLIP softmax couples examples — loss needs all-reduce across devices; SigLIP per-pair BCE decouples.
- WebLI details: O(B) pairs, OCR text extraction, 10% keep, multilingual breadth (supports 100 langs → later Qwen multilingual).
- Efficiency claim contextualized: not just smaller batch but *architectural* parallelism win (figure `siglip-parallelism.png` shows device mesh sharding).
- Batch ablation: 1M batch not needed; 32K plateau.

### LLaVA (`llava()`)
- Data gen pipeline figure (`llava-gen.png`): COCO image → captions/boxes → GPT-4 → (Q,A,Conv) → image-paired instruction.
- Architecture figure (`llava-architecture.png`): vision tokens → W → concatenated with text embeddings → Vicuna.
- Two-stage curriculum figure; example figure shows conversation.

### LLaVA-OneVision (`llava_onevision()`)
- Version lineage clarified (1.5→Next→OneVision) — continuity note.
- Vision features ablation: grid before+after last layer (earlier layers more spatial, later more semantic).
- AnyRes figure pair: tiling + concat vs naive resize information loss; overflow handling via interpolation.
- Modality-length harmonization figure (`modalities.png`): visual token count made uniform to balance compute — prefigures Qwen2/3 video subsampling trade.
- Data figures (2 panels) show deduplicated, synthesized task-specific slices; training figure shows stage ordering.
- Transfer panel trio: S1 diagram, S2 relational, S8 visual prompting — demonstrates compositional generalization claim.

### Qwen-VL Series
- Adaptor detail: cross-attention with 2D PE → fixed 256 (Qwen-VL) vs token-preserving merge (Qwen2-VL 2×2) — compression strategy evolution.
- Stage diagrams (`qwen-vl-stages.png`, `stage1/2.png`) emphasize frozen vs unfrozen components as function of data quality.
- Qwen2-VL MRoPE figure shows 3D RoPE (t,h,w) decomposition; compression 2×2→66 tokens quantified.
- Qwen3-VL specifics: dense/MoE up to 235B-A22B (ties to Lecture 04 MoE / Lecture 11 scaling), 256K context (Lecture 10 inference long-context), interleaved MRoPE pattern explicitly contrasted `[t w h ...]` vs `[t t ... w w ...]`, timestamp tokens vs positional encoding trade, sqrt per-token loss formula, DeepStack figure; pretraining stage fig + results fig; "lots of data work, but not many details" disclaimer in trace.

### Chameleon (`chameleon()`)
- Contrast paragraph: VLM vs omni — VLM needs external diffusion, omni is token-native.
- Diagrams: `chameleon.png` architecture, `chameleon-example.png` interleaving.
- VQ-VAE primer: `vq-vae.png`, codebook quantization, commitment loss, reconstruction; BPE tokenizer retrained over mixed vocab.
- Training mixture precise: 2.9T/1.5T/400B split (relates to Lecture 14 mixing / Lecture 09 scaling laws token counts).
- Stability bullet is terse in trace but links to Lecture 03/04 norm discussions: QK-Norm (prevent logit growth), z-loss (`log Z` regularization).
- Summary acknowledges fidelity-efficiency Pareto: continuous+diffusion advocated.

### Trace Artifacts
- Type: executable `lecture_17.py` (edtrace) via `stanford-cs336/lectures` repo, rendered as trace JSON.
- No PDF fallback; all figures are `images/*.png` references inside trace.
- Raw preserved at [https://cs336.stanford.edu/lectures/?trace=lecture_17](https://cs336.stanford.edu/lectures/?trace=lecture_17).

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 3 of 4 passages in this section could not be located in the stored source ([https://cs336.stanford.edu/lectures/?trace=lecture_17](https://cs336.stanford.edu/lectures/?trace=lecture_17)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "The world is multimodal: Ultimate goal — omni model: Input any combination of modalities (understanding), Output any combination of modalities (generation)." — framing slide

> "Where we are today: Transformers work really well. So we gotta use them. Transformers speak tokens (discrete or continuous)..." — token imperative

> "Chameleon: map everything into discrete tokens — Advantage: can analyze and generate images in a uniform way." — omni elegance statement

> "Comprehension and generation might demand different things (semantics versus finer-grained details) — Balance images + video (lower information density) and text for training stability — Continuous encoders + Transformer + diffusion models for generation" — closing summary

## Concepts Introduced or Referenced
- [[multimodal-ai]] — Entire lecture is canonical expansion: CLIP/SigLIP encoders, LLaVA/Qwen projector VLM ladder, Chameleon omni early-fusion, AnyRes/MRoPE/DeepStack innovations, stability.
- [[image-generation]] — Generation side distinction: VLM understanding vs Chameleon discrete generation vs advocated continuous+diffusion.
- [[alignment]] — Schedule framing "Alignment - multimodality" — alignment as frontier of mixed-modal safety / stability balancing.
- [[evaluation]] — Implicit via zero-shot ImageNet, captioning efficiency, SOTA claims on Qwen3-VL results figure; prior Lecture 12 eval now multimodal.
- [[scaling-laws]] — Token mixture scales (2.9T→400B), ViT scaling (336px→675M), context scaling (256K) as scaling-law instantiation.
- [[pretraining]] / [[ai-ethics]] — Data scaling ethics (400M CLIP, B-WebLI, licensing vs web scrape).

## Critical Assessment
- **Strengths:** Only CS336 source that *serializes* the VLM ladder in one trace: contrastive encoders → projector finetuning → omni autoregression, with concrete numbers (32K batch, 256 vs 66 tokens, 400M/2.9T mixtures) and reproducible OpenCLIP/WebLI/LAION anchors enabling replication. Qwen generational deltas (adaptor→MRoPE→interleaved MRoPE/DeepStack) give a compact evolution pattern; AnyRes as resolution-preservation pattern generalizes to lecture 10 long-context. Chameleon's stability note (QK-Norm+z-loss) links back to architecture lectures.
- **Weaknesses:** Schedule "Alignment" component is nominal — no dedicated alignment/RLHF-for-multimodal section (e.g., no DPO on vision, no mixed-modal preference data, no T2I safety eval). Figures are image-only in trace (must view `?trace=lecture_17` to see architecture grids); quantitative results sparse beyond CLIP zero-shot bar and Qwen3-VL figure (requires reading PNG). Chameleon vs continuous+diffusion advocated but not ablated with FID/OCR metrics in trace.
- **Relation to wiki:** Core source for [[multimodal-ai]] (complement to CS224n Week 9 conceptual Chameleon/Transfusion/MoT — this trace supplies CLIP/LLaVA/Qwen pedagogical ladder); enriches [[alignment]] with multimodal frontier and [[ai-ethics]] via WebLI/LAION data-sourcing ethics and safety SFT extension point; completes post-training arc alongside [[source-cs336-lecture15-sft-rlhf]] + [[source-cs336-lecture16-rlvr]] toward Assignment 5.

---

**Source:** CS336 Lecture 17 — Multimodal Models (Percy Liang, Wed May 27) — Alignment · Multimodality by Percy Liang (Stanford CS336, Spring 2026) — <https://cs336.stanford.edu/lectures/?trace=lecture_17>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
