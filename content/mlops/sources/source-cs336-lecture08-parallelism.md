---
type: source-summary
title: CS336 Lecture 08 — Parallelism Basics
summary: "Lecture 08 (Tatsu Hashimoto, April 22 2026) is the 73-slide capstone on parallelism (PDF 6.3 MB) with three goals: systems complexities of huge models, why multiple paradigms are combined, and what production training…"
status: draft
visibility: public
author: "Tatsu Hashimoto (Stanford CS336)"
source-type: article
url: "https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_08.pdf"
date-published: 2026-04-22
date-ingested: 2026-08-26
tags:
  - mlops
  - inference
  - llm-fundamentals
key-concepts:
  - "[[parallelism]]"
  - "[[inference]]"
  - "[[transformer]]"
key-entities:
  - "[[stanford-university]]"
aliases:
  - wiki/source-cs336-lecture08-parallelism
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Lecture 08 (Tatsu Hashimoto, April 22 2026) is the 73-slide capstone on parallelism (PDF 6.3 MB) with three goals: systems complexities of huge models, why multiple paradigms are combined, and what production training…</p>
<p class="kb-provenance">Tatsu Hashimoto (Stanford CS336), 2026-04-22. <a href="https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_08.pdf">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

Lecture 08 (Tatsu Hashimoto, April 22 2026) is the **73-slide capstone** on parallelism (PDF 6.3 MB) with three goals: systems complexities of huge models, why multiple paradigms are combined, and what production training actually looks like. Part 1 recaps networking (collective optimality `all-reduce = reduce-scatter + all-gather`, TPU toroidal mesh vs GPU all-to-all up to 256 GPUs, Virgo/TPUv8i tree shift, domain-size cost via Huawei CloudMatrix). Part 2 builds the primitive zoo: **naive DDP** (2*params, 16 B/param with Adam → 6.66 B params on 8×80 GB) → **ZeRO stages 1–3** (free optimizer/grad sharding at 2*params via reduce-scatter+all-gather; stage 3/FSDP is 3*params =1.5× but shards everything to 53 B params, with incremental comm+overlap), **pipeline** (bubble `(p-1)/m`, microbatches, zero-bubble `dW`/`dActivation` split), **tensor** (column/row sharding per Transformer block, `8*b*s*h*(n-1)/n` per layer all-reduce intra-node), **sequence** (shards LayerNorm/dropout's 10 `s*b*h` residuals to get linear activation scaling per Korthikanti et al. 2022), **expert/context** (all-to-all, ring attention), and a comparative table. Part 3 distills **3D/4D parallelism** recipes (TP/EP intra-node → PP inter-node → DP last, gradient accumulation), Narayanan 2021 scaling (TP capped 8, PP grows, DP shrinks to 6 at 175B), activation recomputation pay-off, and a survey of real configs (Dolma 7B FSDP; DeepSeek V3 PP16/EP64/ZeRO-1 with 1F1B A2A overlap; Yi; Llama3 405B DP128/TP8/PP16/CP1 with GPU failure; Gemma2 DP768/TP8/ZeRO-3; Mixtral 8×22B TP4/PP4/CP1/EP8/DP2; Nemotron 120B TP2/CP64/EP64; Qwen3 225B).

## Key Takeaways

1. **ZeRO is "free" until stage 3**: Stage 1 (optimizer shard) and stage 2 (grad shard) keep comm at `2*params` (same as DDP) in bandwidth-limited regime — strictly better memory `(4+K)→(4+K/N)` and `2+10/N` bytes/param. Stage 3/FSDP pays `3*params` (extra all-gather) but shards params → 8×80 GB goes from 6.66B (baseline) →16B (ZeRO1)→24.62B (ZeRO2)→53.33B params at 12 B/param. Trick: incremental reduce-scatter + overlap batched all-gathers with forward compute.
2. **Three cuts of the model**: Pipeline (depth, `b*s*h` p2p, slow-net friendly, bubble-sensitive), Tensor (width, `8*b*s*h*(n-1)/n` blocking all-reduce every block, intra-node only, no bubble), Expert (all-to-all token dispatch). Pipeline needs microbatches (`bubble = (p-1)/m`), tensor needs NVLink, expert needs enough tokens/expert. Real jobs compose all three.
3. **Activation memory is the second wall**: Params sharding alone insufficient. TP splits matmul activations but leaves 10 `s*b*h` (LN 4 + dropout 2 + MLP/attn inputs 4). Sequence parallel shards those pointwise ops (`g=all-gather / ḡ=reduce-scatter`, flipped in backward) to achieve linear `~1/TP` activation scaling; context parallel / ring attention does same for long-sequence KV.
4. **3D/4D recipe for linear scaling**: *Until model fits*: TP/EP up to 8 per node → PP across nodes (or ZeRO3 if BW allows). *Then*: fill remaining GPUs with DP (with grad accumulation if batch limited). Narayanan 2021 shows this yields flat utilization as GPUs scale; TP=8 is often optimal even at 64 nodes (8×8). Recomputation enables larger batch → higher throughput despite extra flops.
5. **Production pattern at scale**: TP ≤8, EP scales larger (64-way DeepSeek/Nemotron), CP explodes in long-context phases (64-way), DP dominates otherwise (768-way Gemma2). Decoupled `TP/CP/DP` (attention) vs `ETP/EP/EDP` (MoE MLPs) required because MoE only parallelizes MLPs (Megatron flexibility).

## Detailed Notes

- **Slide details see** [https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_08.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_08.pdf) (73-page PyPDF2 extraction) and [https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_08.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_08.pdf). Key tables preserved there: ZeRO stage comparison (primitive/cost/memory), activation per-layer formula `5*a*s*h` + quadratic attention, 6-method recap table, Narayanan DP-size bar chart, model survey table slide 72.
- **Collective optimality**: bandwidth-limited all-reduce best via `reduce-scatter + all-gather` (not tree) — explains why ZeRO preserves `2*params`.
- **Memory math**: 16 B/param =2(params FP16)+2(grads)+4(master FP32)+4(m)+4(v); BF16+FP32 master =12 B/param; Kahan summation enables pure BF16. Pipeline buffers and FSDP sharding factors included.
- **Pipeline variants**: GPipe naive, 1F1B, interleaved, zero-bubble (slide 38: `dActivation` vs `dW` overlap); trade bandwidth for bubble.
- **Tensor mapping**: `QKV` column-wise, `o_proj`/`down_proj` row-wise, norms/routers replicated (slide 41); pros/cons vs pipeline (slide 43).
- **Survey specifics**: DeepSeek V3 — PP16, EP64 over 8 nodes, EP uses A2A 1F1B overlap; Yi — ZeRO1+TP+PP; Yi-Lightning swaps TP→EP; Llama3 405B three training stages + failure anecdote; Gemma2 ZeRO-3+MP(=TP+SP) DP768; Mixtral 256-GPU = DP2+TP4+PP4+CP1+EP8; Nemotron long-context TP2/CP64/EP64; Qwen3 primarily EP≤8.
- **Links**: [FSDP tutorial](https://pytorch.org/tutorials/intermediate/FSDP_tutorial.html), [2304.11277 overlap](https://arxiv.org/pdf/2304.11277.pdf), [Megatron MoE](https://docs.nvidia.com/megatron-core/developer-guide/latest/user-guide/features/moe.html), [SemiAnalysis CloudMatrix](https://newsletter.semianalysis.com/p/huawei-ai-cloudmatrix-384-chinas-answer-to-nvidia-gb200-nvl72).

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 3 passages in this section could not be located in the stored source ([https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_08.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_08.pdf)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "New unit of compute — the datacenter. What we want: linear memory scaling (max params ∝ &#35;GPUs), linear compute scaling (FLOPs ∝ &#35;GPUs), simple collectives" — Part 1 recap (slide 13)

> "Zero stage 1 is free (in the bandwidth-limited regime) — you might as well always do it" — ZeRO slide (slide 27)

> "Until your model fits in memory — Tensor/Expert parallel up to GPUs/machine, Pipeline across machines (or use Zero-3 depending on BW). Then until you run out of GPUs — scale the rest with data parallel" — 3D parallelism recipe (slide 57)

## Concepts Introduced or Referenced

- [[parallelism]] — Full taxonomy (DDP/ZeRO 1–3/FSDP, pipeline + microbatching + zero-bubble, tensor, sequence/context, expert) with quantitative trade-off table.
- [[triton]] — Implicit compute efficiency baseline; TP/PP/EP comm costs dominate only after Triton-level fusion optimizes intra-GPU work.
- [[inference]] — Activation/KV memory per rank (sequence/context parallel), param traffic `O(params)` vs activation traffic `O(b*s*h)` — directly informs inference sharding (tensor for latency, pipeline for throughput, context for long-context serving).
- [[transformer]] — Where each parallel form cuts: depth (layers), width (QKV/MLP matrices), sequence (LN/dropout/attention KV), experts (MoE FFNs).
- Collective/hardware: NCCL, NVLink/NVSwitch, Infiniband, RDMA/RoCE, 72-GPU NVL72 domain, TPU mesh/Virgo, GB200.

## Critical Assessment

Most **deployment-relevant** lecture of CS336: moves from toy 4-layer MLPs (L07) to real 405B/768-DP configs with bytes-per-param math and failure modes. Strengths: single table (slide 55) that every practitioner copies; honest about ZeRO3's 1.5× cost and pipeline's batch-size dependency; production survey grounds recipe (not just theory). Weaknesses: PDF text extracted via PyPDF2 loses figures (tiling diagrams, bubble timelines) — must view PDF for spatial intuition; ZeRO overlap mechanism sketched not quantified (overlap fraction, α latency hidden); EP vs TP efficiency trade-off asserted not measured. No contradictions with L06/L07 — subsumes them; L07's MLP all-reduce preview is formalized as ZeRO memory equations here. Follow-up: run Korthikanti activation table for 70B @ 8K context to size sequence-parallel gain; reproduce Llama3's DP128 breakup across 16 PP stages.

---

**Source:** CS336 Lecture 08 — Parallelism Basics by Tatsu Hashimoto (Stanford CS336) — <https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_08.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
