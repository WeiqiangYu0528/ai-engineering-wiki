---
type: source-summary
title: "CS336 Lecture 10 — Inference: Systems for Fast Autoregressive Generation (Percy Liang, Wed Apr 29)"
summary: The Spring 2026 CS336 Lecture 10 (Percy Liang, Apr 29, lecture10.py trace) is the systems companion to scaling — how to serve the model you just chose to train.
status: draft
visibility: public
author: "Percy Liang (Stanford CS336)"
source-type: article
url: "https://cs336.stanford.edu/lectures/?trace=lecture_10"
date-published: 2026-04-29
date-ingested: 2026-08-26
tags:
  - inference
  - llm-fundamentals
key-concepts:
  - "[[inference]]"
  - "[[decoding-strategies]]"
  - "[[transformer]]"
  - "[[self-attention]]"
  - "[[prompt-caching]]"
  - "[[context-caching]]"
key-entities:
  - "[[stanford-university]]"
  - "[[openai]]"
  - "[[deepmind]]"
  - "[[groq]]"
aliases:
  - wiki/source-cs336-lecture10-inference
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The Spring 2026 CS336 Lecture 10 (Percy Liang, Apr 29, lecture10.py trace) is the systems companion to scaling — how to serve the model you just chose to train.</p>
<p class="kb-provenance">Percy Liang (Stanford CS336), 2026-04-29. <a href="https://cs336.stanford.edu/lectures/?trace=lecture_10">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 4 of 20 figures on this page were not found in [https://cs336.stanford.edu/lectures/?trace=lecture_10](https://cs336.stanford.edu/lectures/?trace=lecture_10): `2.6`, `3.4`, `0.75`, `0.9`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The **Spring 2026 CS336 Lecture 10 (Percy Liang, Apr 29, `lecture_10.py` trace)** is the systems companion to scaling — how to *serve* the model you just chose to train. Starting from the landscape (chatbots, evaluation, RL sampling) and the hard metric that inference dominates cost (**OpenAI ~8.6T tokens/day vs DeepSeek v4 trained on 32T**), Percy derives from first principles why **generation is memory-bound** while **prefill/training is compute-bound**, then catalogs the modern inference toolbox: **KV-cache compression (GQA, MLA, CLA, local/hybrid, DeepSeek v4 attention)**, **weight precision (bf16→fp8/int8/int4, GPTQ, AWQ)**, **speculative decoding (draft+verify, Medusa/EAGLE)**, and **dynamic-workload systems (continuous/selective batching, PagedAttention/vLLM, CUDA-graph/FlashAttention fusion)**. The lecture's through-line is *arithmetic intensity* — every technique is justified as raising `FLOPs / bytes`.

## Key Takeaways
1. **Landscape & 'fast' means three different things**: Inference powers *use* (chat, code, batch), *evaluation* (instruction following), and *RL* (sample many generations → score). Operators care about **TTFT** (prefill latency), **per-token latency** (one query, interactive), and **throughput** (tokens/sec, many queries). Training sees all tokens and parallelizes over sequence (matmul); inference *must generate sequentially* — cannot parallelize over generation.
2. **First-principles arithmetic intensity: why decode is memory-bound**: For `X(B×D) @ W(D×F)` (bf16), `FLOPs=2BDF`, `bytes=2BD+2DF+2BF` → intensity `FLOPs/bytes → B` when `B≪D,F`. H100 intensity = `989 TFLOP/s ÷ 3.35 TB/s ≈ 295`. So **compute-bound iff `B>295`**. With `B=1` (vector), intensity =1 → memory-bound. This is the decode regime reading `D×F` matrix for just one vector.
3. **Prefill vs Generation — MLP vs Attention split**: Lecture fully derives per-layer intensities:
   - *MLP (SwiGLU: up, gate, down)*: `FLOPs=6BTDF`, `bytes=4BTD+4BTF+6DF` → intensity `≈ B·T`. **Prefill** (`T=S` long) compute-bound via `B·S`; **generation** (`T=1`) intensity `≈B` — needs *concurrent requests* to push `B>295`.
   - *Attention (FlashAttention)*: `Q(B×T×D), K,V(B×S×D)`, `FLOPs=4BST D`, `bytes=4BSD+4BTD` → intensity `S·T/(S+T)`. **Prefill** `S/2` (good, grows with context); **generation** `<1` always — *impossible* to make compute-bound, and batching doesn't help because KVs are per-sequence (unlike MLP weights shared across `B`). Summary table: prefill attention `S/2`, prefill MLP `B·S`, gen MLP `B`, gen attention `<1`.
4. **End-to-end perf model confirms latency/throughput tradeoff**: Closed-form `TransformerPerformanceStats`: `params=2VD +3DFL + (2DN H+2DKH)L`, `mem = B·S·K·H·L·4 + 2·params`, `latency=mem/BW`, `throughput=B/latency`. **Llama 2 13B (D=5120, F=13824, L=40, V=32k) on H100**: `B=1→64→256` worsens latency but improves throughput until **OOM** (B=256 >80 GB) and diminishing returns. Larger batch amortizes weight reads but grows KV cache O(B). Text's scaling-book diagrams (naive O(T³) → KV-cached) motivate the split.
5. **KV-cache reduction is direct latency win (memory-bound regime)**: Four families, each measured on accuracy:
   - **GQA** (N query heads, K KV heads): `K=N` (MHA) → `K=1` (MQA) → `GQA` middle; cache ↓ `N/K`. Llama 2 13B `K:40→8` at `B=64` reduces mem and lets `B=256` fit; speed data from GQA 2023 paper; accuracy Table shows minimal drop.
   - **MLA (DeepSeek v2)**: compress `K=W_K h, V=W_V h (N·H=16384)` → latent `c=W_c h (C=512)` + RoPE 64 → 576 dims; Table 8/9: MLA beats MHA slightly and beats GQA significantly.
   - **CLA** (share KVs across *layers*) and **Local/sliding-window** (e.g. Longformer, Mistral hybrid): truncate cache to recent window; layers interleaved global/local; text notes `1M` context for DeepSeek v4 via **CSA/DSA/HCA** (compress/sparse/heavily-compress).
6. **Quantization — less memory = higher intensity**: Levels: fp32 (4B train), bf16 (2B default), fp8 e4m3 (1B, trainable on H100), int8 (1B, PTQ-only), int4 (0.5B). Methods: **QAT** (simulate quant noise in forward, expensive), **PTQ + GPTQ** (Hessian-guided correction), **AWQ** (activation-aware: 0.1–1% weights touching large activations kept in fp16 → fp16→int3 = 4× mem, 3.2× speedup). Lecture walks 5.2342 quantization example (scale 0.1, zp 4).
7. **Speculative decoding — exploit checking ≫ generation**: Draft cheap `p` (e.g., T5-small 77M) guesses `γ` tokens, target `q` (T5-XXL 11B) verifies *in parallel* (batched prefix forward) via **speculative sampling** (accept if `u≤q/p`, else resample from `norm(max(0,q-p))`) — *provably exact sample* from `q` (two-token {A,B} proof in text). Results: **2.6× (t=1) / 3.4× (t=0) walltime** on EnDe/CNNDM with `α≈0.75`; α typically 0.5–0.9 for 100× smaller draft; sharper `t→0`→higher α. Extensions: **Medusa** (parallel heads), **EAGLE** (uses target features). Hierarchical draft + adaptive γ future work.
8. **Dynamic workloads → OS ideas**: **Continuous (iteration-level) batching** (Orca) — decode step-by-step, add new requests as they arrive (vs. static batching that waits for batch to finish); **selective batching** — attention per-sequence, non-attention concat (`[3,9,5]→[17,H]`) to handle ragged lengths without padding. **PagedAttention (vLLM, 2023)** — divide KV cache into non-contiguous blocks like OS paging; eliminates internal/external fragmentation; copy-on-write block sharing for system-prompt prefixes and parallel sampling; fused kernels (FlashAttention), CUDA graphs cut launch overhead; SGLang RadixAttention noted for agentic prefix reuse.

## Detailed Notes

### Landscape (Percy's opener)
- 8.6T tokens/day (OpenAI) vs 32T train (DeepSeek v4) — inference is *the* repeated cost; chatbot tokens are human-rate-limited, agent traces are unbounded; providers: closed (OpenAI/Anthropic/Google) vs open-weight (Together, Fireworks, Baseten, Groq, Cerebras); packages: **vLLM** (PagedAttention), **SGLang** (RadixAttention), **TensorRT-LLM** (NVIDIA), **llama.cpp** (CPU).
- "Fast" trinity defined with tradeoffs; setup figure `B,T,D,H,N,K,G` with conventions `F=4D, D=N·H, N=K·G, S=T in training` (JAX Scaling Book diagram).

### Arithmetic Intensity Deep Dive
- **Matrix accounting** (review_of_arithmetic_intensity): steps 1–4 accounting gives `B` intensity; H100 calc `295` threshold is load-bearing for all later reasoning.
- **Naive O(T³) generation** → KV-cache sharing insight; diagram pair (naive 1400 vs cached 1400) sets up two-stage model (prefill parallel, generation sequential).
- **MLP full derivation** (8 steps): `X@Wup` + `X@Wgate` + `GeLU(G)⊙U @ Wdown` yields `6BTDF` FLOPs; intensity `B·T`.
- **Attention with FlashAttention** (4 steps): `Q@K`, `softmax@V` → `4B S T D` FLOPs; no `B` factor in intensity → prefill good, generation hopeless.

### Throughput/Latency Lab
- Function `compute_transformer_performance_stats` with explicit formulas; instantiated at `B=1,64,256` via `@inspect` — demonstrates monotonic tradeoff + OOM boundary at 256 on 80 GB H100.

### KV-Cache Families
- **GQA**: figure gmqa.png, N/K=5 ratio experiment, accuracy table from 2023 paper.
- **MLA**: schema, formula `c=W_c h`, 512+64 dims, latency claim, Tables 8–9 accuracy.
- **CLA**: cross-layer sharing figure + Pareto.
- **Local**: Longformer pattern + Mistral hybrid; note linear effective context per layer, cache independent of `S`.
- **DeepSeek v4 attention** (2026): CSA (compress m→1) / DSA (top-k) / HCA (heavier) achieving 1M context.

### Quantization Lab
- Mechanics: `x_quant=round(x/scale)+zp`, `x_approx=(x_quant-zp)·scale`; hierarchy table; QAT vs PTQ trade; GPTQ reference; AWQ schema (large activation channels).

### Pruning/Distillation
- Algorithm (NVIDIA 2407.14679): importance on 1024-sample calibration → remove layers/heads/dims → distill; figure pruning-kd-loop + results.

### Speculative Sampling Deep Dive
- Asymmetry: prefill compute-bound (cheap checking) vs gen memory-bound; algorithm 5 panels + video; `p=draft, q=target`, proof by example enumerated for `{A,B}`; table speculative-sampling-results/stats; in-practice pairings (70B↔8B, 8B↔1B, distillation for α).

### Batching Systems
- **Continuous**: Orca paper link + YouTube talk; static vs iteration-level diagram; selective batching tensor shapes.
- **PagedAttention**: vLLM arXiv 2309.06180; fragmentation figures (internal vs external), block diagrams, logical vs physical, parallel-sampling sharing, copy-on-write; optimizations list.

### Summary Slide
- Recap bullet ties all ideas to systems analogues (speculative execution ≈ speculative decoding, paging ≈ PagedAttention) and flags new architectures (linear attention, SSMs, diffusion) as future.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 3 passages in this section could not be located in the stored source ([https://cs336.stanford.edu/lectures/?trace=lecture_10](https://cs336.stanford.edu/lectures/?trace=lecture_10)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Inference is memory-bound. Prefill is compute-bound, generation is memory-bound — prefill MLP intensity B·S, prefill attention S/2, generation MLP B (requires concurrent requests), generation attention <1 (impossible to improve)." — Arithmetic Intensity summary

> "Checking is faster than generation — use a cheaper draft model p to guess a few tokens and verify with target q in parallel; always generate at least one candidate; guaranteed to be an exact sample." — Speculative sampling

> "Use ideas from operating systems (paging) to make use of memory for dynamic workloads — divide the KV cache into non-contiguous blocks." — PagedAttention

## Concepts Introduced or Referenced
- [[inference]] — Entire lecture is canonical expansion: prefill/decode, memory vs compute bound, KV cache, arithmetic intensity, latency/throughput.
- [[decoding-strategies]] — Greedy/beam/sampling background; speculative sampling preserves stochastic decoding exactly.
- [[transformer]] / [[self-attention]] — MLP vs attention accounting; FlashAttention batched verification.
- [[prompt-caching]] / [[context-caching]] — Prefix reuse is orthogonal (RadixAttention for agents); draft-model copy-on-write reuses shared blocks.
- [[scaling-laws]] — 13B config as scaling target; Chinchilla inference-amortization motivation for small dense models + MLA.
- [[groq]] — Hardware LPU as alternative latency path (contrasted with algorithmic cache/compute tricks).
- [[huggingface]] / [[llama-3]] — Llama 2 13B as running example (40 layers, 40 heads).

## Critical Assessment
- **Strengths**: Only source that *derives* memory-bound claim from `B>295` threshold and separates MLP vs attention intensities — load-bearing for choosing GQA vs batching vs speculative decoding. Exhaustive systems catalog (vLLM, SGLang, TRT-LLM, llama.cpp) with OS analogues; speculative decoding algorithm + proof is self-contained and exact; performance model `latency=mem/BW` gives usable back-of-envelope estimator for any `(D,F,L,N,K,H,B,S)` config.
- **Weaknesses**: Trace `lecture_10.py` is code-generated edtrace — many `@inspect` suspensions and figures (transformer diagram, gmqa, mla-schema, etc.) omitted in raw `.py` capture; must view `?trace=lecture_10` or Scaling Book for visuals. Quantization section is overview without per-layer error ablations; pruning section TODO stub; MLA/DeepSeek v4 numbers are image-only (must read images for Tables 8–9).
- **Relation to wiki**: Upgrades [[inference]] from prompt-caching/few-quantization sketch to full systems chapter; complements [[source-speculative-decoding]] (paper) with H100 math and draft families (Medusa/EAGLE); complements [[scaling-laws]] via 13B serving economics; provides concrete `B·S>295` rule for operational batching policy.

---

**Source:** CS336 Lecture 10 — Inference: Systems for Fast Autoregressive Generation (Percy Liang, Wed Apr 29) by Percy Liang (Stanford CS336) — <https://cs336.stanford.edu/lectures/?trace=lecture_10>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
