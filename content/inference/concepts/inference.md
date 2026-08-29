---
type: concept
title: "LLM Inference"
summary: LLM Inference refers to the execution phase where a trained language model processes prompt tokens (prefill phase) and generates new tokens sequentially (decoding phase).
visibility: public
aliases:
  - Inference
  - Model Serving
  - Autoregressive Decoding
  - KV Cache
  - Temperature Sampling
  - Top-p Sampling
  - wiki/inference
tags:
  - inference
  - llm-fundamentals
created: 2026-08-23
updated: 2026-08-26
status: draft
sources:
  - "[[source-prompt-caching]]"
  - "[[source-transformer-explainer]]"
  - "[[source-attention-is-all-you-need]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "[[source-training-compute-optimal-large-language-models]]"
  - "[[source-how-to-generate]]"
  - "[[source-cs336-lecture10-inference]]"
  - "[[source-speculative-decoding]]"
  - "[[source-cs336-lecture06-kernels-triton]]"
  - "[[source-cs336-lecture07-parallelism]]"
  - "[[source-cs336-lecture08-parallelism]]"
  - "[[source-cs336-lecture02-pytorch-resource-accounting]]"
  - "[[source-cs336-lecture05-gpus-tpus]]"
  - "[[source-cs336-lecture04-attention-moe]]"
  - "[[source-cs336-lecture01-overview-tokenization]]"
related:
  - "[[prompt-caching]]"
  - "[[transformer]]"
  - "[[self-attention]]"
  - "[[scaling-laws]]"
  - "[[chinchilla]]"
  - "[[pretraining]]"
  - "[[decoding-strategies]]"
  - "[[huggingface]]"
  - "[[context-engineering]]"
  - "[[evaluation]]"
  - "[[gopher]]"
  - "[[triton]]"
  - "[[parallelism]]"
  - "[[mixture-of-experts]]"
  - "[[tokenization]]"
  - "[[context-engineering-thesis]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">LLM Inference refers to the execution phase where a trained language model processes prompt tokens (prefill phase) and generates new tokens sequentially (decoding phase).</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/inference/concepts/prompt-caching">Prompt Caching</a></li><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li><li><a href="/llm-fundamentals/entities/chinchilla">Chinchilla</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/inference/concepts/decoding-strategies">Decoding Strategies</a></li><li><a href="/llm-fundamentals/entities/huggingface">Hugging Face</a></li><li><a href="/agents/concepts/context-engineering">Context Engineering</a></li><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li><li><a href="/llm-fundamentals/entities/gopher">Gopher</a></li><li><a href="/inference/concepts/triton">Triton and GPU Kernels</a></li><li><a href="/mlops/concepts/parallelism">Parallelism for LLM Training and Inference</a></li><li><a href="/llm-fundamentals/concepts/mixture-of-experts">Mixture of Experts</a></li><li><a href="/llm-fundamentals/concepts/tokenization">Tokenization</a></li><li><a href="/agents/concepts/context-engineering-thesis">Context Engineering: One Constraint Seen From Three Layers</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/inference/sources/source-prompt-caching">Prompt caching — Anthropic Claude Platform</a></li><li><a href="/llm-fundamentals/sources/source-transformer-explainer">Transformer Explainer: Learning LLM Transformers with Interactive Visual Explanation and Experimentation</a></li><li><a href="/llm-fundamentals/sources/source-attention-is-all-you-need">Attention Is All You Need</a></li><li><a href="/llm-fundamentals/sources/source-deep-dive-into-llms-like-chatgpt">Deep Dive into LLMs like ChatGPT</a></li><li><a href="/llm-fundamentals/sources/source-training-compute-optimal-large-language-models">Training Compute-Optimal Large Language Models (Chinchilla)</a></li><li><a href="/llm-fundamentals/sources/source-how-to-generate">How to generate text: using different decoding methods for language generation with Transformers</a></li><li><a href="/inference/sources/source-cs336-lecture10-inference">CS336 Lecture 10 — Inference: Systems for Fast Autoregressive Generation (Percy Liang, Wed Apr 29)</a></li><li><a href="/inference/sources/source-speculative-decoding">Fast Inference from Transformers via Speculative Decoding</a></li><li><a href="/inference/sources/source-cs336-lecture06-kernels-triton">CS336 Lecture 06 — Kernels, Triton</a></li><li><a href="/mlops/sources/source-cs336-lecture07-parallelism">CS336 Lecture 07 — Parallelism</a></li><li><a href="/mlops/sources/source-cs336-lecture08-parallelism">CS336 Lecture 08 — Parallelism Basics</a></li><li><a href="/llm-fundamentals/sources/source-cs336-lecture02-pytorch-resource-accounting">CS336 Lecture 02 — PyTorch (einops), Resource Accounting (FLOPs, Memory, Arithmetic Intensity)</a></li><li><a href="/mlops/sources/source-cs336-lecture05-gpus-tpus">CS336 Lecture 05 — GPUs, TPUs</a></li><li><a href="/llm-fundamentals/sources/source-cs336-lecture04-attention-moe">CS336 Lecture 04 — Attention Alternatives and Mixture of Experts</a></li><li><a href="/llm-fundamentals/sources/source-cs336-lecture01-overview-tokenization">CS336 Lecture 01 — Overview, Tokenization</a></li></ul></nav>
