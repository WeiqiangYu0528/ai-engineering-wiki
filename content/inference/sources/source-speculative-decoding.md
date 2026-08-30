---
type: source-summary
title: "Fast Inference from Transformers via Speculative Decoding"
summary: The November 2022 Google paper (Leviathan et al. 2211.17192; expanded Chen et al. 2302.01318, May 2023) introduces speculative decoding — a lossless acceleration for autoregressive Transformers.
status: verified
visibility: public
author: "Charlie Chen, Sebastian Borgeaud, Geoffrey Irving, Jean-Baptiste Lespiau, Laurent Sifre, John Jumper (Google / DeepMind) — Leviathan, Kalman, Matias (Google Research)"
source-type: paper
url: "https://arxiv.org/abs/2211.17192"
date-published: 2022-11-30
date-ingested: 2026-08-25
tags:
  - inference
  - llm-fundamentals
key-concepts:
  - "[[inference]]"
  - "[[transformer]]"
  - "[[decoding-strategies]]"
  - "[[self-attention]]"
key-entities:
  - "[[google-research]]"
  - "[[deepmind]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-speculative-decoding
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The November 2022 Google paper (Leviathan et al. 2211.17192; expanded Chen et al. 2302.01318, May 2023) introduces speculative decoding — a lossless acceleration for autoregressive Transformers.</p>
<p class="kb-provenance">Charlie Chen, Sebastian Borgeaud, Geoffrey Irving, Jean-Baptiste Lespiau, Laurent Sifre, John Jumper (Google / DeepMind) — Leviathan, Kalman, Matias (Google Research), 2022-11-30. <a href="https://arxiv.org/abs/2211.17192">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
The **November 2022 Google paper (Leviathan et al. 2211.17192; expanded Chen et al. 2302.01318, May 2023)** introduces **speculative decoding** — a lossless acceleration for autoregressive [[transformer]]s. By **drafting γ tokens with a cheap approximation model M_q (e.g., 6M–77M)** and **verifying them in parallel with the target model M_p (97M–137B)** via a novel **speculative sampling** (accept if q≤p, else reject stochastically 1-p/q and resample from `norm(max(0,p−q))`), the method preserves the **exact output distribution** while reducing serial M_p calls from K to ~K/α. On **T5-XXL 11B → EnDe translation & CNNDM summarization** on TPU-v4, T5-small (77M) as draft yields **2.6× (temp=1) / 3.4× (temp=0) walltime speedup** with identical outputs; theory predicts `(1-α^{γ+1})/( (1-α)(γc+1) )` improvement dependent on acceptance rate α and cost coefficient c.

## Key Takeaways
1. **Stochastic speculative execution**: Generalizes CPU branch prediction to stochastic setting. Two-model loop: **(i) draft**: M_q autoregressively samples γ guesses x₁..γ with distributions q_i; **(ii) verify**: M_p evaluates p₁.._{γ+1} in parallel on all prefixes (single batched forward); **(iii) accept**: for i=1..γ, sample u~U(0,1), accept while u ≤ p_i/q_i; first reject → discard trailing guesses and resample corrective token from adjusted distribution `p' = norm(max(0, p_{n+1}−q_{n+1}))`; if all accepted, sample extra token from p_{γ+1}. Produces **1 to γ+1 tokens per serial M_p call**, never worse than baseline (≥1).
2. **Distribution-preserving proof (Appendix A.1)**: For any p,q, speculative sampling returns x∼p exactly. Standardizes all sampling modes (argmax/top-k/top-p/temperature) into adjusted p,q before algorithm, so guarantee holds uniformly — unlike early-exit/adaptive compute that changes outputs.
3. **Theory: α = 1 − D_LK**: Acceptance rate β = Σ min(p,q) = 1 − D_LK(p,q) where D_LK= Σ|p−M|, M=(p+q)/2 ∈[0,1]; α=E[β] ≈ E[min(p,q)]. Under i.i.d. β, **expected tokens per run = (1−α^{γ+1})/(1−α)** (capped geometric). Walltime improvement = ` / (γc+1)` (Theorem 3.8); increase in total ops = `(1−α)(γĉ+γ+1)/(1−α^{γ+1})` but memory reads ↓ by tokens factor (KV cache/weights read once per run).
4. **Arithmetic vs walltime trade-off**: Concurrency requires γ+1 parallel M_p evaluations → total FLOPs up, but **memory-bandwidth bound decoding** often has spare compute, so walltime ↓. Table 1 illustrates: α=0.8,γ=5 → 3.69× speed at 1.63× ops (c=0); α=0.9,γ=10 → 6.86× at 1.60× ops.
5. **Choosing γ**: Optimal γ* = argmax over integers of improvement expression, solved numerically (Figure 3). Increases with α, decreases with c. Adaptive γ via predicting β could add ~60% over fixed γ (oracle bound 1/(1−α)), future work; hierarchical draft (small drafts small) also proposed.
6. **Empirical α across scales**: With 2-order-magnitude smaller draft, α typically **0.5–0.9**. GPT-like 97M with 6M draft: 0.88–0.89 (unigram/bigram 0.03–0.05). T5-XXL EnDe: T5-small 0.75 (t=0) /0.62 (t=1), bigram 0.19–0.20, unigram 0.07–0.08 (negligible-cost n-grams still give 1.25× at γ=3, c≈0). LaMDA 137B with 100M/2B/8B: 0.61/0.71/0.75 (t=0). **Sharper (t=0) → higher α** consistently.
7. **Approximation model taxonomy (Section 3.6)**: **Off-the-shelf small Transformers** (best 2 orders smaller, same tokenizer, c<0.05), **negligible-cost n-grams/heuristics** (copy from context for summarization/chat, table lookup), **non-autoregressive** (single call), **hierarchical** (draft itself speculatively decoded). No retraining required; custom distillation for α direct optimization future work. Beam search extension (Appendix A.4) discussed.

