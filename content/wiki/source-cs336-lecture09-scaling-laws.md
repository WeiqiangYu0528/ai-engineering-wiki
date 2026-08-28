---
type: source-summary
title: "CS336 Lecture 09 — Scaling Laws: Basics (Tatsu Hashimoto, Mon Apr 27)"
summary: The Spring 2026 CS336 Lecture 09 (Tatsu, Apr 27, 57 pages, lecture09.pdf) is the first of two scaling-law lectures — the systems-oriented foundation for sizing frontier LMs.
status: draft
visibility: public
author: "Tatsu Hashimoto (Stanford CS336)"
source-type: article
url: "https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_09.pdf"
date-published: 2026-04-27
date-ingested: 2026-08-26
tags:
  - llm-fundamentals
key-concepts:
  - "[[scaling-laws]]"
  - "[[pretraining]]"
  - "[[inference]]"
  - "[[transformer]]"
  - "[[chinchilla]]"
  - "[[gopher]]"
key-entities:
  - "[[stanford-university]]"
  - "[[deepmind]]"
  - "[[openai]]"
---

# CS336 Lecture 09 — Scaling Laws: Basics (Tatsu Hashimoto, Mon Apr 27)

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 8 of 15 figures on this page were not found in [https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_09.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_09.pdf): `0.5`, `130B`, `5.76`, `1.4T`, `280B`, `300B`, `7.6%`, `10.7%`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The **Spring 2026 CS336 Lecture 09 (Tatsu, Apr 27, 57 pages, `lecture_09.pdf`)** is the first of two scaling-law lectures — the systems-oriented foundation for sizing frontier LMs. Framed as *"your friend gave you 10k B200s for a month — which model do you run?"*, the lecture argues that scaling laws — simple log-log power laws — let teams **predict big-model behavior from small-model sweeps** instead of cargo-culting hyperparameters. Part 1 traces **data-scaling** history (Banko & Brill 2001, Hestness et al. 2017) and theory (1/n^α rates, intrinsic-dimension intuition via Bahri 2021); Part 2 covers **model/compute scaling** (architecture, optimizer, depth/width, batch size, learning rate) and the **Kaplan vs Chinchilla** controversy on joint N–D allocation, including Besiroglu et al. 2024's forensic re-fit of Chinchilla Method 3.

