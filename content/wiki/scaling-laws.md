---
type: concept
title: "Scaling Laws"
summary: Scaling Laws describe the empirical mathematical relationships governing how language model performance (measured by cross-entropy validation loss $\mathcal{L}$) improves predictably as a power-law function of three…
visibility: public
aliases:
  - "Neural Scaling Laws"
  - "Compute Scaling"
  - "Chinchilla Scaling"
  - "Kaplan Scaling"
  - "Compute-Optimal Scaling"
tags:
  - llm-fundamentals
created: 2026-08-23
updated: 2026-08-26
status: draft
sources:
  - "[[source-scaling-laws-for-neural-language-models]]"
  - "[[source-training-compute-optimal-large-language-models]]"
  - "[[source-language-models-are-few-shot-learners]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "[[source-cs336-lecture09-scaling-laws]]"
  - "[[source-cs336-lecture11-scaling-laws]]"
related:
  - "[[pretraining]]"
  - "[[in-context-learning]]"
  - "[[thinking-models]]"
  - "[[inference]]"
  - "[[chinchilla]]"
  - "[[gopher]]"
  - "[[lora]]"
  - "[[evaluation]]"
  - "[[scaling-laws-revisions]]"
---

# Scaling Laws

## Overview
**Scaling Laws** describe the empirical mathematical relationships governing how language model performance (measured by cross-entropy validation loss $\mathcal{L}$) improves predictably as a power-law function of three fundamental axes: **compute budget ($C$)**, **parameter count ($N$)**, and **dataset size in tokens ($D$)**. First systematically established by Jared Kaplan et al. (2020) at [[openai]] in [[source-scaling-laws-for-neural-language-models]], and fundamentally revised by Hoffmann et al. (2022) at [[deepmind]] in [[source-training-compute-optimal-large-language-models]] (the **Chinchilla** paper), scaling laws provide the foundational engineering framework for sizing, training, and deploying modern frontier LLMs. The central question they answer is: *Given a fixed FLOPs budget $C \approx 6ND$, how should one trade off $N$ vs. $D$ to minimize loss $L(N,D)$?*

## Key Ideas

### 1. The Core Power-Law Formulations
When unconstrained by the other two bottlenecks, test cross-entropy loss $\mathcal{L}$ follows smooth power laws spanning more than six orders of magnitude:
- **Parameter Scaling ($N$):** $\mathcal{L}(N) \approx \left(\frac{N_c}{N}\right)^{\alpha_N} \quad (\alpha_N \approx 0.076, N_c \approx 8.8 \times 10^{13})$
- **Dataset Scaling ($D$):** $\mathcal{L}(D) \approx \left(\frac{D_c}{D}\right)^{\alpha_D} \quad (\alpha_D \approx 0.095, D_c \approx 5.4 \times 10^{13})$
- **Compute Scaling ($C$):** $\mathcal{L}(C) \approx \left(\frac{C_c}{C}\right)^{\alpha_C} \quad (\alpha_C \approx 0.050, C_c \approx 3.1 \times 10^8 \text{ PF-days})$

The unified Kaplan form $L(N,D) = \left[\left(\frac{N_c}{N}\right)^{\alpha_N/\alpha_D} + \frac{D_c}{D}\right]^{\alpha_D}$ captures the $N$–$D$ trade-off and implies $D \propto N^{0.74}$ to avoid overfitting — but underestimates data value.

### 2. Architectural Invariance (Scale Over Shape)
Within broad operational ranges, language model performance is governed primarily by scale ($N, D, C$) rather than architectural details. Varying network depth vs. width, feed-forward dimension ratios, or attention heads produces negligible differences in cross-entropy loss compared to the total non-embedding parameter count.

### 3. Sample Efficiency of Scale
Larger models reach any given loss threshold with fewer optimization steps and fewer data tokens than smaller models. In a compute-limited regime, training a larger model on fewer tokens is more compute-efficient than training a smaller model to convergence.

### 4. Kaplan vs. Chinchilla Scaling Allocation