## Detailed Notes

### Algorithm 1 (SpeculativeDecodingStep)
- Inputs: M_p, M_q, prefix, γ. Steps as above. Parallel verification is single forward with γ+1 prefixes batched — leverages Transformer parallelism.
- Correctness relies on same adjusted distribution contract for both models.

### Analysis Assumptions
- i.i.d. β simplifies expectation; real β varies per position/prefix — adaptive γ would exploit this.
- c = time(q)/time(p) depends on hardware/software; empirically <0.05 for 11B vs 77M on TPU-v4. ĉ = ops-ratio analog for FLOPs accounting.

### Empirical Walltime (T5X TPU-v4, batch 1)
- Table 2 full: EnDe T5-small 3.4× (t=0,γ7,α0.75) best; T5-base 0.8 α but slower due to higher c (2.8×); T5-large 1.7× (c too high). CNNDM slightly lower (2.3×–3.1×). Matches theoretical predictions (Appendix A.3 variance from XLA).

### Related Work Contrast
- Distillation/sparsification/quantization reduce cost for all tokens; early-exit/adaptive compute save ops but change outputs and need retraining. Blockwise Parallel Decoding (Stern 2018) supports only greedy and retrains; Shallow Aggressive Decoding (SAD, Sun 2021) only copies. After publication, independent Chinchilla 70B replication (Chen 2023) confirmed 2–2.5×.

### Limitations & Extensions
- Needs **extra compute** — not helpful when compute-bound. Guarantee requires **distribution standardization** matched between models. KV-cache management for batched verification non-trivial (but weights/cache read once per iteration saves memory bandwidth). Hierarchical and learned draft promising for future.

## Notable Quotes
> "Inference from large autoregressive models like Transformers is slow — decoding K tokens takes K serial runs of the model. ... we can make exact decoding from the large models faster, by running them in parallel on the outputs of the approximation models, potentially generating several tokens concurrently, and without changing the distribution." — Abstract

> "If α > c, there exists γ for which we'll get an improvement." — Corollary 3.9

> "Our method is easy to employ ... doesn't require training new models, and doesn't change the outputs. Therefore, in common situations where memory bandwidth is the bottleneck, and compute resources are available, it may be a good default." — Discussion

> "Even trivial unigram and bigram approximations yield non negligible α values ... bigram ... yields a 1.25X speed improvement, which is surprisingly high for this trivial approximation model." — Section 4.2

## Concepts Introduced or Referenced
- [[inference]] — Prefill vs decode memory-bandwidth bound; KV-cache/cache-read reduction; latency vs throughput trade-off; complementary to Chinchilla compute-optimal serving.
- [[transformer]] — Decoder-only and encoder-decoder (T5) verification parallelism.
- [[decoding-strategies]] — Generalizes greedy/beam/top-p via standardized sampling; preserves stochastic decoding exactly.
- [[self-attention]] — Parallel prefix evaluation exploits attention's O(1) depth.
- [[prompt-caching]] — Analogous prefix-reuse: weights/KV read once per iteration vs per token.
- [[scaling-laws]] — Smaller model efficiency (cf. Chinchilla) now also inference accelerator as draft.

## Critical Assessment
- **Strengths**: Elegant, provably lossless, out-of-the-box with existing checkpoints, 2–3× speedup on production T5X without retraining; thorough theory (α via D_LK, γ optimization) + empirical α catalog across 97M→137B; clarifies when not helpful (compute-bound).
- **Weaknesses**: Assumes **sufficient parallel compute** (γ+1 M_p copies) — on constrained serving (single GPU, large batch) speedup vanishes; α depends heavily on task (translation high, open-ended chat lower) — reported EnDe optimistic; draft and target must share **tokenizer/distribution standardization**; extension to **beam search** left to appendix, not evaluated; does not reduce **total FLOPs** (increases) — cost not free.
- **Relation to later systems**: Direct precursor to **Medusa, Lookahead, EAGLE, Hydra** speculative variants and **Groq LPU** hardware acceleration — often combined (draft = small LM + n-gram cache). Complements [[source-scaling-test-time-compute]] and [[source-deepseek-r1]]: faster test-time reasoning traces amplify thinking-models ROI.
- **No contradiction**: Findings consistent with [[inference]] (memory-bandwidth bound) and Chinchilla: smaller efficient models become both **targets and accelerators**.

---

**Source:** Fast Inference from Transformers via Speculative Decoding by Charlie Chen, Sebastian Borgeaud, Geoffrey Irving, Jean-Baptiste Lespiau, Laurent Sifre, John Jumper (Google / DeepMind) — Leviathan, Kalman, Matias (Google Research) — <https://arxiv.org/abs/2211.17192>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
