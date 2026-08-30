---
type: source-summary
title: CS336 Lecture 06 — Kernels, Triton
summary: Stanford CS336 Lecture 06 (Percy Liang, April 15 2026) is the single-GPU systems lecture.
status: draft
visibility: public
author: "Percy Liang (Stanford CS336)"
source-type: article
url: "https://cs336.stanford.edu/lectures/?trace=lecture_06"
date-published: 2026-04-15
date-ingested: 2026-08-26
tags:
  - inference
  - mlops
  - llm-fundamentals
key-concepts:
  - "[[triton]]"
  - "[[inference]]"
  - "[[parallelism]]"
  - "[[transformer]]"
key-entities:
  - "[[stanford-university]]"
aliases:
  - wiki/source-cs336-lecture06-kernels-triton
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Stanford CS336 Lecture 06 (Percy Liang, April 15 2026) is the single-GPU systems lecture.</p>
<p class="kb-provenance">Percy Liang (Stanford CS336), 2026-04-15. <a href="https://cs336.stanford.edu/lectures/?trace=lecture_06">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

Stanford CS336 Lecture 06 (Percy Liang, April 15 2026) is the **single-GPU systems** lecture. After Lecture 05's GPU overview, it makes performance actionable via *benchmarking/profiling* and *custom Triton kernels*. Delivered as an `edtrace` Python trace (`lecture_06.py`, 744 lines), it pairs explainer text with live PyTorch/Triton execution. Covers A100/H100/B200 hardware hierarchy, CTA programming model (grid→block→thread), warp/bank-conflict/coalescing/occupancy pitfalls, a GeLU fusion case study (`naive_gelu` vs `F.gelu` vs `torch.compile` generating Triton), CUDA-vs-Triton philosophy (per-thread vs per-block), and four Triton patterns (elementwise GeLU, fused softmax with row=block, tiled row-sum, and tiled + fused matmul+ReLU with `tl.dot`). Mantra: *programming model for correctness, hardware for performance, benchmark+profile before/after every change*.

## Key Takeaways

1. **Hierarchy is the bottleneck**: Registers (~400 TB/s on H100) → L1/shared (~33 TB/s) → L2 (~12 TB/s) → HBM (2–8 TB/s). All optimizations are about reducing HBM traffic via shared-memory tiling and fusion. B200 specs: 148 SMs, 256 KB registers/SM, 192 KB–256 KB shared, 80–192 GB HBM.
2. **Programming model → hardware mapping**: Thread (one element), CTA/block (shared memory, one SM), grid (HBM). Triton abstracts to *block* level (`tl.arange`, `tl.load/mask`, `BLOCK_SIZE: tl.constexpr`), implicitly handling shared memory — less control than CUDA but sufficient and Pythonic.
3. **Four hardware traps measured**: Warp lockstep divergence (32 threads serialized), occupancy vs registers (128 threads×160 regs → ~19% occupancy), bank conflicts (32 banks×4 B → column access =32-way conflict, fix via swizzling), memory coalescing (warp →128 B transaction), wave quantization (160 blocks on 148 SMs → idle wave).
4. **GeLU fusion case study**: Naive tanh-GeLU issues many kernels (HBM read/write per op); builtin and `torch.compile(naive_gelu)` each become **one fused Triton kernel** (`ld.global`/`st.global` + thread coarsening 8 elem/thread in PTX). Benchmark at 16384² shows fused >> naive; profiler proves kernel count drop.
5. **Triton kernel taxonomy**:
   - *Elementwise* (GeLU): `cdiv(N, BLOCK_SIZE)` grid, pointer `x_ptr + pid*BLOCK + arange`, masked load/store.
   - *Reduction — row fits* (softmax): one block per row, `BLOCK=next_pow2(N)`, `max`→`exp`→`sum`→`norm` all inside block via `tl.max/tl.sum`.
   - *Reduction — row tiled* (row-sum): loop `for start in 0..N step BLOCK` with per-thread `acc[BLOCK]` then `tl.sum(acc)`.
   - *Matmul+fusion*: output-tiled `BLOCK_M=64, N=64, K=32`, grid `cdiv(M/BLOCK_M)×cdiv(N/BLOCK_N)`, `tl.dot` on `[BM,BK]×[BK,BN]` tiles, pointer advance `+=BLOCK_K*stride`, inplace `tl.maximum(acc,0)` fuses ReLU before `tl.store`. Arithmetic intensity `O(tile_size)`.

