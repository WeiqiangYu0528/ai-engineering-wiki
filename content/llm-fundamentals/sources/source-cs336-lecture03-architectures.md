---
type: source-summary
title: CS336 Lecture 03 — Architectures, Hyperparameters
summary: Lecture 03 (67-page PDF, Tatsu Hashimoto) exhaustively surveys what 19+ dense LMs from 2024–2025 actually share vs what varies, giving the "experience of others" complement to hands-on architecture implementation.
status: verified
visibility: public
author: "Tatsu Hashimoto"
source-type: article
url: "https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_03.pdf"
date-published: 2026-04-06
date-ingested: 2026-08-26
tags:
  - llm-fundamentals
  - mlops
key-concepts:
  - "[[transformer]]"
  - "[[positional-encoding]]"
  - "[[self-attention]]"
  - "[[scaling-laws]]"
key-entities:
  - "[[stanford-university]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-cs336-lecture03-architectures
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Lecture 03 (67-page PDF, Tatsu Hashimoto) exhaustively surveys what 19+ dense LMs from 2024–2025 actually share vs what varies, giving the "experience of others" complement to hands-on architecture implementation.</p>
<p class="kb-provenance">Tatsu Hashimoto, 2026-04-06. <a href="https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_03.pdf">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
Lecture 03 (67-page PDF, Tatsu Hashimoto) exhaustively surveys **what 19+ dense LMs from 2024–2025 actually share vs what varies**, giving the "experience of others" complement to hands-on architecture implementation. It starts from the original Transformer (sinusoidal positions, ReLU FFN, post-norm LayerNorm) → the modern *LLaMA-like* blueprint you implement (pre-norm, [[positional-encoding]] RoPE, SwiGLU, no biases), then dissects each axis: **norm** (pre vs post, LayerNorm vs RMSNorm, double/non-residual post-norm), **activations** (ReLU/GeLU → GeGLU/SwiGLU, 2/3 $d_{ff}$ rule), **serial vs parallel blocks**, **MoE vs dense shape**, and the hyperparameters that matter ( $d_{model}$, depth, heads, $d_{ff}$, vocab ). Recurring thesis: *FLOPs ≠ runtime* — RMSNorm's win is data movement, not FLOP count. Saved to [https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_03.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_03.pdf) with extracted text in [https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_03.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_03.pdf).

## Key Takeaways
1. **The modern consensus is pre-norm, non-residual, bias-free.** Almost all 2024 frontier dense models use **pre-norm** (LayerNorm outside residual stream, $\text{x + Sublayer(LN(x))}$) for gradient stability and larger LR, not just warmup removal (Xiong 2020, Salazar & Nguyen); recent Gemma 2 / Grok / OlMo 2 add a *non-residual double post-norm* outside the stream. RMSNorm (no mean subtraction, no bias) wins on wall-clock/memory movement, not FLOPs — matrix multiplies dominate FLOPs, so FLOP-to-byte ratios matter more.
2. **Gated activations are consistently better, with a shape correction.** ReLU → GeLU → GeGLU/SwiGLU ($FFN = (xW_1 * \sigma(xV))W_2$, Swish = $x \cdot \text{sigmoid}(x)$) shows fairly consistent gains across Shazeer 2020, Narang et al. 2020 ablations; gate introduces extra matrix $V$, so **$d_{ff}$ is scaled by 2/3** to hold parameter count constant. Outliers like Nemotron-340B Square-ReLU exist but are rare; post-2023 norm is SwiGLU/GeGLU.
3. **Serial vs parallel blocks trade expressivity for depth.** Standard serial = attention then MLP; parallel = attention and MLP on same input, summed — shallower effective depth but larger width, popular in some MoE/throughput-oriented models.
4. **Architecture hyperparameter landscape is dominated by LLaMA-like choices with minor tweaks.** Variations cluster around: hidden $d_{model}$, $n_{layers}$, $n_{heads}$ (do they sum to $d_{model}$?), $d_{ff}$, vocab 30K–250K, and whether to share embeddings — most models vary only slightly around the same backbone.
5. **Stability tricks are part of architecture.** QK-Norm, careful init (muP), and norm placement are presented as co-designed with scaling — the "best way to learn is hands-on, second best is learn from others' experience" framing.

## Detailed Notes

