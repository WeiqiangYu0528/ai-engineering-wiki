---
type: source-summary
title: CS336 Lecture 05 — GPUs, TPUs
summary: "Lecture 05 (55-page PDF, Tatsu) makes CUDA/GPUs non-magic and actionable for LLM systems: Part 1 dissects GPU anatomy (SM/SP, SIMT threads→warps(32)→blocks→grids, memory hierarchy SRAM/shared/L1 ~8× faster than…"
status: draft
visibility: public
author: "Tatsu Hashimoto"
source-type: article
url: "https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_05.pdf"
date-published: 2026-04-13
date-ingested: 2026-08-26
tags:
  - mlops
  - inference
  - llm-fundamentals
key-concepts:
  - "[[inference]]"
  - "[[transformer]]"
  - "[[self-attention]]"
key-entities:
  - "[[stanford-university]]"
aliases:
  - wiki/source-cs336-lecture05-gpus-tpus
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Lecture 05 (55-page PDF, Tatsu) makes CUDA/GPUs non-magic and actionable for LLM systems: Part 1 dissects GPU anatomy (SM/SP, SIMT threads→warps(32)→blocks→grids, memory hierarchy SRAM/shared/L1 ~8× faster than…</p>
<p class="kb-provenance">Tatsu Hashimoto, 2026-04-13. <a href="https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_05.pdf">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Lecture 05 (55-page PDF, Tatsu) makes **CUDA/GPUs non-magic** and actionable for LLM systems: Part 1 dissects GPU anatomy (SM/SP, SIMT threads→warps(32)→blocks→grids, memory hierarchy SRAM/shared/L1 ~8× faster than DRAM/HBM, registers), Part 2 formalizes **when GPUs get slow** via the roofline model (compute vs bandwidth, low-precision, control divergence, coalescing/tiling) and why **FLOPs ≠ runtime**, and Part 3 unpacks **FlashAttention** as a case study in fusion + tiling + recomputation. A closing thread compares **TPUs** (fewer TCs vs GPU SMs, same matmul throughput, no warps, different networking). Underlying thesis from Kaplan scaling: *parallel GPU scaling (>1000× in 10 years) is why LLMs scale* after Dennard scaling ended. Saved to [https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_05.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_05.pdf) with text in [https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_05.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_05.pdf).

## Key Takeaways
1. **GPU = throughput engine, CPU = latency engine.** GPUs trade branch/cache/control for many tiny ALUs (SPs within SMs); many lightweight threads can be parked/switched to hide latency. Rule of 32: threads execute in **warps** of 32 — every thread in a warp executes the *same* instruction (SIMT) with different data; divergence serializes.
2. **Memory hierarchy dictates performance, not peak FLOPs.** SRAM/shared (on SM) ≈100× more expensive area but ~8× faster than global DRAM/HBM; L1→L2→HBM staircase; cross-block communication must go via slow global memory. Compute (esp matmuls via Tensor Cores, introduced V100, >10× faster than generic flops) has scaled faster than bandwidth — the **memory wall** (HBM 3 TB/s vs ~1 PFLOP/s on H100/B200) makes LLMs memory-bound during decode and for many elementwise ops.
3. **Roofline / arithmetic intensity is the diagnostic.** Intensity = FLOPs / bytes moved. B200: 2.25 PFLOP/s bf16, 8 TB/s → knee at ~281 FLOPs/byte. Matmuls are compute-bound (hundreds of FLOPs/byte); ReLU/GELU/bias/norm (1 read+1 write per element → 4–8 bytes/FLOP) are memory-bound. Lower precision (fp16/bf16 → fp8/mxfp8) halves bytes → doubles intensity, and Tensor Cores accelerate matmuls — but MXFP8 introduces per-32 scales (E4M3 + E8M0 scales) and non-trivial transposes.
4. **Six concrete GPU-sprint techniques.** (1) Avoid control divergence, (2) low/mixed precision (fp16/bf16, fp8, Blackwell MXFP8), (3) operator fusion (matmul+activation: HBM→compute A+B →HBM vs 2× round trips), (4) recomputation / activation checkpointing (Lecture 02), (5) coalesced memory accesses (contiguous warp loads), (6) tiling — the FlashAttention strategy.
5. **FlashAttention = tiling + fusion + careful SRAM use.** Reorganizes $QK^T$ softmax $V$ to stay in SRAM tiles, avoiding $O(N^2)$ HBM materialization; trades recomputation for reduced data movement — the canonical example of beating the memory wall without changing FLOPs.
6. **TPUs as same core, different wrapper.** Both GPUs/TPUs = lightweight control + big matmul + fast memory. Difference: GPU has many SMs → warp/SIMT model; TPU has fewer Tensor Cores (no warps, just blocks), similar matmul throughput, but distinct inter-chip networking that matters for parallelism lecture.

## Detailed Notes

### Part 1 — GPUs in depth (anatomy & execution)
- **Schedule context:** L01 tokenization → L02 resource accounting → L03-04 architecture/MoE → now hardware that executes them; L06+ parallelism.
- **Historical frame:** Dennard scaling (1980–2000s) tapped out; scaling now via parallelism (Bill Dally HotChips: GPU parallelism >1000× in decade); no LLM scaling without GPU scaling.
- **CPU vs GPU cartoon (NVIDIA blog):** CPUs: few fast threads, big caches/branch predictors → low latency; GPUs: many tiny threads, minimal control → high throughput.
- **Execution units:** GPU → many **SMs** (Streaming Multiprocessors) executing **blocks** independently; each SM → many **SPs** executing **threads**; **warp = 32** threads lockstep.
- **Memory model:** thread → registers; block → shared memory / L1 (on SM, fast); chip → L2; board → global HBM (slow). Cost: SRAM 100× area-expensive, 8× faster. `thonking.ai/what-shapes-do-matrix-multiplications` teaser slide for tiled matmul shapes.
- **Tensor Cores:** V/T onwards, matmuls >10× faster than generic FMAs — why MLP/attention projections are fast; other ops not accelerated.
- **TPU thread:** high-level same (light control + matmul + fast memory), but no warps (tradeoff: simpler matmul-heavy vs flexible non-matmul), TPU has fewer TCs than GPU SMs at similar aggregate FLOPs; networking differences deferred to parallelism; refs: `jax-ml.github.io/scaling-book/gpus`, Horace He blog, CUDA Mode.

### Part 2 — Understanding performance
- **Failure mode even for "simple" square matmul:** performance varies with shape, occupancy, divergence.
- **Roofline intuition:** time = max(compute_time= FLOPs/peak, memory_time= bytes/bandwidth); knee at intensity = peak/bandwidth.
- **Control divergence:** warp divergence serializes branches — same FLOP count, very different runtime (not a bandwidth effect).
- **Low precision:**
  - ReLU example $n$-vector: fp32 4 B/read + 4 B/write + 1 FLOP → 8 B/FLOP; fp16 → 4 B/FLOP (intensity doubles).
  - Mixed precision via Tensor Cores (NVIDIA tutorial): matmul path accelerated; modern frontier: **FP8** variants, **MXFP8 (Blackwell)** — E4M3 mantissa, per-32 FP8 E8M0 scales, transpose non-trivial vs standard bf16.
  - Frontiers & training practice slides note scaling-factor handling and throughput implications.
- **Operator fusion:** naive HBM→A→HBM→B→HBM vs fused HBM→A+B→HBM — halves HBM traffic for elementwise chains (e.g., RMSNorm + SwiGLU fused in kernels lecture). Assigns to Triton/CUTLASS/ThunderKittens for custom kernels.
- **Coalescing/tiling/occupancy/bank conflicts/bulk-async copies:** listed as vocabulary that performance profiling (nsight) reveals; detailed case study is FlashAttention.
- **Recap mantra:** massively parallel SIMT, compute (esp matmul) scaled faster than memory, must respect hierarchy.

### Part 3 — Putting it together: FlashAttention (Dao et al.)
- **Problem it solves:** naive $QK^T$ ( $N×N$ ) materializes in HBM → memory-bound and $O(N^2)$ traffic; FlashAttention tiles $Q,K,V$ into SRAM-sized blocks, computes softmax on the fly with online rescaling, avoids full $N^2$ write.
- **Techniques combined:** tiling (block partition), fusion (QKᵀ + softmax + V in one kernel), recomputation (recompute tiles on backward rather than store), coalescing, shared-memory occupancy tuning.
- **Connection to Lecture 02:** recomputation = activation checkpointing philosophy at kernel level.

### Acknowledged sources
- Horace He, CUDA Mode, `nichijou.co`, `jonathan-hui.medium`, TPU book (`thonking.ai`), Dao FlashAttention.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 3 passages in this section could not be located in the stored source ([https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_05.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_05.pdf)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "GPUs optimize for throughput (total processed data); CPUs optimize for latency (each thread finishes quickly)." — Lecture 05 anatomy slide

> "Compute scaling is faster than memory scaling — FLOPs scale faster than memory, it's hard to keep our compute units fed with data!" — Memory wall slide (medium.com/riselab)

> "Often times, compute leads to predictable performance gains for language models. Faster hardware, better utilization, improved parallelization alone can drive progress (for now...)." — Kaplan scaling framing

## Concepts Introduced or Referenced
- [[inference]] — Roofline explains prefill (compute-bound, matmuls) vs decode (memory-bound, KV-cache) — FlashAttention directly accelerates long-context prefill/inference.
- [[transformer]] — Hardware-aware view of blocks (norm+attention+MLP) and why certain architectural choices (RMSNorm, SwiGLU, GQA) are wall-clock driven.
- [[self-attention]] — $O(N^2)$ memory traffic target for FlashAttention tiling.
- [[pretraining]] — Throughput determinines $C=6ND$ wall-clock and MFU; parallelism lecture builds on SM/block/warp model.

## Critical Assessment
- **Strength:** Demystifies GPU via SIMT + memory-hierarchy ladder + roofline + FlashAttention — connects Lecture 02's abstract intensity to concrete GPU counters (shared vs global, warp, tensor core) and to Lecture 03's RMSNorm wall-clock argument.
- **Wiki complement:** Existing [[inference]] page covers KV-cache and prefill/decode, and [[scaling-laws]] covers compute, but neither grounds *why* decode is bandwidth-bound at the HBM→SM level — this lecture supplies that hardware substrate and the six optimization levers.
- **Limitation:** Slide deck is conceptual; quantitative roofline numbers mix H100 (979 TFLOP/s, 3.35 TB/s) and B200 (2.25 PFLOP/s, 8 TB/s) generational specs without side-by-side table; Blackwell MXFP8 details truncated — deferred to kernel/parallelism deep dives.
- **Bridge to assignment:** Directly motivates Assignment 2 systems tasks (fused RMSNorm Triton kernel, Triton tiling/coalescing, profiling with nsight) — the "make fast algorithms" thesis.

---

**Source:** CS336 Lecture 05 — GPUs, TPUs by Tatsu Hashimoto — <https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_05.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