| Regime | $N_{opt} \propto C^a$ | $D_{opt} \propto C^b$ | Implication for 10× compute |
|--------|----------------------|----------------------|-----------------------------|
| **Kaplan (2020)** [[source-scaling-laws-for-neural-language-models]] | $a = 0.73$ | $b = 0.27$ | $N$ ×5.5, $D$ ×1.8 |
| **Chinchilla Approach 1** (envelope) [[source-training-compute-optimal-large-language-models]] | $a = 0.50$ (0.488–0.502) | $b = 0.50$ (0.501–0.512) | $N$ ×3.2, $D$ ×3.2 |
| **Chinchilla Approach 2** (IsoFLOP) | $a = 0.49$ (0.462–0.534) | $b = 0.51$ (0.483–0.529) | Equal scaling |
| **Chinchilla Approach 3** (parametric) | $a = 0.46$ (0.454–0.455) | $b = 0.54$ (0.542–0.543) | $N$ slightly slower |

**Chinchilla's core result:** Parameters and data should be scaled **equally** ($1\!:\!1$, $\approx 20$ tokens per parameter). For every doubling of model size, double the training tokens. Pre-Chinchilla models like GPT-3 (175B/300B) and [[gopher]] (280B/300B) were therefore dramatically **undertrained** — a 175B model is compute-optimal at ~4.2T tokens and 4.41×10²⁴ FLOPs, not 300B tokens.

