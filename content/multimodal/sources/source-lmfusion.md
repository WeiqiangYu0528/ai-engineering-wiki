---
type: source-summary
title: "LMFusion: Adapting Pretrained Language Models for Multimodal Generation"
summary: LMFusion (arXiv 2412.15188v4, Feb 2025; CS224n Week 9 optional reading) flips the Week-9 question from "how to pretrain a mixed-modal model from scratch" to "how to adapt an existing text-only LLM (Llama-3 8B) into a…
status: draft
visibility: public
author: "Weijia Shi, Xiaochuang Han, Chunting Zhou, Weixin Liang, Xi Victoria Lin, Luke Zettlemoyer, Lili Yu (UW/Stanford/FAIR Meta)"
source-type: paper
url: "https://arxiv.org/abs/2412.15188"
date-published: 2024-12-19
date-ingested: 2026-08-25
tags:
  - multimodal
  - llm-fundamentals
  - inference
key-concepts:
  - "[[multimodal-ai]]"
  - "[[image-generation]]"
  - "[[pretraining]]"
key-entities:
  - "[[meta]]"
  - "[[llama-3]]"
aliases:
  - wiki/source-lmfusion
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">LMFusion (arXiv 2412.15188v4, Feb 2025; CS224n Week 9 optional reading) flips the Week-9 question from "how to pretrain a mixed-modal model from scratch" to "how to adapt an existing text-only LLM (Llama-3 8B) into a…</p>
<p class="kb-provenance">Weijia Shi, Xiaochuang Han, Chunting Zhou, Weixin Liang, Xi Victoria Lin, Luke Zettlemoyer, Lili Yu (UW/Stanford/FAIR Meta), 2024-12-19. <a href="https://arxiv.org/abs/2412.15188">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
LMFusion (arXiv 2412.15188v4, Feb 2025; CS224n Week 9 optional reading) flips the Week-9 question from "how to pretrain a mixed-modal model from scratch" to "how to **adapt an existing text-only LLM** (Llama-3 8B) into a text+image generator without destroying its language ability". Built on the [[source-transfusion]] recipe (`L = L_LM + λ·L_DDPM`, VAE latents + U-Net down/up, hybrid causal-text/bidirectional-image attention mask), it adds **parallel modality-specific modules** — separate QKV projections, O projections, FFNs, and folded layer norms for text and image — while keeping one **shared self-attention** across modalities for cross-modal fusion. The decisive move is **freezing all text modules (η_text = 0)** and training only the image modules (η_img = 1e-4, AdamW, cosine decay, 4000-step warmup) on the same 380M Shutterstock pairs as Transfusion (256² images; captions-first 80% of the time). In controlled FLOP-matched comparison vs from-scratch Transfusion, LMFusion gains **+20% image understanding and +3.6% image generation at 50% of the FLOPs**, while preserving Llama-3's text performance (**+11.6% over Transfusion's degraded text**). Ablations show naive dense finetuning causes catastrophic language forgetting and that **deep separation (attention+FFN) > shallow (FFN-only) > none**; LLaVAFusion extends the recipe to give existing VLMs generation ability.

## Key Takeaways
1. **Adaptation beats from-scratch pretraining**: Reusing Llama-3's ~15T-token investment eliminates retraining on text data entirely — image-only training at half the FLOPs yields *better* results than Transfusion trained jointly from scratch. Text capability is not just preserved but superior (+11.6%) because the frozen towers never drift.
2. **Architecture = MoT-style sparsity + Transfusion objective**: Modality-specific QKV/O, FFN, LN process each modality independently; concatenated K/V in shared attention gives cross-modal interaction; BOI token separates modalities; U-Net downsampler projects noisy VAE latents into the transformer and upsampler emits noise predictions (Eqs. 5–14). Image modules are *also initialized from Llama weights*, giving a head start.
3. **Freezing is the alignment mechanism**: Decoupled learning rates per modality group ({Proj, QKV, O, FFN, LM-Head}_text vs {UNet-Down/Up, QKV, O, FFN}_img); η_text = 0 in main config. Ablation: equal LRs improve image metrics but drop HellaSwag ~15%; ratio η_text/η_img = 0.1 narrows the language gap 7%→2% — freezing is the limiting case that fully protects language.
4. **Deep separation is necessary**: Naive dense finetuning (single shared QKV/FFN) → catastrophic forgetting; shallow separation (modality-specific FFNs only) helps but underperforms deep separation (FFN + attention separated). This empirically confirms the modality-competition diagnosis of [[source-mixture-of-transformers]] and extends it from pretraining to finetuning.
5. **Capabilities beyond static benchmarks**: Supports interleaved image editing (condition diffusion on prior image latents in context) and LLaVAFusion — freeze a VLM's transformer, attach a parallel image-specific transformer → adds generation while MMMU/MME-Perception/ChartQA/RealWorldQA understanding stays strong.
6. **Practical numbers**: 380M Shutterstock image-caption pairs (same as Transfusion), 256×256 center-crop; AdamW (β1 0.9, β2 0.95), image LR 1e-4 cosine decay w/ 4000 warmup steps.

