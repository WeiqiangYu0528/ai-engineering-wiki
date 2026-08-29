---
type: concept
title: "Triton and GPU Kernels"
summary: Triton (OpenAI) is a Pythonic language for writing GPU kernels that fuses and tiles operations to minimize HBM traffic.
visibility: public
aliases:
  - Triton
  - GPU Kernels
  - Kernel Fusion
  - Tiling
  - wiki/triton
tags:
  - inference
  - mlops
  - llm-fundamentals
created: 2026-08-26
updated: 2026-08-26
status: draft
sources:
  - "[[source-cs336-lecture06-kernels-triton]]"
  - "[[source-cs336-lecture07-parallelism]]"
  - "[[source-cs336-lecture08-parallelism]]"
related:
  - "[[inference]]"
  - "[[parallelism]]"
  - "[[transformer]]"
  - "[[self-attention]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Triton (OpenAI) is a Pythonic language for writing GPU kernels that fuses and tiles operations to minimize HBM traffic.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/mlops/concepts/parallelism">Parallelism for LLM Training and Inference</a></li><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/inference/sources/source-cs336-lecture06-kernels-triton">CS336 Lecture 06 — Kernels, Triton</a></li><li><a href="/mlops/sources/source-cs336-lecture07-parallelism">CS336 Lecture 07 — Parallelism</a></li><li><a href="/mlops/sources/source-cs336-lecture08-parallelism">CS336 Lecture 08 — Parallelism Basics</a></li></ul></nav>
</aside>

## Overview

**Triton** (OpenAI) is a Pythonic language for writing GPU kernels that fuses and tiles operations to minimize HBM traffic. In CS336 Lecture 06 it replaces manual CUDA (per-thread, explicit shared memory) with a **per-block** abstraction (`tl.program_id`, `tl.arange`, `tl.load/store`, `BLOCK_SIZE: tl.constexpr`) that implicitly handles shared memory and tensor-core `tl.dot`. A single fused Triton kernel can replace many unfused PyTorch ops, cutting kernel launches and HBM reads/writes by an order of magnitude.

## Key Ideas

- **Memory hierarchy drives design**: Registers (~400 TB/s H100) → L1/shared (~33 TB/s) → L2 (~12 TB/s) → HBM (2–8 TB/s). All wins come from reducing HBM moves via shared-memory reuse and fusion.
- **Programming model**: Grid (HBM) → CTA/block (shared memory, one SM) → thread (registers). CUDA = per-thread (`threadIdx.x`), Triton = per-block (think *load tile → compute/fuse → store*). Triton is sufficient for most ML kernels and auto-compiles to PTX.
- **Four hardware pitfalls** (L06):
  - *Warps* (32 threads, lockstep) → divergence serializes.
  - *Occupancy* (`active warps / 64`) — e.g., 128 threads ×160 regs → 18.75% occupancy; low occupancy OK if coarsened (1 thread →8 elems).
  - *Bank conflicts* — 32 banks ×4 B; column access →32-way conflict → swizzle (`row xor col`).
  - *Memory coalescing* — warp must hit 128 B cache lines; strided = many transactions.
  - *Wave quantization* — 160 blocks on 148 SMs (B200) → idle wave; keep `num_blocks % num_SMs == 0`.
- **Benchmark/profile loop**: `torch.cuda.Event` + `synchronize()` for timing, `torch.profiler` for kernel breakdown. Matmul shows `O(1)` then `O(N³)` scaling; GeLU profile proves naive=tens of kernels vs fused=1.
- **Kernel patterns** (L06):
  - *Elementwise* (GeLU): `grid=cdiv(N,BLOCK)`, masked `tl.load/store`.
  - *Reduction — row fits* (softmax): one block/row, `BLOCK=next_pow2(N)`, in-block `tl.max`→`exp`→`tl.sum`→`norm` (fused, numerically `x-max(x)`).
  - *Tiled reduction* (row-sum, N=4096, BLOCK=1024): `acc[BLOCK]` loop `for start in 0..N step BLOCK`, final `tl.sum(acc)`.
  - *Tiled matmul+fusion* (ReLU): output-tiled `BLOCK_M=64, N=64, K=32`, grid `(cdiv(M/BM),cdiv(N/BN))`, `tl.dot` on tiles, pointer bump `+=BLOCK_K*stride`, fuse `tl.maximum(acc,0)` before store. Intensity `O(tile_size)`.

## How It Works

```
HBM (global)  ──tl.load(mask)──►  SRAM / shared (block)  ──compute/fuse──►  HBM
  A,B tiles(64×32)                  acc[BM,BN] += dot(A_tile,B_tile)        C tile + ReLU
  Strided pointers: a_ptr + m*stride_am + k*stride_ak (2D block pointers)
  Loop: for k in 0..K step BK: load A_tile[BLOCK_M,BLOCK_K], B_tile[BLOCK_K,BLOCK_N]
        Reuse in SRAM → O(tile) intensity vs O(1) naive (each C[m,n] re-reads row/col from HBM)
```

**GeLU PTX proof**: `naive_gelu =0.5*x*(1+tanh(0.79788456*(x+0.044715*x³)))` vs `F.gelu(approximate="tanh")` vs `torch.compile(naive_gelu)`. PTX (`kernel.asm["ptx"]`) shows `ld.global`/`st.global`, `%ctaid.x`/`%tid.x`, thread coarsening 8 elem/thread. Benchmark 16384²: fused ~5–10× faster.

**Softmax stability**: `tl.load(..., other=-inf)` + `x - tl.max(x)` + `tl.exp`/`tl.sum`.

## Practical Implications

- **Use `torch.compile` first**: it auto-emits Triton fusion for elementwise chains; hand-write Triton only when `compile` misses (custom reductions, tiling).
- **Fuse activations with GEMM**: `relu(A@B)` / `gelu(A@B)` as one kernel saves an entire HBM round-trip — critical for Transformer MLPs (`4*h → h` projections) and `QK^T` softmax.
- **Tile size = tuning knob**: larger `BLOCK_M/N/K` → higher arithmetic intensity but more shared-mem pressure; 64×64×32 is a good H100 starting point; autotune across 32/64/128.
- **Mask everything**: variable `N` → `mask=cols<N` avoids OOB and enables power-of-two padding.
- **Inference serving**: fused kernels shrink prefill (compute-bound) step time and reduce KV-cache pressure indirectly by freeing BW; complement pipeline/TP decisions in [[parallelism]].

## Connections

- Extends [[inference]] — explains *how* prefill/decoding escapes HBM bottleneck via fusion/tiling and why KV-cache + prefix caching alone insufficient without kernel efficiency.
- Foundation for [[parallelism]] — single-GPU efficiency sets ceiling; multi-GPU collectives must not undo intra-GPU gains.
- Executes the hot loops of [[transformer]] (attention softmax, MLP matmuls) and [[self-attention]].
- Contrasts with CUDA (explicit `__shared__` management) and with higher-level compilers (Pallas, `torch.compile`).

## Open Questions

- When does hand-written Triton still beat `torch.compile` after autotuning (e.g., flash-attention V3)?
- Optimal `BLOCK_M/N/K` + `num_warps`/`num_stages` search space for B200 TMEM?
- How to compose Triton kernels with sequence-parallel collectives without losing fusion benefits?

## Sources

- [[source-cs336-lecture06-kernels-triton]]
- [[source-cs336-lecture07-parallelism]]
- [[source-cs336-lecture08-parallelism]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