**Why Kaplan was wrong:** Kaplan et al. held the **cosine LR schedule fixed** (130B horizon) for all runs and used intermediate checkpoints to estimate loss at smaller $D'$. Those checkpoints are overestimates because a schedule tuned to $D'$ (10× decay over exactly $D'$ tokens) achieves lower final loss. The paper also relied on many tiny models (<100M) where the FLOP-loss frontier shows negative curvature hidden at larger scales (Appendix E of [[source-training-compute-optimal-large-language-models]]).

### 5. The Three Chinchilla Estimation Methods

All methods in [[source-training-compute-optimal-large-language-models]] used 400+ models (70M–16B parameters, 5B–500B tokens) and converged on equal scaling:

- **Approach 1 — Training Curve Envelope:** Fix $N$ (70M–10B), train each for 4 cosine horizons (16× token range), smooth & interpolate loss vs FLOPs, extract the lower envelope (minimal loss per FLOP at 1500 log-spaced points), fit $N_{opt}, D_{opt}$ power laws. All optimal points lie within last 15% of training, confirming cosine length $\approx D$ is optimal.
- **Approach 2 — IsoFLOP Profiles:** Fix 9 FLOP budgets (6×10¹⁸–3×10²¹), sweep $N$ up to 16B with $D=C/(6N)$ and matched cosine length, plot final loss vs $\log N$, fit parabola to find valley minimum per budget, then power-law fit.
- **Approach 3 — Parametric Loss:** Fit $\hat{L}(N,D)=E + A/N^{\alpha} + B/D^{\beta}$ via Huber loss ($\delta=10^{-3}$) + L-BFGS over all runs. $E$ is the entropy of natural text, $A/N^{\alpha}$ the finite-capacity gap, $B/D^{\beta}$ the finite-data gap. The efficient frontier minimizes $\hat{L}$ subject to $6ND=C$, yielding closed form $N_{opt}=G(C/6)^a$, $D_{opt}=G^{-1}(C/6)^b$ with $G=(\alpha A/\beta B)^{1/(\alpha+\beta)}$, $a=\beta/(\alpha+\beta)$, $b=\alpha/(\alpha+\beta)$. Huber downweights low-FLOP outliers; the method predicts $N_{opt}=40$B at Gopher FLOPs (vs 67B for Approach 1) due to negative curvature.

### 6. Chinchilla Validation (70B / 1.4T vs Gopher 280B / 300B)

Trained at the **same compute** ($5.76×10^{23}$ FLOPs) on MassiveText with AdamW, improved SentencePiece (no NFKC), 80 layers, $d_{model}=8192$:

- **MMLU 5-shot:** 67.6% vs Gopher 60.0% (+7.6%, SOTA; beats 63.4% expert forecast for June 2023), >90% on 4/57 tasks
- **Pile bpb:** wins on all 20 subsets vs Gopher; beats Jurassic-1 178B on 18/20
- **BIG-bench:** 65.1% vs Gopher 54.4% (+10.7%, wins 58/62 tasks)
- **LAMBADA:** 77.4% vs 74.5%; RACE-h 82.3% vs 71.6%; TruthfulQA 0-shot 43.6% vs 29.5%
- At 4× smaller, Chinchilla also gives 4× lower inference memory/FLOPs — a dominant factor in lifetime cost (see [[inference]]).

### 7. Critical Batch Size ($B_{\text{crit}}$)
The critical batch size scales inversely with loss ($B_{\text{crit}} \propto \mathcal{L}^{-1/\alpha_B}$). As loss decreases, larger batch sizes (1M to 4M+ tokens per step) can be processed in parallel across GPU clusters without degrading sample efficiency.

### 8. Test-Time / Inference Compute Scaling
Modern reasoning models ([[thinking-models]]) extend scaling laws beyond pretraining into test-time compute: scaling the number of internal reasoning/deliberation tokens during [[inference]] yields logarithmic gains in complex math, coding, and logical reasoning benchmarks.

## How It Works
```
Compute Budget C (FLOPs ≈ 6ND)
       │
       ├──────────────────────────────┬──────────────────────────────┐
       ▼                              ▼                              ▼
Model Parameters N             Dataset Tokens D               Batch Size B_crit
(N ∝ C^0.5 / Chinchilla)       (D ∝ C^0.5 / Chinchilla)       (Scales with 1/Loss)
       │                              │                              │
       └──────────────────────────────┴──────────────────────────────┘
                                      │
                                      ▼
                         Power-Law Loss Reduction
          L̂(N,D) = E + A/N^α + B/D^β   (Chinchilla parametric form)
          Efficient frontier: N_opt = G(C/6)^a , D_opt = G⁻¹(C/6)^b
                                      │
               ┌──────────────────────┼──────────────────────┐
               ▼                      ▼                      ▼
        MMLU / BIG-bench      Emergent ICL           Inference cost
        (Chinchilla +7-10%)   in [[in-context-learning]]  (4× smaller → cheaper)
```

**Step-by-step estimation (Chinchilla workflow):**
1. Sweep $N$ (70M–16B) and $D$ (5B–500B) at multiple cosine horizons matched to $D$.
2. For each run, record smoothed training loss $L(N,D)$ at final FLOPs $C=6ND$.
3. *Approach 1:* Interpolate loss vs $C$ per $N$, take minimal envelope. *Approach 2:* Fix $C$, find valley in $L$ vs $N$. *Approach 3:* Fit $\hat{L}(N,D)$ globally.
4. Fit $N_{opt}(C) \propto C^a$, $D_{opt}(C) \propto C^b$ (bootstrap for confidence intervals).
5. Validate by training the predicted-optimal [[chinchilla]] and comparing to oversized [[gopher]] at same $C$.

## Practical Implications
- **Predictable CapEx Allocation:** Frontier labs can train small pilot models (1M to 1B parameters) and extrapolate loss curves to accurately forecast the performance of \$100M+ training runs before allocating compute clusters. Table 3 of [[source-training-compute-optimal-large-language-models]] gives anchor points: 10B → 205B tokens at 1.23×10²² FLOPs, 67B → 1.5T tokens at 5.76×10²³ FLOPs (=1× Gopher), 1T → 21.2T tokens at 1.27×10²⁶ FLOPs.
- **Dataset Collection is the Primary Bottleneck:** Compute-optimal training for a 520B model already requires 11T tokens and 3.43×10²⁵ FLOPs (59.5× Gopher); a 10T model would need 216T tokens. This shifted industry investment from pure parameter scaling to massive high-quality data pipelines (FineWeb, DCLM, MassiveText with rebalanced mixtures).
- **Inference Optimization & Overtraining:** Deploying models at scale heavily penalizes per-token inference costs. "Overtraining" smaller models (e.g. Llama 3 8B on 15T tokens, or [[chinchilla]] 70B on 1.4T tokens) pushes them past the Chinchilla compute-optimal point (20 tok/param) to minimize downstream serving expenses. Because Chinchilla matches a 280B Gopher at 4× less inference FLOPs/memory, the lifetime compute amortization (training once, serving billions of times) overwhelmingly favors compute-optimal or overtrained small models.
- **LR Schedule Matters:** Always match the cosine decay horizon to the planned token budget $D$ (10× decay over $\approx D$ tokens). Using a fixed long schedule underestimates data efficiency and biases scaling studies toward oversized models — the central methodological lesson of the paper.

## CS336 Systems Scaling Perspective (Lectures 09 & 11)

> Synthesized from [[source-cs336-lecture09-scaling-laws]] (Basics, Apr 27) and [[source-cs336-lecture11-scaling-laws]] (Case Studies, May 4) — the systems-oriented complement to Kaplan/Chinchilla papers in [[source-scaling-laws-for-neural-language-models]] and [[source-training-compute-optimal-large-language-models]].

### FLOPs Accounting & Why Data Scaling Precedes Model Scaling

CS336 anchors all tradeoffs in **`C ≈ 6ND` FLOPs** (forward 2ND + backward 4ND). Lecture 09 traces *data-only* scaling before *model* scaling: Banko & Brill (2001) log-linear, Kolachina (2012) downstream power laws, **Hestness et al. 2017** (LM/MT/speech predictable, foreshadowing emergence and compute scaling). The theoretical bridge uses a mean-estimation toy `E[(μ̂-μ)²]=σ²/n → log Error=-log n + const` (any `1/n^α` is a law) and a **nonparametric construction** partitioning a 2D box into `n^{1/4}` cells → `Error≈1/√n`, generalizing to `n^{-1/d}` in `d` dims. This links Bahri's intrinsic-dimension hypothesis `α≈1/d_intrinsic` to observed shallow slopes (≈0.07–0.095 vs classical `-1`). Data-mixture and distribution-shift (Hashimoto 2021, data-mixture lessons echoed in Lecture 11's Hunyuan/LLaMA 3 notes) affect *offset* not *slope*; repetition is governed by effective data `D' (D_u, R_d*, R_d)` — repeated tokens have diminishing returns (Lecture 09 slides 24–26).