### Recap — original vs modern
- **Original (2017):** sinusoidal PE, ReLU FFN, post-norm LayerNorm with bias terms.
- **Modern (Assignment 1):** pre-norm, RoPE, SwiGLU, no biases anywhere (linear + norm). Motivation for each change previewed and expanded per section.

### Norm section (largest allocation)
- **Pre vs post:** Figure from Xiong 2020 — post-norm attenuates gradients, causes spikes; pre-norm keeps residual stream clean (gradient flows unscaled). Empirical: pre-norm removes warmup requirement, enables stable large LR at depth. Grok/Gemma 2/OlMo 2 exception: *non-residual double post-norm* (norm outside stream) — gets stability without residual attenuation.
- **LayerNorm vs RMSNorm:** LN: $y = (x-\mu)/\sqrt{\sigma^2+ε}·γ+β$; RMSNorm: $y = x / \text{RMS}(x) · γ$ (no mean, no bias). Famous adopters: GPT-2/OPT/BLOOM = LN; LLaMA/PaLM/Chinchilla/T5 = RMSNorm. Ivanov et al. 2023: matmuls are ~99% of FLOPs, so FLOP savings (left "43G") is small; but FLOP-to-memory ratio (right "153") and wall-clock favor RMSNorm because fewer bytes moved. Lesson: **FLOPs ≠ runtime** (foreground for Lecture 05 roofline).
- **Validation:** Narang et al. 2020 runtime + surprising perplexity gains; broader pattern: drop biases in linear + norm saves memory for marginal parameter cost.
- Synthesis bullet: pre, non-residual, RMSNorm, no bias = default modern recipe.

### Activations & FFN
- Zoo: ReLU, GeLU ($xΦ(x)$), GLU family: $FFN_{ReGLU}= (\max(0,xW_1)⊗xV)W_2$, GeGLU, SwiGLU. Shazeer 2020 + Narang corroboration: gated variants fairly consistently win; many models post-2023 are SwiGLU (LLaMA-1/2/3, PaLM, Mistral, OlMo) vs T5 v1.1/mT5/LaMDA/Gemma 2-4 = GeGLU. No gated = still works (GPT-3), but rare.

### Serial vs parallel, depth vs width
- Serial: sequential dependence; parallel: fused attention+MLP — relevant to KV-cache sharing and MoE routing decisions (covered more in Lecture 04).

### What to take away for Assignment 1
- Choices you code (pre-norm, RoPE, SwiGLU, no bias) are not arbitrary — they are the *experienced* Pareto frontier for stability + throughput, often discovered via wall-clock ablations rather than FLOP counts.

## Notable Quotes
> "The best way to learn is hands-on experience; the second best is to try to learn from others' experience." — Lecture 03 theme slide

> "FLOPS are not runtime! RMSNorm can still matter due to the importance of data movement." — Иванов et al. 2023 framing

## Concepts Introduced or Referenced
- [[transformer]] — Post-norm→pre-norm→double post-norm evolution; RMSNorm vs LayerNorm; bias-free convention.
- [[positional-encoding]] — Sinusoidal → RoPE (deferred full treatment but motivated as modern choice).
- [[self-attention]] — Full vs sparse/local vs GQA/MLA context for architecture variants.
- [[scaling-laws]] — muP, Xavier, WSD/cosine schedules as co-designed stability ingredients; shape hyperparameters tie to $N$ in $C=6ND$.

## Critical Assessment
- **Strength:** Data-driven — 19+ models tabulated, not anecdotal; correctly reframes architecture debate from FLOP-purity to **data-movement and stability** (bridge to Lectures 02/05).
- **Fills wiki gap:** Existing [[transformer]] page details sinusoidal→RoPE theory but not the *empirical sociology* (why everyone converged on pre-RMSNorm/SwiGLU/bias-free) or the double post-norm revival; this lecture supplies that systems-grounded sociology.
- **Limitation:** Slide deck compresses ablations (Narang, Shazeer) without per-task variance; MoE/attention-variant architecture choices deferred to Lecture 04, GPU implications to Lecture 05.
- **Actionable:** Gives Assignment 1 implementers a prior over what *not* to tune (norm position) vs what *does* move needle (gated activations with 2/3 $d_{ff}$).

---

**Source:** CS336 Lecture 03 — Architectures, Hyperparameters by Tatsu Hashimoto — <https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_03.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