</aside>

## Overview
**LLM Inference** refers to the execution phase where a trained language model processes prompt tokens (prefill phase) and generates new tokens sequentially (decoding phase). In autoregressive [[transformer]] models, inference is memory-bandwidth bound and computationally distinct from the compute-bound pretraining phase. **CS336 Lecture 10** [[source-cs336-lecture10-inference]] derives this from arithmetic intensity and unifies the modern systems stack (GQA/MLA, quantization, speculative decoding, PagedAttention) — every technique is a move to raise `FLOPs/byte`.

## Key Ideas
- **Two Phases of Inference:**
  1. **Prefill Phase (Prompt Processing):** The model processes all prompt tokens in parallel using full multi-head [[self-attention]]. This phase is **compute-bound** (matrix-matrix multiplication, high arithmetic intensity). Lecture 10 refines: MLP intensity `≈B·T`, attention intensity `S/2` — both grow with batch×sequence or context.
  2. **Decoding Phase (Token Generation):** Tokens are generated one by one autoregressively. Each step requires loading all model weights from GPU VRAM into SRAM to process just a single token vector. This phase is **memory-bandwidth bound** (low arithmetic intensity). Lecture 10 refines: MLP intensity `≈B` (needs concurrent requests `B>295` on H100 to flip to compute-bound), attention intensity `<1` always — *impossible* to make compute-bound because KVs are per-sequence (batching doesn't help for attention).
- **Arithmetic Intensity First Principles (CS336 H100 derivation)** — from [[source-cs336-lecture10-inference]]:
  - Toy `X(B×D)@W(D×F)` bf16: `FLOPs=2BDF`, `bytes=2BD+2DF+2BF → intensity→B` when `B≪D,F`. H100: `989 TFLOP/s ÷ 3.35 TB/s ≈295` → compute-bound iff `B·T>295` (MLP) or `S/2>295` (prefill attention). Decode attention never exceeds 1, so memory-bound is fundamental.
  - Full derivations: MLP (SwiGLU 3 matmuls) `6BTDF` vs attention `4BST D` FLOPs; bytes formulas and `S·T/(S+T)` intensity are the load-bearing distinctions for choosing GQA vs batching vs speculation.
- **The KV Cache & Prefix Reuse:**
  - During generation, previous Key ($K$) and Value ($V$) tensors across all layers are cached in GPU VRAM to avoid recomputing historical attention states ($O(N^2)$ recalculation). Naive generation is `O(T³)` without cache; KV-cache makes per-token cost linear. *Prefix reuse* extends this across requests via **[[prompt-caching]]** (Anthropic `cache_control`): static prefixes (system, tools, few-shot, doc) marked with cache breakpoints are hashed and reused (hit = 0.1× cost), while suffix is processed fresh — see [[source-prompt-caching]] for 5m/1h TTLs and 20-block lookback.
  - *Memory Overhead:* The KV cache size scales with context length $L$, hidden dimension $d$, and number of layers $N_{\text{layers}}$, often exceeding model weight memory at long sequence lengths. Prompt caching reduces *compute* for hits but still counts cached tokens for rate limits; workspace-level isolation applies. Lecture 10 model: `mem = B·S·K·H·L·4 + 2·params`, `latency=mem/BW`, `throughput=B/latency` — instantiated for **Llama 2 13B (D=5120,F=13824,L=40)** where `B=1→64→256` worsens latency but improves throughput until OOM at 80 GB H100 (see [[source-cs336-lecture10-inference]] for table).
- **KV-Cache Compression (CS336 Lecture 10 complement to [[scaling-laws]] overtraining)**:
  - **GQA**: `N` query heads share `K` KV heads (`K=N` MHA → `K=1` MQA → `K≈8` GQA, e.g. 40→8 =5× cache cut, lets `B=256` fit).
  - **MLA (DeepSeek v2)**: compress `N·H=16384 → c=W_c h (512)+RoPE64=576` latent cache; per Table 9 beats MHA slightly.
  - **CLA / Local hybrid / DeepSeek v4**: share across layers or truncate to sliding window (hybrid global/local interleaving); DeepSeek v4 **CSA/DSA/HCA** reaches 1M context via compress-m→1 / top-k sparse / heavily-compressed attentions — linearly scaling effective context.
- **Quantization & Pruning (Weight Memory is Latency)**:
  - Weight precision `fp32(4B) → bf16(2B) → fp8(1B) → int8(1B) → int4(0.5B)` linearly cuts `mem` and thus `latency` in memory-bound regime. Methods: **QAT** (simulate in forward, expensive), **PTQ+GPTQ** (Hessian-guided correction), **AWQ** (0.1–1% large-activation-channel weights kept fp16 → 4× mem / 3.2× speedup for int3).
  - Pruning+distillation (NVIDIA 2407.14679): importance on 1024-sample calib → remove layers/heads → distill original→pruned.
- **Speculative Decoding — Checking ≫ Generation** (see [[source-speculative-decoding]] and Lecture 10): draft small `p` (77M) guesses `γ`, target `q` (11B) verifies `γ+1` prefixes *in parallel* (single batched forward) via **speculative sampling** `accept iff u≤q/p else resample norm(max(0,q-p))` — *exact* sample from `q`. Walltime `2.6× (t=1) / 3.4× (t=0)` on EnDe/CNNDM, α≈0.5–0.9; extensions **Medusa** (parallel heads) / **EAGLE** (target features), adaptive γ, hierarchical draft.
- **Systems for Dynamic Workloads (vLLM/SGLang)**:
  - **Continuous (iteration-level) batching** (Orca): add requests as they arrive vs static batching that locks batch whole generation.
  - **Selective batching**: attention per-sequence, non-attention concat `[3,9,5]→[17,H]` to avoid ragged padding.
  - **PagedAttention (vLLM)**: divide KV cache into OS-like non-contiguous **blocks**; eliminates internal/external fragmentation; copy-on-write sharing for system prompts / parallel sampling; fused FlashAttention kernels + CUDA graphs cut launch overhead. SGLang **RadixAttention** generalizes to agentic prefix trees.
- **Logit Transformation & Decoding Policies (Detailed in [[decoding-strategies]]; Visualized in [[source-transformer-explainer]] and [[source-how-to-generate]]):**
  - **Deterministic decoders:**
    - **Greedy:** $w_t=\arg\max_w P(w|w_{<t})$ — fastest but loops and misses high-joint-prob paths (e.g., misses "dog"→"has" 0.36 for "nice"→"woman" 0.20).
    - **Beam search:** keeps `num_beams` hypotheses, picks max joint $\sum\log P$ — best for MT/summarization where length is predictable; for open-ended generation it is repetitive/boring (human text is *lower* probability than beam). `no_repeat_ngram_size` and `num_return_sequences` mitigate.
  - **Stochastic decoders (see [[decoding-strategies]]):**
    - **Temperature ($T$):** $$P(y_i \mid x) = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$ — $T \to 0$ = greedy; low $T$ $0.1$–$0.7$ (code/math), high $T$ $0.8$–$1.2$ (creative diversity).
    - **Top-$k$:** Truncates to $k$ most likely (e.g., $k=50$); fixed pool — can prune plausible words on flat distributions or admit tail gibberish on sharp ones.
    - **Top-$p$ (Nucleus):** Smallest set with cumulative $≥p$ (e.g., $p=0.92$) — *dynamic* pool, wide when unpredictable, narrow when predictable; often combined as `top_k=50, top_p=0.95` via `model.generate()` [[source-how-to-generate]].

## How It Works
```
Input Prompt Tokens ──► [ Prefill: Parallel Matrix Multiply | intensity B·S (MLP) / S/2 (Attn) → compute-bound ] ──► Store Key/Value Tensors in KV Cache
                                                                            │
                                      ┌─────────────────────────────────────┘
                                      ▼
  B·S·K·H·L blocks (PagedAttention)   KV Cache (per layer: K×H, 4 bytes per token)
                                      │
                                      ▼
Generated Token t+1 ◄── [ Decoding Policy: Greedy / Beam / Sample (T, top_k, top_p) or Speculative (p drafts γ → q verifies γ+1) ] ◄── [ Softmax(Logits / T) ] ◄── [ Autoregressive Decode | MLP B, Attn <1 → memory-bound ]
         ▲                                                                                      (see [[decoding-strategies]] for full taxonomy & [[source-speculative-decoding]] for exact sampling)
         └────────────────── KV-cache update (copy-on-write blocks) ──────────────────┘
                                 ▲                                  │
                                 └── [ Quantized weights: bf16→fp8/int4 reduces mem → latency=mem/BW ] ──
```

CS336 performance model (`[[source-cs336-lecture10-inference]]`): `mem = B·S·K·H·L·4 + 2·params`, `latency=mem/3.35 TB/s` (H100), `throughput=B/latency`. Tradeoff: `B↑` → throughput↑ but latency↑ (larger KV `O(B)`) and fragmentation — mitigated by continuous/selective batching + PagedAttention copy-on-write (RadixAttention for agents).

## Practical Implications
- **Prefix Caching Slashes Repeated Prefill:** [[prompt-caching]] (Anthropic `cache_control`) marks stable prefixes (tools→system→messages hierarchy) with a hash up to breakpoint; hits avoid recomputing prefill for **90% discount** ($0.10×$), writes are $1.25×$/$2×$ for 5m/1h TTL. Place breakpoint on **last stable block** (static prefix end, not varying timestamp/user message); 20-block lookback and minima (512–4096 per model) govern hits. SGLang **RadixAttention** (CS336 Lecture 10) generalizes to agentic prefix trees. See [[source-prompt-caching]] for hierarchy, invalidation matrix, and `cache_creation/read` accounting.
- **Compute-Optimal Models Slash Serving Cost:** [[source-training-compute-optimal-large-language-models]] proves that training is not the whole cost story. [[chinchilla]] (70B) matches [[gopher]] (280B) capability at identical pretraining FLOPs but with **4× smaller weights and 4× lower per-token inference FLOPs**. Since inference/fine-tuning FLOPs are amortized over billions of requests (vs. one-time training), the lifetime compute is dominated by serving. This amortization argument directly motivated the industry pivot to smaller, data-dense models and to *overtraining* (e.g., 8B on 15T tokens) to push per-token cost even below the Chinchilla frontier ($\approx 20$ tok/param). CS336 Lecture 10's H100 model quantifies: halving `D` or `N` linearly cuts `latency=mem/BW`.
- **Hardware Accessibility:** A 70B compute-optimal model fits on a single 8×H100 node with quantization, whereas a 280B model requires multi-node sharding. Chinchilla-tier models thus enable on-premises deployment and lower-latency serving without model-parallel overhead.
- **Memory Optimizations:** Serving engines (e.g., vLLM with PagedAttention, TensorRT-LLM, SGLang) manage non-contiguous GPU memory allocations to eliminate KV cache fragmentation. The benefit compounds with smaller compute-optimal models: KV cache per token scales with $d_{model} \times N_{layers}$, so a 4× smaller $d_{model}$ (Chinchilla 8192 vs Gopher 16384) proportionally reduces cache pressure at long contexts. **PagedAttention** ([[source-cs336-lecture10-inference]]) is OS paging at block level → copy-on-write for shared prefixes + parallel sampling.
- **Speculative Decoding as Default for Memory-Bound Workloads:** When `B` small (interactive chatbot, `B·T<295`), speculative decoding gives *free* latency cut without extra total weight reads per useful token — needs spare compute for `γ+1` parallel verifies and well-matched draft. CS336 suggests pairing overtrained 7–8B drafts (high α, low c) for frontier 70B targets; **Medusa/EAGLE** extend by learning multi-head or feature-aware drafts.
- **Serving Architecture Innovations:** Multi-Query Attention (MQA) and Grouped-Query Attention (GQA) reduce KV cache memory footprints by sharing key/value heads across query heads — now joined by **MLA** (DeepSeek v2, 512 dim) and **CLA/local** as CS336 catalogs — complementary to choosing a smaller [[scaling-laws]]-optimal model and to [[prompt-caching]] for agentic loops.
- **Batching Policy from Intensity Arithmetic:** Prefill can be merged arbitrarily (`B·S`) to stay compute-bound; generation should maximize `B` up to memory limit but *attention* will stay `<1` — batch helps MLP only. Continuous + selective batching captures this: non-attention concatenated, attention per-sequence. Operational rule: keep `B·T>295` for prefill; for generation, rely on GQA/quant/speculation rather than batch alone.
- **Kernel Fusion via [[triton]] (CS336 L06):** Naive GeLU chains issue many kernels and HBM round-trips; fused Triton kernels (`triton_gelu`, fused softmax `tl.max→exp→sum`, tiled `matmul+ReLU` with `tl.dot` on 64×64×32 tiles and `tl.maximum(acc,0)` fusion) collapse to one `ld.global`/`st.global` per tile. `torch.compile` auto-generates Triton — first try it before hand-writing; PTX shows 8-element coarsening. Tiling raises intensity `O(tile_size)` vs `O(1)` naive.
- **3D Parallelism for Serving (CS336 L07–08):** Single-GPU fusion caps gains if serving shreds params across slow links. Recipe: TP/EP intra-node (NVLink 1.8 TB/s, `8*bsh` all-reduce per layer) → PP inter-node (`bsh` p2p, bubble `(p-1)/m` hidden by microbatches/1F1B/zero-bubble) → DP last with grad accumulation. Sequence/context parallel (`g=all-gather/ḡ=reduce-scatter` on LN/KV) linearly cuts activation/KV memory `~1/SP` — required for 100K+ context serving; L08 survey shows TP≤8, EP≤64, CP≤64 in production (Llama3 405B DP128/TP8/PP16/CP1, Gemma2 DP768/TP8).

## Connections
- Executes the causal decoding loop of the [[transformer]].
- Relies directly on the scaled dot-product mechanics of [[self-attention]].
- Decoding policies detailed in [[decoding-strategies]] and implemented via [[huggingface]] `transformers` `generate()` [[source-how-to-generate]]; speculative decoding preserves them exactly per [[source-speculative-decoding]].
- Interactive logit/softmax sampling visualized in [[source-transformer-explainer]].
- Constrains real-time serving costs for [[thinking-models]] that scale test-time compute — speculative decoding amplifies thinking-model ROI by accelerating reasoning traces.
- Directly benefits from [[scaling-laws]] via [[chinchilla]]: compute-optimal [[pretraining]] (20 tok/param) yields cheaper [[inference]] for equal capability, as validated in [[source-training-compute-optimal-large-language-models]] and quantified by CS336 Lecture 10's `B·S·K·H·L` memory model; overtraining (Lecture 11: 96:1 Hunyuan, 39:1 LLaMA 3) pushes frontier further.
- Hardware acceleration via [[groq]] LPU (18× throughput, best TTFT) complements software optimizations; long-context memory via [[infini-attention]] (114× compression, 1M context) addresses KV-cache scaling at extreme lengths; systems via **vLLM/SGLang/TensorRT-LLM** from [[source-cs336-lecture10-inference]].
- Fused kernels via [[triton]] (tiling + `tl.dot` intensity, bank-conflict/coalescing/occupancy tuning) set the per-GPU ceiling that [[parallelism]]'s collectives (`all-reduce = reduce-scatter + all-gather` bandwidth-optimal, NCCL/RDMA) must not waste — see [[source-cs336-lecture06-kernels-triton]] and [[source-cs336-lecture08-parallelism]].
- Inference sharding mirrors training's 3D recipe: tensor for low-latency, pipeline for throughput, sequence/context for KV memory; ZeRO/FSDP sharding (`2*params`→`3*params`) determines what fits on 8×80 GB (6.66B→53B at 12 B/param) — see [[source-cs336-lecture07-parallelism]].
- Feeds [[evaluation]]: inference throughput/latency is metric in HELM efficiency and determines feasibility of RL sampling and Chatbot Arena evaluation cost (CS336 Lecture 12).

## Open Questions
- How to achieve sub-10ms per-token generation latencies for 100B+ parameter models without severe quantization degradation? CS336 intensity analysis says `B·T>295` needed for prefill — generation `<1` suggests speculative + MLA + quantization must stack.
- Can speculative decoding and medusa-heads fundamentally break the memory-bandwidth wall? CS336 theory caps gain at `1/(1-α)` and requires `α>c`; adaptive γ and EAGLE hint at 60% headroom — but α drops on open-ended chat.
- Given Chinchilla's 4× inference saving at same pretraining FLOPs, what is the optimal degree of *overtraining* beyond the $C^{0.5}$ frontier for a given expected lifetime query volume? MiniCPM/DeepSeek vs LLaMA 3 table (20→215 tok/param) shows Pareto but no closed formula.

## Sources
- [[source-how-to-generate]]
- [[source-training-compute-optimal-large-language-models]]
- [[source-transformer-explainer]]
- [[source-attention-is-all-you-need]]
- [[source-deep-dive-into-llms-like-chatgpt]]
- [[source-cs336-lecture10-inference]]
- [[source-speculative-decoding]]
- [[source-cs336-lecture11-scaling-laws]]
- [[source-promptingguide-research-groq]]
- [[source-promptingguide-research-infini-attention]]
- [[source-cs336-lecture01-overview-tokenization]]
- [[source-cs336-lecture02-pytorch-resource-accounting]]
- [[source-cs336-lecture04-attention-moe]]
- [[source-cs336-lecture05-gpus-tpus]]

## Synthesis

- [[context-engineering-thesis]] — how decoding arithmetic sets the price of every context decision

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