### Chinchilla vs CS336 Scaling — Three Methods, One Correction

Lecture 09 re-derives the **Kaplan `N_opt∝C^{0.73}, D_opt∝C^{0.27}` vs Chinchilla `N∝C^{0.5}, D∝C^{0.5}` (20 tok/param)** dispute via three fitting procedures also documented in [[source-training-compute-optimal-large-language-models]]: **M1 lower envelope** over `C=6ND`, **M2 IsoFLOP** convex valleys (9 budgets `6×10¹⁸–3×10²¹`), **M3 parametric `L̂=E+A/N^α+B/D^β` (Huber + L-BFGS) → `N_opt=G(C/6)^a`**. CS336 adds the *why* behind divergence: Kaplan's fixed 130B-horizon cosine schedule, non-embedding vs embedding counting, and small-model negative curvature (hidden at scale) — and the forensic amendment **Besiroglu et al. 2024**: raw-data re-fit pushes M3 toward M1/M2 (M3's `N_opt=40B` at Gopher FLOPs vs 67B for M1 is curvature artifact). **IsoFLOPs everywhere** is the modern pattern: MoE (Abnar 2025), diffusion (Gulrajani 2023), Hunyuan (96:1), LLaMA 3 (39:1) all replicate clean IsoFLOP power laws.

### Train-Optimal ≠ Deploy-Optimal — Inference Amortization

