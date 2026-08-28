---
type: concept
title: "Parallelism for LLM Training and Inference"
summary: Parallelism is the set of strategies that split LLM compute and memory across many GPUs and nodes because a single GPU cannot hold or afford to train modern models.
visibility: public
aliases:
  - "Parallelism"
  - "Data Parallelism"
  - "Tensor Parallelism"
  - "Pipeline Parallelism"
  - "3D Parallelism"
tags:
  - mlops
  - inference
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
  - "[[transformer]]"
  - "[[triton]]"
  - "[[scaling-laws]]"
---

# Parallelism for LLM Training and Inference

## Overview

**Parallelism** is the set of strategies that split LLM compute and memory across many GPUs and nodes because a single GPU cannot hold or afford to train modern models. CS336 Lectures 07–08 build a hierarchy (L1/shared → HBM → NVLink/NVSwitch ~1.8 TB/s → Infiniband/RoCE ~0.05 TB/s → Ethernet) and a taxonomy — **data** (batch), **tensor/expert** (width), **pipeline** (depth), **sequence/context** (length) — unified by collective operations (`all-reduce = reduce-scatter + all-gather` is bandwidth-optimal). Real training composes them as **3D/4D parallelism** (TP/EP intra-node → PP inter-node → DP last) to achieve linear memory and compute scaling.

## Key Ideas

- **Collectives are the primitives** (L07 4-rank examples):
  - `broadcast` (copy rank0→all), `scatter`/`gather` (split/collect), `reduce` (sum to rank0), `all-gather` (every rank gets full tensor — shard → full params for forward), `reduce-scatter` (per-dim sums, scattered — grad shard), `all-reduce` (every rank gets sum — DDP grad sync; decomposed as `reduce-scatter + all-gather` enabling ZeRO), `all-to-all` (transpose-like, MoE token routing). NCCL maps these to topology-aware GPU-kernel packets (RDMA bypasses CPU).
- **Hardware dictates choice**: NVLink intra-node ~1.8 TB/s (B200; HBM 8 TB/s) vs Infiniband ~0.05 TB/s (36× gap) vs PCIe ~0.24 TB/s; 8 GPUs/node, 256 nodes/pod, GB200 NVL72 =72 GPUs/NVLink domain, RoCE = cheaper IB alternative. TPU mesh vs GPU all-to-all; TPUv8i/t shifting to tree/Virgo for MoE.
- **Data parallelism**:
  - *Naive DDP*: split `B` across `M` GPUs, local forward/backward → `all-reduce` grads (cost `2*params`), no param memory saving, needs `M < B`.
  - *ZeRO stages* (Rajbhandari): Stage 1 optimizer shard, Stage 2 grad shard — both stay `2*params` ("free") via incremental `reduce-scatter` after each layer + `all-gather` after update; Stage 3 / FSDP shards params too → `3*params` (1.5× DDP) but params shard `1/DP`. At 12 B/param (BF16+FP32 master): 8×80 GB fits 6.66B→16B→24.62B→53.33B params. Incremental comm overlapped with compute hides latency.
  - Memory reality: 16 B/param worst (2+2+4+4+4 for params/grads/master/m/v Adam); BF16+Kahan 12 B/param.
- **Model parallelism**:
  - *Pipeline* (depth): contiguous layers/rank, `b*s*h` point-to-point per microbatch; naive `1/n` utilization → microbatch pipeline (GPipe) bubble `(p-1)/m` (p stages, m micros); zero-bubble splits backward `dW` vs `dActivation`. Slow-net friendly, needs large batch, saves memory vs DDP.
  - *Tensor* (width): shard `QKV` column-wise, `out_proj/down_proj` row-wise, `A=[A1A2], B=[B1;B2]→A1B1+A2B2` with `all-reduce` per layer; no bubble but `8*b*s*h*(n-1)/n` blocking all-reduce every block → intra-node/NVLink only, fused-kernel friendly via [[triton]].
  - *Sequence* (Korthikanti): shards LayerNorm/dropout residuals (10 `s*b*h` terms TP leaves) via `g=all-gather / ḡ=reduce-scatter` flipped in backward → linear activation scaling `~1/SP`.
  - *Expert* (MoE): shard experts, `all-to-all` token dispatch per MoE layer; behaves like TP for MLPs but routing cheaper than matmul tiling at scale; usually `EP < DP`.
  - *Context/Ring*: split long-sequence KV across GPUs.