## Detailed Notes

### Background: Transfusion (§2)
- LM loss on text tokens (Eq.1); DDPM loss on VAE latents with cosine schedule (Eqs. 2–3); combined `L_LM + λ·L_DDPM` (Eq.4); U-Net down/up around main transformer; hybrid mask (causal text, bidirectional within image).

### Architecture (§3)
- Per-modality input projections (embedding vs UNet-Down), QKV/LN folded per modality (Eqs. 7–8), cross-modal attention via K/V concatenation with separate O per modality (Eqs. 9–10), modality-specific FFN (Eqs. 11–12), outputs split between LM head (text logits) and UNet-Up (noise prediction) (Eqs. 13–14).
- Both module stacks initialized from pretrained Llama-3; only image path updates.

### Experiments (§4–5)
- Controlled comparison: same data/objective as Transfusion, initialized from Llama-3 8B → +20% understanding, +3.6% generation, −50% FLOPs, text +11.6% vs Transfusion.
- Learning-rate decoupling study (Fig.4): η_text/η_img ∈ {0, 0.1, 1} traces a Pareto frontier between image gains and language retention.
- Ablation ladder (§5.1): no separation < shallow < deep separation across both image metrics and language preservation.
- §5.2 image editing; §5.3 LLaVAFusion on MMMU, MME-Perception, ChartQA, RealWorldQA vs unified multimodal baselines incl. Transfusion.

## Notable Quotes
> "By freezing the text-specific modules and only training the image-specific modules, LMFusion preserves the language capabilities of text-only LLMs while developing strong visual understanding and generation abilities."

> "LMFusion improves image understanding by 20% and image generation by 3.6% using only 50% of the FLOPs while maintaining Llama-3's language capabilities."

> "Naive finetuning of dense pretrained LLMs for multimodal generation compromises their original language capabilities."

## Concepts Introduced or Referenced
- [[multimodal-ai]] — Fourth strategy alongside Chameleon (dense discrete), Transfusion (dense hybrid), MoT (sparse pretraining): sparse *adaptation* of an existing LLM; completes the compute-efficiency arc.
- [[image-generation]] — Diffusion-head attachment to a frozen decoder; editing via conditioning on in-context image latents; aesthetic fine-tuning examples (Fig.2).
- [[pretraining]] — Compute-reuse economics: 15T-token text investment amortized; questions when from-scratch mixed-modal pretraining is ever worth it below frontier scale.
- [[inference]] — Data-dependent routing between LM head and diffusion U-Net mirrors Transfusion serving; frozen text tower keeps KV-cache/text latency identical to base LLM.
- [[parameter-efficient-fine-tuning]] — Philosophical neighbor: instead of LoRA adapters on all layers, adds parallel full-size towers for the new modality while freezing old ones.

## Critical Assessment
**Strengths**: Directly answers the practitioner's cheapest-path-to-multimodal question with controlled experiments (same data/FLOPs accounting as Transfusion); ablations isolate each design decision (separation depth, LR decoupling); preserving text is treated as a first-class metric, not an afterthought; LLaVAFusion shows generality beyond text-only bases.

**Weaknesses**: Frozen text tower caps cross-modal co-training — no mechanism for text to *improve* from vision (the synergy regime predicted by [[source-scaling-laws-mixed-modal]] at large scale is deliberately forfeited); evaluation relies on relative percentages vs Transfusion rather than absolute SOTA tables (no GenEval/DALL·E-level comparisons); Shutterstock-only data limits diversity; image quality behind dedicated diffusion models without aesthetic post-training; 8B scale only.

**Contradictions / Synthesis**: Extends [[source-transfusion]] (same objective, new init/freeze strategy) and operationalizes the competition insight of [[source-scaling-laws-mixed-modal]]: if modality competition hurts at small scale, freeze one side. Complements [[source-mixture-of-transformers]] (MoT separates during pretraining; LMFusion separates during adaptation) and [[source-chameleon]] (which needed 9.2T tokens to make joint training pay off). Against [[source-scaling-autoregressive-multimodal]], LMFusion chooses continuous diffusion heads over quantized tokens, consistent with Transfusion's efficiency findings.

## Sources
- https://arxiv.org/abs/2412.15188 (v4, 5 Feb 2025)
- Zhou et al. 2024 Transfusion (arXiv 2408.11039), Dubey et al. 2024 Llama-3, Liang et al. 2024 Mixture-of-Transformers, Yue et al. 2024 MMMU, Fu et al. 2024 MME

---

**Source:** LMFusion: Adapting Pretrained Language Models for Multimodal Generation by Weijia Shi, Xiaochuang Han, Chunting Zhou, Weixin Liang, Xi Victoria Lin, Luke Zettlemoyer, Lili Yu (UW/Stanford/FAIR Meta) — <https://arxiv.org/abs/2412.15188>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