The canonical Chinchilla validation (70B/1.4T beats 280B/300B at `5.76×10²³` FLOPs) is re-framed in CS336 as a *lifetime* trade: training cost `6ND` (once) vs serving cost `2NY·D_inference`. Hence modern labs **overtrain**: GPT-3 2 → Chinchilla 20 → LLaMA 65B 22 → 2 70B 29 → Mistral 7B 110 → LLaMA 3 70B 215 tok/param (Lecture 09 slide 54). Lecture 11's case studies validate: **MiniCPM** (WSD joint-fit) and **LLaMA 3** both land on very high `D/N` favoring inference amortization (see [[inference]]).

### Scaling Hyperparameters — Critical Batch, Depth/Width, and Architecture Invariance

Lecture 09 shows *hyperparameter scaling is itself a scaling law*:
- **Critical batch `B_crit↑ as L↓`** — solve `S_min, E_min` frontier (≈2× steps/passes optimum, ≈ `trace(Cov)/‖grad‖²`).
- **Depth/width**: 1→2 layers huge, then diminishing <10⁷ params; aspect ratio / head count largely invariant — but **embedding params don't count** like transformer params (MoE caveat).
- **Architecture (Transformer vs LSTM, Tay 2022) & optimizer (Adam vs SGD, Hestness 2017)** gaps are *predictable* power-law envelopes, motivating the design procedure *train small → fit law → pick optimum*.

### From Laws to Recipes — WSD Schedules, µP, and Modern Practice (Lecture 11 Deep Dive)

Lecture 11 turns laws into **actionable 2024–2026 recipes**:

- **MiniCPM vs DeepSeek contrast**: *MiniCPM* embraces **µP** (`scale_emb 12, scale_depth 1.4, init_std 0.1, LR 0.01`, aspect ratio fixed) → LR flat vs width, batch poly vs loss, then **WSD (Warmup-Stable-Decay, ≈10% decay)** to make Chinchilla sweeps `O(n)→O(n²)`-cheaper via stable-phase restart; *DeepSeek* (7B/67B, no µP) directly fits LR/batch from 0.25%-near-optimal small runs and WSD variant (fast warmup + two 10% decays) → IsoFLOP M2 for `N/D` with accurate loss prediction.
- **WSD rationale**: cosine needs from-scratch per `D`; WSD's stable plateau lets one run sample many `D` by early-decaying at different points — deployed by MiniCPM, DeepSeek, StepFun, and implicitly by Qwen/Kimi/LLaMA 3/Hunyuan.
- **µP derivation (µP for babies)**: For width `n_l`, conditions A1 (`‖h_l‖=Θ(√n_l)` at init) and A2 (`‖Δh_l‖=Θ(√n_l)` after step) with `W_l∼N(0,σ²)` → `σ=Θ(1/√n_{l-1}·min(1,√(n_l/n_{l-1})))` (from `‖W‖_*≈σ(√n_{l-1}+√n_l)`) and `η_l=Θ(n_l/n_{l-1})` (SGD; Adam `‖ΔW‖_*∝η_l`). Validated flat-LR vs SP drift (slide 52). **Fragilities**: breaks on *learnable RMSNorm gains* (remove gain, little loss), *Lion/sign-based optimizers*, *strong WD 0.1*; robust otherwise — CerebrasGPT 0.1–13B confirms stability.
- **StepFun 2025 optimizer scaling audit**: `loss(B,LR)` convex; `B_opt∝D^β` (primarily `D`, not `N`), `LR_opt↑ with D` (fragile under WSD per InternLM 2026); confirms scale-dependence is major confounder and apparent speedups can "look good then blow up" (Held Delphi example: cautious Adam+√B LR scaling).
- **Muon**: Newton-Schulz orthogonalized `B_t=USVᵀ→UVᵀ` for matrix params; NanoGPT speedrun + Kimi K2 adoption shows scale viability.

