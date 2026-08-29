---
type: source-summary
title: "CS336 Lecture 02 — PyTorch (einops), Resource Accounting (FLOPs, Memory, Arithmetic Intensity)"
summary: "Lecture 02 (lecture02.py, 856 lines, April 1) gives the resource-accounting mental model for LLM systems: everything is operations on tensors (parameters, gradients, activations, optimizer states, data)."
status: draft
visibility: public
author: "Percy Liang"
source-type: article
url: "https://cs336.stanford.edu/lectures/?trace=lecture_02"
date-published: 2026-04-01
date-ingested: 2026-08-26
tags:
  - llm-fundamentals
  - inference
  - mlops
key-concepts:
  - "[[inference]]"
  - "[[transformer]]"
  - "[[pretraining]]"
  - "[[scaling-laws]]"
key-entities:
  - "[[stanford-university]]"
aliases:
  - wiki/source-cs336-lecture02-pytorch-resource-accounting
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Lecture 02 (lecture02.py, 856 lines, April 1) gives the resource-accounting mental model for LLM systems: everything is operations on tensors (parameters, gradients, activations, optimizer states, data).</p>
<p class="kb-provenance">Percy Liang, 2026-04-01. <a href="https://cs336.stanford.edu/lectures/?trace=lecture_02">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary
Lecture 02 (`lecture_02.py`, 856 lines, April 1) gives the **resource-accounting mental model** for LLM systems: everything is operations on tensors (parameters, gradients, activations, optimizer states, data). Via PyTorch semantics + `einops` (`rearrange`/`einsum`/`reduce`) it derives the $6ND$ training FLOPs rule, separates **FLOPs vs FLOP/s** and **MFU**, and introduces **arithmetic intensity / roofline** to decide compute- vs memory-boundness. Memory accounting (bf16 params, fp32 optimizer states, activation scaling with $B$) leads to practical optimizations: **gradient accumulation** and **activation checkpointing** (rematerialization). Raw preserved at [https://cs336.stanford.edu/lectures/?trace=lecture_02](https://cs336.stanford.edu/lectures/?trace=lecture_02) (trace + recording version at `?trace=lecture_02_recording`).

## Key Takeaways
1. **Tensors as accounting primitive.** Memory: `numel × bytes_per_dtype` (bf16=2B, fp32=4B). All training memory partitions as `params + grads + optimizer_states + activations`; activations scale as $2BDL$ (bf16) for $L$ layers.
2. **FLOPs accounting is simple and predictive.** Matmul $x_{B×D} @ W_{D×K}$ costs $2BDK$ FLOPs (mul+add per triple). Training cost ≈ $2ND$ (forward) + $4ND$ (backward) = $6ND$ for $N$ params × $D$ tokens — good approximation for short-context Transformers.
3. **FLOP/s vs MFU grounds hardware claims.** H100 peak ~1979 TFLOP/s with sparsity → ~989 TFLOP/s dense bf16; observed `actual_FLOP/s = FLOPs / time`; `MFU = actual/promised` typically ≥0.5 is good — gap explained by memory movement, kernel launch overhead, communication.
4. **Arithmetic intensity / roofline is the decision framework.** Model: copy HBM→SM, compute, copy back. Intensity = FLOPs / bytes. Matmuls are **compute-bound** (high intensity), elementwise (ReLU/GELU) and reductions are **memory-bound** (intensity 4–8 bytes/FLOP in fp16). Roofline plot shows where optimizations apply.
5. **Two memory-vs-compute trades dominate practice.** Gradient accumulation: shard a large batch into micro-batches to keep activation memory $2×$ micro_bs $×D×L$ small while simulating large-batch stability. Activation checkpointing (via `torch.utils.checkpoint`): keep $O(\sqrt{L})$ checkpoints, recompute rest — converts $O(L)$ memory to $O(\sqrt{L})$ at $O(L)$ extra compute (no-storage $O(1)/O(L^2)$ extremes noted).

## Detailed Notes

### Motivation and setup
- Announcement context: Marin 1e23 FLOPs run matched Chinchilla forecasts — live validation of scaling law predictability.
- framing: "What's the best model given fixed resources?" → prerequisite is measuring resources correctly.

### Tensors — memory accounting
- `tensors_basics()`: torch tensor shapes, dtypes, device placement semantics.
- `tensors_memory()`: `parameter_memory = 2×N` (bf16), `gradient_memory = 2×N`, `optimizer_state_memory = 4×N` (AdaGrad) / $8×N$ (Adam first+second moments, fp32 for stability), `activation_memory = 2×B×D×L`. Example $B=2,D=4,L=3$ worked through with `state_dict()` inspection.
- `tensors_on_gpus()`: moving tensors to `cuda_if_available()`, `get_max_memory_usage()` profiling, multi-GPU considerations deferred to parallelism lectures.

### Einops as thinking tool
- `tensor_einops()` → `einops_motivation / einsum / reduce / rearrange`: replaces `view/permute/matmul` spaghetti with explicit index notation: `einsum(x,w,"batch in, in out -> batch out")`. Improves correctness and FLOP counting readability (used later for `h1.grad = einsum(h2.grad,w2,"batch out, in out -> batch in")` verification via `allclose`).

### FLOPs
- `tensor_operations_flops()`: defines FLOP vs FLOP/s confusion; GPT-3 3.14e23, GPT-4 ~2e25; 8×H100×2 weeks = $8×1.2×10^6s×989$ TFLOP/s ≈ $9.5×10^{21}$ FLOPs example.
- Linear model demo $B=1024,D=256,K=64$ (or $16384×32768×8192$ on GPU): `actual_num_flops = 2×B×D×K`, timed via `benchmark(lambda:x@w)`, MFU computed.
- `gradients_flops()`: zoom on `h2=h1@w2` — forward $2B D^2$, backward $2B D^2$ for $∂L/∂h1$ + $2B D^2$ for $∂L/∂w2$ = $4B D^2$ = 2× forward. Extension: full MLP → $6ND$ total. Noted approximation holds for Transformers at short contexts (long contexts add $O(N^2 d)$ attention term).

### Arithmetic intensity & roofline
- `arithmetic_intensity()`: three-step model (HBM→SM→HBM), H100 constants $989$ TFLOP/s, $3.35$ TB/s.
- Worked intensities: ReLU elementwise 8 B/FLOP fp32 → 4 B/FLOP fp16; GELU similar; dot $n$; matvec; matmul (large $B,D,K$ → high intensity). Low intensity ⇒ memory-bandwidth wall; half precision doubles intensity for elementwise ops.
- `roofline_plots()`: visualize knee where intensity × bandwidth = peak FLOPs; guides whether to fuse operators or tile.

### Training loop accounting
- `deep_network()`: `DeepNetwork` $L=3,D=8$ with `Block: x@W → ReLU` — minimal matmul + activation to make accounting concrete.
- `gradients_basics()` + `optimizer()` (AdaGrad detailed): per-param state `g2 = Σ g_i^2`, `p -= lr*g/√(g2+ε)`; memory table above; noted Adam = AdaGrad(RMSProp)+momentum → $8×N$ bytes.
- `train_loop()`: forward → loss → backward → optimizer step → zero grad; total memory = sum partitions; compute = $6BN$ per step; pointers to Transformer-specific accounting blogs (erees.dev, adamcasson.com).
- `gradient_accumulation()` + `activation_checkpointing()`: see takeaways; checkpointed model `DeepNetworkCheckpointed` wraps each layer in `torch.utils.checkpoint.checkpoint(layer,x)`; trade-off curve $L$ stored → $O(L)$ mem / $O(L)$ compute vs $0$ stored → $O(1)$/$O(L^2)$ vs $\sqrt{L}$ stored → $O(\sqrt{L})$ / $O(L)$ recompute.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 3 passages in this section could not be located in the stored source ([https://cs336.stanford.edu/lectures/?trace=lecture_02](https://cs336.stanford.edu/lectures/?trace=lecture_02)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Everything is operations on tensors (parameters, gradients, activations, optimizer states, data). einops: better way to think about tensor operations." — lecture summary

> "6 (# data points)(# parameters) FLOPs per training step — for MLPs, but a good approximation for Transformers for short context lengths as well." — `gradients_flops()`

> "Philosophy: tradeoff memory for compute — activation checkpointing." — `activation_checkpointing()`

## Concepts Introduced or Referenced
- [[inference]] — Prefill vs decode phases previewed; roofline explains why decode is memory-bound (see [[transformer]] attention).
- [[transformer]] — Deep network as proxy; Transformer FLOP accounting more complex but same $6ND$ heuristic at short contexts.
- [[scaling-laws]] — Kaplan/Chinchilla $C=6ND$ bridge — lecture derives the $6$ from first principles.
- [[pretraining]] — Per-step FLOPs and memory determine feasible batch size / context length / model size for a given HBM budget.
- [[self-attention]] — Intensity analysis explains why large matmuls are compute-bound while attention softmax/reductions risk memory-boundedness.

## Critical Assessment
- **Strength:** Blends *mechanics* (executable PyTorch/einops), *mindset* (always do accounting), and *intuition* (which ops dominate). The `h1.grad == einsum(h2.grad,w2)` assertion grounds the 2× backward heuristic in verifiable code.
- **Systems lens for wiki:** Existing [[inference]] and [[scaling-laws]] pages state $6ND$ but don't derive it from matmul triples or connect to HBM vs SRAM movement — this lecture provides the derivation that makes Chinchilla's $D=20N$ actionable under real memory budgets.
- **Limitation:** Transformer-specific details (attention $O(N^2)$, KV cache, GQA, sequence parallelism) are deferred to Lectures 03–05 and assignment resources (linked blogs); checkpointing analysis is asymptotic ($O(\sqrt{L})$) without concrete wall-clock numbers on B200/MI300.
- **Forward relevance:** Directly motivates Lecture 03's architecture tweaks (SwiGLU/RoPE trade FLOPs for memory), Lecture 05's GPU memory hierarchy + FlashAttention (fusion/tiling), and Assignment 2's Triton RMSNorm + DDP + optimizer sharding.

---

**Source:** CS336 Lecture 02 — PyTorch (einops), Resource Accounting (FLOPs, Memory, Arithmetic Intensity) by Percy Liang — <https://cs336.stanford.edu/lectures/?trace=lecture_02>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