- **Trade-off table** (L08 slide 55): DDP no shard / `2*params` `all-reduce`; FSDP `1/DP` all sharded / `3*params`; PP `1/PP` layers / `b*s*h` p2p + bubble; TP `1/TP` weights + `~1/TP` activations / `8bsh` all-reduce; Sequence `~1/SP` seq-activations; Expert `1/EP` experts / all-to-all. "Scales global batch?" → DDP/FSDP yes, PP needs micros, TP/SP/EP no.

## How It Works

```
Hierarchy:  L1/shared (TB/s)  ←fuse/tile via Triton→  HBM
                ↑ NVLink 1.8 TB/s (intra-node)  → Tensor/Sequence/Expert (blocking all-reduce / all-to-all)
                ↑ Infiniband 0.05 TB/s (inter-node) → Pipeline (p2p b*s*h) + Data (all-reduce, can overlap)
                ↑ Ethernet (pods)                  → 3D composition

ZeRO:  forward:  all-gather(param_shards) → compute → free
       backward: compute grad → reduce-scatter(grad_shard) → free → update own shard → all-gather(new params)

Pipeline (p=4, m=4):  time→  [F0 F1 F2 F3 | ... bubble (p-1)/m ...]  overlaps via 1F1B
Tensor:  C = sum(Ai·Bi) across TP ranks → all-reduce partial C each layer
Sequence: split s dim before LN → g/ḡ exchange per layer
```

**3D recipe** (Narayanan 2021): *Until model fits* — TP/EP up to 8 per node → PP across nodes (or ZeRO3 if BW permits). *Then* fill remaining GPUs with DP (+ grad accumulation if batch limited). Result: flat utilization as GPUs scale; TP=8 optimal even at 64 nodes (8×8); activation recomputation buys larger batch → net throughput win.

## Practical Implications

- **Choose parallelism by interconnect**: TP/EP/Sequence must stay intra-node (NVLink); PP bridges slow inter-node; DDP/FSDP spans all but needs large `global_batch = micro_batch * DP * grad_accum`.
- **Memory budgeting**: Use ZeRO stage table to size `max params = (num_gpus * HBM) / (bytes/param)` — e.g., 8×80 GB BF16 → 53B with FSDP vs 6.6B naive. Still add activation `~ s*b*h*layers` (sequence parallel halves it); long-context serving → context parallel mandatory.
- **Batch size is not free**: pipeline bubble shrinks as `m↑`, but returns diminish (and comm overhead `∝ params / batch` grows for DDP). Grad accumulation trades step count for comm efficiency.
- **Production configs** (L08 survey): Dolma 7B FSDP; DeepSeek V3 PP16+EP64/ZeRO1 1F1B A2A; Yi ZeRO1+TP+PP; Llama3 405B DP128+TP8+PP16+CP1 (3 stages, GPU failures); Gemma2 ZeRO3+MP DP768+TP8; Mixtral 256 GPUs DP2+TP4+PP4+CP1+EP8; Nemotron 120B TP2+CP64+EP64; Qwen3 EP≤8. Pattern: TP≤8, EP large, CP large in long-context.
- **Inference mapping**: tensor for low-latency (one replica, fused kernels), pipeline for throughput (many queries, bubbles amortized), context parallel for `KV` memory at 100K+ tokens.

## Connections

- Relies on [[triton]] — intra-GPU fusion/tiling sets the compute ceiling that inter-GPU collectives must not waste.
- Executes [[transformer]] — each parallel form cuts a different axis: depth (layers/PP), width (QKV/MLP/TP), sequence (LN/KV/SP), experts (MoE FFN/EP).
- Determines [[inference]] cost/memory: param traffic `O(params)` (ZeRO/FSDP) vs activation traffic `O(b*s*h)` (PP/TP); guides serving sharding vs prefix caching.
- Complements [[scaling-laws]] — 3D parallelism enables the `C^0.5` compute-optimal frontier at 100B+ scale; without it, memory/comms cap model size.

## Open Questions

- Optimal TP/PP/DP/EP/CP search for B200 NVL72 (72-GPU domain changes TP sweet spot?).
- Overlap fraction for FSDP all-gather vs compute at 1M context — latency vs bandwidth limit?
- Unified `TP/CP/DP` vs `ETP/EP/EDP` scheduling for MoE where attention prefers TP=8 but MLPs prefer EP=64?

## Sources

- [[source-cs336-lecture06-kernels-triton]]
- [[source-cs336-lecture07-parallelism]]
- [[source-cs336-lecture08-parallelism]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
