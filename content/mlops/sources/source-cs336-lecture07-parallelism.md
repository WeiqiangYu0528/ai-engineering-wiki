---
type: source-summary
title: CS336 Lecture 07 — Parallelism
summary: "Lecture 07 (Percy Liang, April 20 2026) scales from single-GPU kernels (L06) to multi-GPU/multi-node training over a unified theme: compute is far from data at every level of the hierarchy (L1/shared → HBM →…"
status: draft
visibility: public
author: "Percy Liang (Stanford CS336)"
source-type: article
url: "https://cs336.stanford.edu/lectures/?trace=lecture_07"
date-published: 2026-04-20
date-ingested: 2026-08-26
tags:
  - mlops
  - inference
  - llm-fundamentals
key-concepts:
  - "[[parallelism]]"
  - "[[triton]]"
  - "[[inference]]"
  - "[[transformer]]"
key-entities:
  - "[[stanford-university]]"
aliases:
  - wiki/source-cs336-lecture07-parallelism
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Lecture 07 (Percy Liang, April 20 2026) scales from single-GPU kernels (L06) to multi-GPU/multi-node training over a unified theme: compute is far from data at every level of the hierarchy (L1/shared → HBM →…</p>
<p class="kb-provenance">Percy Liang (Stanford CS336), 2026-04-20. <a href="https://cs336.stanford.edu/lectures/?trace=lecture_07">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 5 figures on this page were not found in [https://cs336.stanford.edu/lectures/?trace=lecture_07](https://cs336.stanford.edu/lectures/?trace=lecture_07): `0.24`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Lecture 07 (Percy Liang, April 20 2026) scales from single-GPU kernels (L06) to **multi-GPU/multi-node training** over a unified theme: *compute is far from data at every level of the hierarchy* (L1/shared → HBM → NVLink/NVSwitch ~1.8 TB/s → Infiniband/RoCE ~0.05 TB/s → Ethernet via CPU). Implemented as `lecture_07.py` (619 lines, edtrace + `torch.multiprocessing.spawn`), it first builds foundations — collective operations (broadcast/scatter/gather/reduce/all-gather/reduce-scatter/all-reduce/all-to-all), hardware topology (8 GPUs/node, 256 nodes/pod, GB200 NVL72), NCCL optimization, `torch.distributed` (nccl/gloo) — then walks three bare-bones distributed strategies on deep MLPs (proxy for Transformer compute bottlenecks): **data parallelism** (all-reduce grads), **tensor parallelism** (shard width, activation all-reduce every layer), and **pipeline parallelism** (shard depth, point-to-point activation with microbatch pipelining and bubble `(p-1)/m`). Benchmarks show bandwidth-limited collectives at 100M elements; summary previews ZeRO/FSDP decomposition (`all-reduce = reduce-scatter + all-gather`) and JAX/Levanter declarative sharding as alternative.

## Key Takeaways

1. **Collective taxonomy matters**: All primitives defined via 4-rank tensor examples — e.g., reduce-scatter `([0,1,2,3],[1,2,3,4],[2,3,4,5],[3,4,5,6])→([6],[10],[14],[18])`, all-reduce `→([6,10,14,18]×4)`, all-to-all as transpose. `all-reduce = reduce-scatter + all-gather` split enables ZeRO memory sharding.
2. **Hardware decides parallelism choice**: NVLink intra-node bandwidth ~1.8 TB/s (B200) vs Infiniband ~0.05 TB/s (36× gap) vs PCIe ~0.24 TB/s. NCCL translates collectives into packetized GPU kernels with topology-aware routing; RDMA bypasses CPU. GB200 NVL72 (72 GPUs per NVLink domain) and RoCE (Ethernet RDMA) are recent shifts.
3. **Data parallel (batch-shard)**: Each rank gets `B/M` samples; forward/backward locally → all-reduce grads → synced SGD step. Loss differs pre-reduce, grads identical post-reduce. Cost `2*params` per step, **no param memory saving**, needs `M < B` and large batch or comm dominates — motivates FSDP/ZeRO next lecture.
4. **Tensor parallel (width-shard)**: Split weight columns/rows (MLP and attention `QKV`/`out_proj` patterns), local matmul → all-reduce partial sums every layer. Requires **NVLink-class** interconnect (activation all-reduce each block, blocking). Simple to wrap but comm-heavy.
5. **Pipeline parallel (depth-shard)**: Contiguous layers per rank, point-to-point `b*s*h` activation per microbatch. Naïve `1/n` utilization → microbatch pipeline (GPipe) hides idle with bubble ` (p-1)/m` (p stages, m micros). Works on **slow inter-node** links, saves memory vs DDP, but needs big batch and complex 1F1B scheduling; next lecture shows zero-bubble variants splitting `dW` vs `dActivation`.

## Detailed Notes

- **Setup**: `images/gpu-node-overview.png` hierarchy diagram; `images/ranks.png` rank/world-size; code uses `setup(rank,world_size)` (`init_process_group(nccl, env://)`), `spawn(fn, world_size=4)` via `mp.spawn`, stdout to `var/traces/lecture_07_stdout.txt`.
- **torch.distributed API**: `all_gather_into_tensor`, `reduce_scatter_tensor`, `all_reduce`, `FullyShardedDataParallel` mentioned; backend selection `gloo` vs `nccl`.
- **Benchmarking**: `spawn(all_reduce, 100*1024²)` and `reduce_scatter` at 100M elems (~400 MB FP32); refs to [NCCL PERF](https://github.com/NVIDIA/nccl-tests/blob/master/doc/PERFORMANCE.md#allreduce) and [all_reduce_bench.py](https://github.com/stas00/ml-engineering/blob/master/network/benchmarks/all_reduce_bench.py); bus bandwidth formula `2*(n-1)/n * params * bytes`.
- **MLP proxy**: `generate_sample_data()` → `data_parallelism_main`/`tensor_parallelism_main`/`pipeline_parallelism_main` with `num_layers=4`; `get_init_params`, `int_divide`, `summarize_tensor`, `render_duration` helpers.
- **All-to-all / MoE preview**: Balanced all-to-all ≈ transpose; MoE token routing motivation for `all_to_all`.
- **Missing / next steps** listed explicitly: comm/comp overlap, attention-aware sharding, seq/expert parallelism combos, JAX path — all covered in Lecture 08.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 3 passages in this section could not be located in the stored source ([https://cs336.stanford.edu/lectures/?trace=lecture_07](https://cs336.stanford.edu/lectures/?trace=lecture_07)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "In both cases, compute (arithmetic logic units) is far from inputs/outputs (data). Unifying theme: orchestrate computation to avoid data transfer bottlenecks" — opening slide

> "Can **re-compute** or store in **memory** or store in another GPU's memory and **communicate**" — summary trilemma

> "Many ways to parallelize: data (batch), tensor/expert (width), pipeline (depth), sequence (length)" — closing taxonomy

## Concepts Introduced or Referenced

- [[parallelism]] — Core taxonomy (data/tensor/pipeline/sequence/expert) with collectives + hardware grounding.
- [[triton]] — Single-GPU kernel efficiency (L06) that multi-GPU strategies must not squander with comm overhead.
- [[inference]] — DDP/FSDP choice affects serving memory (FSDP sharding) and pipeline/tensor impacts on prefill latency.
- [[transformer]] — MLPs as compute bottleneck; attention's all-reduce patterns in TP.
- Collectives: broadcast/scatter/gather/reduce/all-gather/reduce-scatter/all-reduce/all-to-all; NCCL, NVLink, RDMA, Infiniband, GB200 NVL72, RoCE.

## Critical Assessment

Strong **"from primitives to strategies"** lecture: 1980s collective formalism is re-grounded in PyTorch code you can run (not just diagrams), then hardware numbers make the abstract concrete (1.8 TB/s vs 0.05 TB/s explains why TP stays intra-node). Strengths: explicit 4-rank tensor traces for every collective (rare clarity), live `spawn` traces, honest about bubble costs. Weaknesses: MLP-only demos underplay attention's different comm pattern (sequence parallel deferred to L08); ZeRO/FSDP sharding only teased (full treatment in L08 slides); benchmarking section is short — no measured `bus BW` numbers in repo, just script refs. No contradictions with L06; deepens it by showing when fused kernels still bottleneck on inter-GPU bandwidth. Follow-up: measure all-reduce `α+β*bytes` curve and compare to NCCL theoretical roofline.

---

**Source:** CS336 Lecture 07 — Parallelism by Percy Liang (Stanford CS336) — <https://cs336.stanford.edu/lectures/?trace=lecture_07>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