## Key Takeaways
1. **Scaling as cheap prediction — not brute-force tuning**: Old workflow (tune hyperparameters on big models) is replaced by *train small → fit power law → extrapolate to large*. This predicts optimizer, architecture, depth/width, and N vs D choices before committing 10k-GPU runs.
2. **Data scaling is log-log linear across 7+ orders and holds empirically since 1993/2001/2017**: Banko & Brill (2001) log-linear with data, Kolachina et al. (2012) power-law downstream, Hestness et al. (2017) clean LM/MT/speech curves that already hypothesize emergence, compute scaling, and "speed ≈ accuracy." CS336 shows `log Loss ∝ -α log n`.
3. **Why a power law? Classical 1/n intuition + nonparametric dimensionality**: Mean-estimation toy gives `E[(μ̂-μ)²]=σ²/n → log Error = -log n + const` (general `1/n^α`). For flexible nonparametric learners in d dimensions, partitioning into `n^{1/4}` boxes yields `Error ≈ n^{-1/d}` — slope `α=1/d`. Connection to Bahri's intrinsic-dimension theory; distribution-shift data-mixture and finite-data repetition (effective data `D'`) affect *offset* not slope (Hashimoto 2021), while scaling laws are lower bounds that can break under naive extrapolation.
4. **Systems FLOPs accounting `C ≈ 6ND` anchors joint scaling**: Lecture derives compute-budget framing before Chinchilla; Rosenfeld (2020) `Error = n^{-α}+m^{-β}+C` and Kaplan (2020) `Error = m^{-α}+n^{-1}β` both fit N–D jointly but predict different allocations — Kaplan `N_opt ∝ C^{0.73}, D_opt ∝ C^{0.27}` (tokens/param ↓ with C).
5. **Kaplan vs Chinchilla — three fitting methods and why they diverge**: All 400+ Chinchilla runs (70M–16B) converge on `N∝C^{~0.5}, D∝C^{~0.5}` (20 tok/param, equal scaling) via (1) **lower envelope** over training curves at fixed N, (2) **IsoFLOP** convex minima at fixed C, (3) **parametric joint fit** `L̂=E+A/N^α+B/D^β` (Huber + L-BFGS). Kaplan's `0.73/0.27` is biased by fixed cosine horizon (130B), last-layer param counting without embedding, and small-model negative curvature — Schedule length should ≈ D. Besiroglu et al. 2024 re-fit recovers Method 3 toward Methods 1–2.
6. **Critical batch size, initialization, and hyperparameters are themselves scaling laws**: `B_crit` grows as `∝ L^{-1/α}` (solve `S_min, E_min` curve fit → ~2× steps/passes optimum); depth/width and transformer aspect ratios have *diminishing returns* beyond ~10⁷ params; embedding vs non-embedding params behave differently (MoE caveats); Adam vs SGD relative advantage is predictable via scaling.
7. **Train-optimal ≠ deploy-optimal — inference amortization breaks Chinchilla naïveté**: At fixed training FLOPs `5.76×10²³`, Chinchilla 70B/1.4T beats Gopher 280B/300B (+7.6% MMLU, +10.7% BIG-bench, Pile wins) with 4× cheaper inference. Real deployments *overtrain* (Chinchilla 20 tok/param → LLaMA 65B 22, LLaMA 2 70B 29, Mistral 7B 110, LLaMA 3 70B 215 tok/param) because lifetime tokens `Y` dominate pretraining `X` — isoFLOPs pattern generalizes to MoE (Abnar 2025), diffusion (Gulrajani 2023).

## Detailed Notes

### Motivation & Structure
- Opens with resource-allocation thought experiment (10k B200s × 1 month); three pillars: infra/distributed training, dataset, *model choice* (this lecture). Warning against cargo-culting existing LM configs.
- Declares topic: "simple, predictive laws for LM behaviors" — tune on small, extrapolate to large (slide 4); schedule: Part 1 data-scaling history, Part 2 neural scaling (data vs perf, data vs size, hparams vs perf).

### Part 1 — Data-Scaling History & Theory
- **Sample complexity vs realized loss**: VC bounds (Hall 1989) are upper bounds, not observed loss; 1-page derivation set up.
- **Pre-neural lineage**: Earliest (1993 paper, unnamed on slide 7), Banko & Brill 2001 confusion-set disambiguation showing log-linear data scaling; Kolachina 2012 downstream power laws.
- **Hestness et al. 2017** — first large-scale neural scaling: MT/LM/speech all predictable; already anticipates *emergence*, *compute scaling* (`C ∝ D × steps`), and *time-accuracy tradeoff* (slide 11).
- **Functional form**: Hestness logistic-like curves → Kaplan log-log linear `loss linear in log data` → scale-free/power-law viewpoint (slide 15).

### Theory Interlude — Why Power Laws?
- **Mean-estimation toy** (slide 17): `x_i∼N(μ,σ²)`, `μ̂=mean`, `E[(μ̂-μ)²]=σ²/n → log Error = -log n +2 log σ`. Any `1/n^α` is scaling law.
- **Mystery**: Classical models predict slope `-1` (`y=-x+C`), but MT/speech/LM slopes are shallower (≈ -0.07–0.095) — discrepancy motivates next slide.
- **Nonparametric construction** (slide 19): 2D uniform `x∈[0,1]²`, `y=f(x)+N(0,1)`, partition into boxes length `n^{-1/4}` → `n` boxes each with `√n` samples → `Error ≈ 1/√n` + smoothness → in d dims `Error = n^{-1/d}` → slope `y=-1/d x + C`. Takeaway: flexible learners have dim-dependent slopes.
- **Intrinsic dimension** (Bahri 2021, slide 20): `α` ≈ `1/d_intrinsic`; estimators sketchy, not airtight.

### Advanced Data Scaling
- **Data mixture**: Picking optimal mixture via small models; distribution-shift affects offset not slope (slide 22, Hashimoto 2021). Blindly picking best small dataset fails (slide 23).
- **Finite data & repetition**: `D' = effective data, D_u = unique tokens, R_d* = repetition constant` (slide 24); repeated tokens have diminishing value; data-selection should be scale-adaptive (slide 26). Scaling laws are lower bounds (slide 25).

### Part 2 — Model/Compute Scaling (Kaplan Framing)
- **Motivation**: Efficient huge-LM design — LSTM vs Transformer, Adam vs SGD, width vs depth, more data vs bigger model (slide 28).
- **Architecture (Transformer vs LSTM)** (slide 30): Kaplan brute-force comparison shows Transformer strictly dominant power-law envelope at equal FLOPs; Tay et al. 2022 confirms cross-architecture scaling (slide 31).
- **Optimizer (Adam vs SGD)** (slide 32): Hestness 2017 RHN result — Adam wins but gap narrows predictably vs scale.
- **Depth/width & aspect ratio** (slides 33–35): 1→2 layers huge, then diminishing <10⁷ params; feed-forward ratio, head count, aspect ratio largely invariant to scale (narrow region matters); but *not all params equal* — embedding params don't follow same law (slide 35), portent for MoE where active vs total diverge (slide 36).
- **Critical batch size** (slides 37–39): Defined via `S(B)` steps to target loss and `E(B)=S×B` examples — curve yields `S_min, E_min` balancing 2× overhead; claimed ≈ `trace(Cov(grad))/‖grad‖²`; `B_crit↑` as `L↓` (smaller target loss → larger batch, McCandlish et al.).
- **Learning rates & µP** (slide 40): Naïvely, optimal LR depends on scale (Yao et al. 2024); Yang et al. 2022 µP/mean-field promises scale-invariant LR (preview of Lecture 11).
- **Downstream non-transfer** (slide 41): Upstream loss scaling ≠ downstream task scaling (Tay et al. 2023) — unpredictability warning.
- **Design procedure** (slide 42): Train few small → fit law per hyperparam → pick optimum — optimizer/depth/architecture all predictable.