Together, the CS336 view is: **assume invariance or enforce it via µP, sweep LR/batch early, use IsoFLOP+WSD to pick N/D, and overtrain for inference** — versus the paper view that treats scaling as descriptive fitting.

## Open Questions
- Does the slight negative curvature in the $C \to N_{opt}$ frontier (Appendix E) imply that at extreme compute (>10²⁶ FLOPs) the optimal $N$ grows even slower than $C^{0.5}$? Approach 3 predicts this but extrapolation is uncertain. Besiroglu 2024 correction tightens but does not erase curvature — CS336 IsoFLOP evidence at MoE/diffusion scales suggests curvature persists at >10²⁶.
- In the multi-epoch regime ($D >$ unique tokens), how do deduplication and data repetition penalties modify $\hat{L}(N,D)$? Post-Chinchilla work explores data-constrained scaling. Lectures 09/11 propose `D'` effective-data formalism and scale-adaptive data selection, but no closed-form law validated at 100T+ repetition.
- Can synthetic data or retrieval augmentation ($\sim$10× effective $D$ in RETRO) shift $D_{opt}$ without collecting more human text?
- What is the optimal degree of **overtraining beyond Chinchilla 20 tok/param** given expected lifetime inference tokens `Y`? CS336 table (2→215 tok/param) is empirical Pareto, not derived formula — needs joint `6ND + 2NY·D` minimization.
- Does **µP transfer** hold under strong weight decay (0.1) and Lion/Muon without retuning? Lecture 11 flags this as the only significant µP failure — open whether scale-aware WD or sign-aware µP variant fixes it.
- Can **WSD-derived frontiers** introduce horizon bias versus true cosine-from-scratch optima at 10K+ GPU scale? MiniCPM/DeepSeek empirically match, but StepFun notes LR–D coupling is WSD-fragile.

## Connections
- Governs data and parameter budgeting during [[pretraining]] — directly determines the Chinchilla 20 tok/param ratio; CS336 adds WSD schedule, µP init/LR, and repetition-aware `D'` refinements to the budgeting procedure.
- Drives the emergence of zero-shot and few-shot capabilities in [[in-context-learning]]; Chinchilla's 7–10% MMLU/BIG-bench gains show that equal scaling unlocks more capability per FLOP than parameter-only scaling.
- Controls [[inference]] cost: compute-optimal small models (e.g., [[chinchilla]]) amortize training FLOPs over cheaper serving; motivates GQA, MLA/CLA, KV-cache optimizations, and deployment on smaller hardware. CS336 overt
raining ratios (96:1 Hunyuan, 39:1 LLaMA 3, 215 tok/param for 70B) quantify the amortization frontier.
- Exhibited by [[chinchilla]] (70B/1.4T) vs [[gopher]] (280B/300B) at identical $C$; built by [[deepmind]] to disprove the pre-2022 "bigger is always better at fixed data" paradigm from [[openai]]'s Kaplan work.
- Operationalized by modern recipes (MiniCPM, DeepSeek, Qwen, Kimi K2, Hunyuan, LLaMA 3, MiniMax, StepFun, Muon) — each an IsoFLOP/M1/M3 instantiation with µP/WSD/optimizer variants documented in [[source-cs336-lecture11-scaling-laws]].
- Evaluated by [[evaluation]]: MMLU/BIG-bench probe the `L(N,D)` loss surface downstream, but Tay et al. 2023 downstream unpredictability (Lecture 09 slide 41) warns that upstream `L` laws do not guarantee downstream task scaling — needs holistic multi-metric assessment.

## Sources
- [[source-training-compute-optimal-large-language-models]]
- [[source-scaling-laws-for-neural-language-models]]
- [[source-language-models-are-few-shot-learners]]
- [[source-deep-dive-into-llms-like-chatgpt]]
- [[source-cs336-lecture09-scaling-laws]]
- [[source-cs336-lecture11-scaling-laws]]

## Synthesis

- [[scaling-laws-revisions]] — why Kaplan and Chinchilla disagreed, and what that implies for reading any scaling law

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