## Detailed Notes

- **Hardware table** (A100→H100→B200) and TMEM note (tensor memory between regs/shared, hidden) — see [https://cs336.stanford.edu/lectures/?trace=lecture_06](https://cs336.stanford.edu/lectures/?trace=lecture_06) for verbatim table.
- **Benchmark harness**: `benchmark(run, warmups=1, trials=3)` uses `torch.cuda.Event` + `synchronize()`; matmul scaling `O(1)` small then `O(N³)`. Profiling via `torch.profiler` (ProfilerActivity) distinguishes compute vs memory bound.
- **Triton vs CUDA**: CUDA per-thread `threadIdx.x` + explicit `__shared__`; Triton per-block `tl.program_id(0)` + `tl.arange` + auto shared-mem. Trade: CUDA finer control, Triton faster to write and tensor-core friendly (`tl.dot`).
- **Softmax numerics**: `x - max(x)` before `exp` to avoid overflow; `other=float("-inf")` mask for padded cols.
- **Stride math**: `index = row*stride_row + col*stride_col`; 2D pointers `indices_m[:,None]*stride_am + indices_k[None,:]*stride_ak`.
- **PTX inspection**: `kernel.asm["ptx"]` dumped to `var/triton_gelu-ptx.txt`; `%ctaid.x` = block id, `%tid.x` = thread, `%f*`/`%r*` regs; observation confirms coarsening.
- **Tracer details**: `lecture_util.get_local_url`, `gpu_util.cuda_if_available`, `edtrace.text/image/link` decorators; summary line: *"Triton: think in thread blocks (read to shared, fuse, write back HBM)"*.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 3 of 3 passages in this section could not be located in the stored source ([https://cs336.stanford.edu/lectures/?trace=lecture_06](https://cs336.stanford.edu/lectures/?trace=lecture_06)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Know the programming model (PyTorch, Triton, PTX) to give you correctness — Understand the hardware (SMs, warps, occupancy, bank conflicts, etc.) to optimize performance" — Lecture summary slide

> "Triton: think in terms of thread blocks (read to shared memory, do stuff (fusion), write back HBM)" — `main()` closing text

> "Benchmark to understand scaling — Profile to see what's being executed for how long" — benchmarking section header

## Concepts Introduced or Referenced

- [[triton]] — The Pythonic GPU kernel language taught as successor to manual CUDA for block-level fusion/tiling.
- [[inference]] — Fused kernels and tiling directly accelerate prefill/decoding (memory-bandwidth bound) per [[inference]] two-phase model.
- [[parallelism]] — Single-GPU foundations (tiling, shared-mem reuse) that Lecture 07 scales to multi-GPU with collectives.
- [[transformer]] — Matmul/softmax are Transformer hotspots (attention `QK^T` softmax, MLP `W·x`); kernel choices determine step time.
- Hardware primitives: SM/warp/occupancy/bank conflict/coalescing/wave quantization; collective primitives preview.

## Critical Assessment

Excellent **"last mile" systems bridge**: prior lectures cover algorithms, this lecture shows why naive PyTorch is slow and how to fix it with profiling + blocked kernels. Strengths: live-executed examples (GeLU/softmax/matmul) with inspectable PTX and reproducible benchmarks; concrete numbers (H100 BW, occupancy calc) rather than hand-waving. Weaknesses: trace is Python-script-centric (requires mental reconstruction of slides/images not in repo); limited coverage of newer Triton features (Pallas, autotuning) and of flash-attention fusion; bank-conflict/swizzle shown diagrammatically but not coded. Contradictions: none with existing [[inference]] — complements it by explaining *how* fusion/tiling achieves the `O(N)` intensity gains referenced there. Suggested follow-up: compare `torch.compile` Triton output vs hand-written kernel PTX cycle counts; add flash-attention kernel example.

---

**Source:** CS336 Lecture 06 — Kernels, Triton by Percy Liang (Stanford CS336) — <https://cs336.stanford.edu/lectures/?trace=lecture_06>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
