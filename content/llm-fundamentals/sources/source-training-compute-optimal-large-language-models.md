---
type: source-summary
title: "Training Compute-Optimal Large Language Models (Chinchilla)"
summary: The landmark March 2022 DeepMind paper by Hoffmann et al. that revised the Scaling Laws for large language models by training over 400 models (70M–16B parameters, 5B–500B tokens) and demonstrating that prior Kaplan…
status: draft
visibility: public
author: "Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, et al. (DeepMind)"
source-type: paper
url: "https://arxiv.org/abs/2203.15556"
date-published: 2022-03-29
date-ingested: 2026-08-24
tags:
  - llm-fundamentals
  - inference
key-concepts:
  - "[[scaling-laws]]"
  - "[[pretraining]]"
  - "[[inference]]"
  - "[[transformer]]"
key-entities:
  - "[[deepmind]]"
  - "[[chinchilla]]"
  - "[[gopher]]"
  - "[[openai]]"
aliases:
  - wiki/source-training-compute-optimal-large-language-models
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The landmark March 2022 DeepMind paper by Hoffmann et al. that revised the Scaling Laws for large language models by training over 400 models (70M–16B parameters, 5B–500B tokens) and demonstrating that prior Kaplan…</p>
<p class="kb-provenance">Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, et al. (DeepMind), 2022-03-29. <a href="https://arxiv.org/abs/2203.15556">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 2 of 57 figures on this page were not found in [https://arxiv.org/abs/2203.15556](https://arxiv.org/abs/2203.15556): `1×10`, `216T`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The landmark March 2022 [[deepmind]] paper by Hoffmann et al. that revised the [[scaling-laws]] for large language models by training **over 400 models** (70M–16B parameters, 5B–500B tokens) and demonstrating that prior Kaplan scaling (2020) had dramatically **underestimated the value of training data**. The authors introduce **Chinchilla (70B parameters, 1.4T tokens)** — trained with the **same compute budget (5.76×10²³ FLOPs) as [[gopher]] (280B, 300B tokens)** but 4× smaller and trained on 4× more data — and show it uniformly outperforms Gopher, GPT-3 (175B), Jurassic-1 (178B), and MT-NLG (530B). Underlying the result is the **Chinchilla scaling law**: for compute-optimal training, model size $N$ and training tokens $D$ should be scaled **equally** ($N_{opt} \propto C^{0.5}, D_{opt} \propto C^{0.5}$), or roughly **20 tokens per parameter**, contrasting with Kaplan's $N \propto C^{0.73}, D \propto C^{0.27}$.

## Key Takeaways
1. **Equal Scaling is Compute-Optimal:** Across three independent estimation methods, the compute-optimal frontier is $N_{opt} \propto C^{0.5}, D_{opt} \propto C^{0.5}$ (Approach 1: 0.50/0.50; Approach 2: 0.49/0.51; Approach 3: 0.46/0.54), versus Kaplan's 0.73/0.27. For a 10× compute increase, both $N$ and $D$ should roughly double — not $N$ 5.5× and $D$ 1.8×.
2. **Current LLMs Are Massively Undertrained:** Extrapolating the frontier, a 175B model like GPT-3 should be trained on 4.2T tokens at 4.41×10²⁴ FLOPs, and a 280B Gopher-like model on 6.8T tokens at ~10²⁵ FLOPs. Pre-Chinchilla models trained on ~300B tokens were optimal for only ~10B–40B parameters.
3. **Three Convergent Estimation Methods:**
   - **Approach 1 (Training Curve Envelope):** Fixed $N$ (70M–10B), vary cosine schedule length 4× per model (16× token range), interpolate loss vs. FLOPs, extract minimal-loss envelope → power-law fit.
   - **Approach 2 (IsoFLOP Profiles):** Fix 9 FLOP budgets (6×10¹⁸–3×10²¹), sweep $N$ up to 16B with $D=C/(6N)$, fit parabola to loss vs. $N$ valley → power-law fit.
   - **Approach 3 (Parametric Fit):** Fit $\hat{L}(N,D)=E + A/N^{\alpha} + B/D^{\beta}$ via Huber loss + L-BFGS; derive closed-form frontier $N_{opt}=G(C/6)^a, D_{opt}=G^{-1}(C/6)^b$ where $a=\beta/(\alpha+\beta)$.
4. **Why Kaplan Was Wrong — Learning Rate Schedule Bug:** Kaplan et al. used a **fixed cosine schedule** (130B token horizon) for all token horizons. Intermediate checkpoints at $D' \ll 130$B therefore overestimate loss (suboptimal decay). Properly matching the cosine cycle ($\approx 10×$ decay over $D$ tokens) reveals data is far more valuable. Using predominantly tiny models (<100M) also hid the negative curvature in the FLOP-loss frontier.
5. **Chinchilla Validation — Smaller Beats Larger at Same Compute:**
   - Architecture: Same as Gopher (80 layers), but AdamW optimizer, no-NFKC SentencePiece (94% vocab overlap), 8192 $d_{model}$ (vs 16384), 64 heads (vs 128), LR 1×10⁻⁴, batch 1.5M→3M tokens.
   - Results: MMLU 67.6% (+7.6% over Gopher, SOTA ahead of 63.4% expert forecast), Pile bpb wins on all subsets, WikiText103 ppl 7.16 vs 7.75, LAMBADA 77.4% vs 74.5%, RACE-h 82.3% vs 71.6%, BIG-bench 65.1% vs 54.4% (+10.7%), TruthfulQA 0-shot 43.6% vs 29.5%, NQ closed-book 35.5% vs 28% SOTA.
6. **Inference and Downstream Amortization:** A compute-optimal smaller model gives **4× smaller memory footprint and inference FLOPs**, critical because pre-training is one-time but inference/fine-tuning cost dominates lifetime compute. This insight drove the industry shift to "overtraining" small models (e.g., Llama 3 8B on 15T tokens) to minimize serving cost.
7. **Dataset Collection is the Bottleneck:** Optimal tokens for frontier models exceed current datasets by an order of magnitude (e.g., 1T model → 21T tokens, 10T model → 216T tokens). The paper validates equal scaling on C4 and GitHub code as well, underscoring that high-quality data acquisition is the primary scaling limiter.

## Detailed Notes

### Problem Formulation
Minimize $L(N,D)$ subject to $\text{FLOPs}(N,D) \approx 6ND = C$, yielding $N_{opt}(C), D_{opt}(C)$. Training loss is an unbiased estimate of test loss in the infinite-data regime ($D <$ corpus size).

### The Three Scaling Exponents (Table 2)

| Approach | $a$ ($N_{opt} \propto C^a$) | $b$ ($D_{opt} \propto C^b$) | 10th–90th percentile (bootstrap) |
|----------|------------------------------|------------------------------|-----------------------------------|
| 1. Training Curve Envelope | 0.50 | 0.50 | (0.488–0.502), (0.501–0.512) |
| 2. IsoFLOP Profiles | 0.49 | 0.51 | (0.462–0.534), (0.483–0.529) |
| 3. Parametric Loss | 0.46 | 0.54 | (0.454–0.455), (0.542–0.543) |
| Kaplan et al. 2020 | 0.73 | 0.27 | — |

The rule-of-thumb **≈20 tokens per parameter** (Chinchilla: 1.4T / 70B = 20) has become the canonical compute-optimal ratio.

### Model and Training Details (Table 4)

| Model | Layers | Heads | $d_{model}$ | Max LR | Batch |
|-------|--------|-------|-------------|--------|-------|
| Gopher 280B | 80 | 128 | 16384 | 4×10⁻⁵ | 3M→6M |
| Chinchilla 70B | 80 | 64 | 8192 | 1×10⁻⁴ | 1.5M→3M |

- Trained on MassiveText (MassiveWeb, Books, C4, News, GitHub, Wikipedia) with rebalanced mixture for longer horizon.
- TPU v3/v4 + JAX + Haiku; float32 optimizer state sharded; bfloat16 forward/backward.

### Evaluation Breadth (Table 5)
- Language Modelling: 20 tasks (WikiText103, Pile: PG-19, arXiv, FreeLaw, etc.)
- Reading Comprehension: LAMBADA, RACE-m/h
- QA: Natural Questions, TriviaQA, TruthfulQA
- Common Sense: HellaSwag, Winogrande, PIQA, SIQA, BoolQ
- MMLU: 57 exam tasks
- BIG-bench: 62 diverse reasoning tasks

### Optimal Cosine Cycle Length (Appendix B)
Critical insight: For a run over $D$ tokens, the cosine schedule should decay 10× over $\approx D$ tokens. All selected optimal points lie within the last 15% of training, validating this.

### Consistency Across Datasets (Appendix C)
IsoFLOP analysis repeated on C4 and GitHub code — same equal scaling, proving generality beyond MassiveText.

### Curvature (Appendix E)
Slight negative curvature in $C \to N_{opt}$: At very large $C$ (>>10²⁵ FLOPs), parametric fit predicts even smaller $N_{opt}$ than envelope methods. Power-law extrapolation many orders beyond data carries uncertainty, but core conclusion (undertrained large models) is robust.

### FLOPs Computation (Appendix F)
$C \approx 6ND$ (Kaplan convention, excludes embeddings and attention quadratic term). The paper details per-operation counts.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 4 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2203.15556](https://arxiv.org/abs/2203.15556)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "We find that for compute-optimal training, the model size and the number of training tokens should be scaled equally: for every doubling of model size the number of training tokens should also be doubled." — Hoffmann et al.

> "We estimate that large models should be trained for many more training tokens than recommended by [Kaplan et al.]... we find that model size and the number of training tokens should be scaled in equal proportions."

The elided middle gives the arithmetic: Kaplan's law implies a 10× compute increase should
buy 5.5× the parameters and only 1.8× the tokens, where this paper finds both should scale
by roughly 3.2× — the disagreement analysed on [[scaling-laws-revisions]].

> "Chinchilla uniformly and significantly outperforms Gopher (280B), GPT-3 (175B), Jurassic-1 (178B), and Megatron-Turing NLG (530B) on a large range of downstream evaluation tasks... Chinchilla uses substantially less compute for fine-tuning and inference, greatly facilitating downstream usage."

> "This suggests that the performance of language models may be more dependent on the size of the training data than previously thought."

## Concepts Introduced or Referenced
- [[scaling-laws]] — Core revision: Kaplan → Chinchilla equal scaling; three estimation methods; parametric loss $\hat{L}(N,D)$ and efficient frontier derivation.
- [[pretraining]] — Compute-optimal token budgeting; 20 tokens/param rule; MassiveText dataset mixture and 1.4T token regime; undertraining diagnosis.
- [[inference]] — Inference-cost amortization; 4× smaller model → proportional memory/compute savings for serving and fine-tuning.
- [[transformer]] — Decoder-only architecture scaling; 80-layer Chinchilla/Gopher configs; underlies FLOPs counting.

## Critical Assessment
- **Strengths:** Exceptional empirical rigor — 400+ models, three independent statistical methods converging, tested on two additional datasets (C4, GitHub). Clean identification of Kaplan's methodological artifact (fixed LR schedule) and direct validation via Chinchilla, which matched a 4× larger model at same compute with only optimizer/tokenizer changes. Highly actionable — gave the field a quantitative target (20 tok/param) and justified large-scale data pipelines.
- **Limitations / Nuances:**
  - Leakage concern: Language modelling gains on The Pile/Wiki may be inflated by 4× more data exposure; authors appropriately emphasize downstream tasks (MMLU, BIG-bench, QA) where leakage is minimal.
  - Parametric fit uncertainty at low FLOPs (C ≤ 1e21 residuals larger; Huber downweights) and negative curvature means extrapolation to 100× Gopher compute (10²⁶ FLOPs) is tentative — Table 3's 1T/21T token projections are order-of-magnitude.
  - Training details differ between Chinchilla and Gopher (AdamW vs Adam, tokenizer) — Appendix G ablates but does not fully isolate scaling vs optimizer effect.
  - Single epoch assumption: Analysis assumes $D <$ dataset size (infinite-data regime, no deduplication penalty); real 1.4T+ runs must handle multi-epoch effects and data quality filtering — later work (Llama, FineWeb) explored this.
- **Contradictions with Existing Wiki Content:** Prior [[scaling-laws]] page summarized the Chinchilla correction but lacked the three-method breakdown, exponent table with confidence intervals, parametric form derivation, and inference-amortization framing. This source supersedes the Kaplan-centric allocation and should be merged with the existing Kaplan source as the dual history of scaling laws.
- **What This Source Misses:** No discussion of post-Chinchilla "overtraining" beyond compute-optimal (deliberately training past the frontier to minimize inference cost, e.g., Llama 3) nor of multi-epoch / data-constrained scaling laws — both important extensions after 2022.

---

**Source:** Training Compute-Optimal Large Language Models (Chinchilla) by Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, et al. (DeepMind) — <https://arxiv.org/abs/2203.15556>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