### Joint N–D Scaling & Chinchilla
- **Joint laws**: Rosenfeld `n^{-α}+m^{-β}+C` and Kaplan `m^{-α}+n^{-1β}` fit grid well (slide 43–44) — predicts `N^{0.74}/D` overfitting penalty (slide 43).
- **Kaplan vs Chinchilla allocation** (slide 45): Kaplan 0.73/0.27 vs Chinchilla 0.5/0.5; Gopher 280B/300B and GPT-3 175B/300B are dramatically undertrained (Chinchilla predicts 175B → ~4.2T tokens at `4.41×10²⁴` FLOPs).
- **Three Chinchilla methods** (slides 46–49):
  - *M1 — Lower envelope*: interpolate loss vs `C=6ND` per `N`, take minimal frontier (1500 log-spaced points).
  - *M2 — IsoFLOP*: 9 budgets `6×10¹⁸–3×10²¹` FLOPs, sweep `N` with matched cosine length, parabolic valley fit.
  - *M3 — Joint fit*: `L̂=E+A/N^α+B/D^β`, Huber δ=10⁻³ + L-BFGS, closed-form `N_opt=G(C/6)^a`, `D_opt=G^{-1}(C/6)^b`.
- **Why divergence?** (slides 50–52): Kaplan fixed cosine horizon (130B for all runs), wrong embedding counting, warmup too high at small budgets; non-embedding vs total param plus small nonlinearities shift exponent.
- **Addendum — Method 3 flawed** (slide 53): Besiroglu et al. 2024 forensics — re-fit of raw data brings M3 toward M1/M2; M3 predicts `N_opt=40B` at Gopher FLOPs vs 67B for M1 due to negative curvature at extreme C.
- **Deployment amortized optimum** (slide 54 & 56): Training-optimal is not serving-optimal; lifetime cost `6ND` (once) vs `2ND·Y` per query volume `Y` favors overt
raining; table: GPT-3 2 → Chinchilla 20 → Mistral 7B 110 → LLaMA 3 70B 215 tok/param; isoFLOPs everywhere (diffusion, MoE) confirms pattern (slide 55).

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 3 passages in this section could not be located in the stored source ([https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_09.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_09.pdf)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Imagine your friend has given you ten thousand B200s for a month and asked you to build a good open source LM. What do you do? Run a big model — but which one? We are here." — Opening motivation

> "The scaling law-based design procedure: 1. Train a few smaller models 2. Establish a scaling law 3. Select optimal hyperparam based on scaling law prediction." — Slide 42 summary

> "Kaplan claims N_opt=C^{0.73}, D_opt=C^{0.27} (tokens per param decreases with C) — Chinchilla says equal scaling. Why such a big difference? Kaplan held cosine LR schedule fixed..." — Slides 50–51

## Concepts Introduced or Referenced
- [[scaling-laws]] — Central topic: data, parameter, compute power laws, joint N–D frontier, critical batch size.
- [[pretraining]] — Compute-budget allocation (6ND), cosine/warmup schedule, Adam, data-mixture/repetition regimes.
- [[transformer]] — Depth/width, aspect ratio, architecture comparison (Transformer vs LSTM, Tay et al. 2022), embedding vs non-embedding params.
- [[inference]] — Lifetime amortization argument: 70B vs 280B deployment, overtraining tradeoff.
- [[chinchilla]] / [[gopher]] — Canonical 70B/1.4T vs 280B/300B contrast at identical 5.76×10²³ FLOPs.
- [[lora]] / [[parameter-efficient-fine-tuning]] — Context on "not all parameters equal" and MoE parameter-counting nuance (Abnar 2025).

## Critical Assessment
- **Strengths**: Exceptionally clear historical archaeology (pre-2017 → 2026) with visual log-log evidence; demystifies power-law origins via elementary statistics + nonparametric construction; most thorough classroom exposition of the three Chinchilla methods and their forensic pitfalls; deployment vs training tension crisply framed with current tok/param table.
- **Weaknesses**: Text-extracted PDF omits many figures — loss curves, isoFLOP valleys, and repetition contours must be read in PDF; slide 24–26 effective-data formulas truncated in extraction; theoretical intrinsic-dimension section is speculative (authors note estimators are "sketchy"); MoE/diffusion isoFLOPs extensions only sketched (single bullet).
- **Contradiction flag**: None vs existing wiki. Complements [[source-scaling-laws-for-neural-language-models]] (Kaplan) and [[source-training-compute-optimal-large-language-models]] (Chinchilla) by adding CS336's FLOPs-accounting lens, finite-data repetition view, and Besiroglu 2024 correction to Method 3. New deployment-amortization framing directly links [[scaling-laws]]↔[[inference]] for overtraining strategy.

---

**Source:** CS336 Lecture 09 — Scaling Laws: Basics (Tatsu Hashimoto, Mon Apr 27) by Tatsu Hashimoto (Stanford CS336) — <https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_09.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
