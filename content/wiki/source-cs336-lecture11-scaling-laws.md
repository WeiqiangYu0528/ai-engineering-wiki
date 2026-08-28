---
type: source-summary
title: "CS336 Lecture 11 — Scaling: Case Study and Details (Tatsu Hashimoto, Mon May 4)"
summary: The Spring 2026 CS336 Lecture 11 (Tatsu, May 4, 58 pages, lecture11.pdf) is the sequel to Lecture 09 — a case-study laboratory for how frontier labs actually fit and use scaling laws in 2024–2026.
status: draft
visibility: public
author: "Tatsu Hashimoto (Stanford CS336)"
source-type: article
url: "https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_11.pdf"
date-published: 2026-05-04
date-ingested: 2026-08-26
tags:
  - llm-fundamentals
  - inference
key-concepts:
  - "[[scaling-laws]]"
  - "[[pretraining]]"
  - "[[inference]]"
  - "[[lora]]"
key-entities:
  - "[[stanford-university]]"
  - "[[deepmind]]"
  - "[[meta]]"
---

# CS336 Lecture 11 — Scaling: Case Study and Details (Tatsu Hashimoto, Mon May 4)

## Summary
The **Spring 2026 CS336 Lecture 11 (Tatsu, May 4, 58 pages, `lecture_11.pdf`)** is the sequel to Lecture 09 — a *case-study* laboratory for how frontier labs actually **fit and use scaling laws in 2024–2026**. After showing that the last fully public scaling recipe is Chinchilla (2022), the lecture walks through two *detailed, reproducible* recipes — **MiniCPM (Tsinghua, 1–2.5B)** and **DeepSeek 7B/67B** — plus Qwen, Kimi K2, Hunyuan, LLaMA 3, and MiniMax, then zooms into the hardest subproblem: **scale-sensitive hyperparameter transfer** (LR, batch, initialization, optimizer). The centerpiece is a 16-page derivation and empirical audit of **Maximal Update Parametrization (µP, Yang et al. 2022)** and its fragilities (RMSNorm gains, Lion, strong weight decay), alongside **WSD (Warmup-Stable-Decay) schedules** that make Chinchilla sweeps `n→n²` cheaper and **StepFun's 2025 batch/LR empirical scaling system** that questions Kaplan-style critical-batch framing.

## Key Takeaways
1. **Post-Chinchilla recipes converge on three scaffolds**: (a) assume transformer hyperparameters *invariant* or use **µP** to make them so, (b) sweep **LR/batch** as functions of `D` (or `C`), (c) run **IsoFLOP** (Method 2) to pick `N` vs `D` — all using a **WSD piecewise-linear schedule** to avoid training `n²` models from scratch. MiniCPM and DeepSeek instantiate opposite ends of (a): MiniCPM embraces µP, DeepSeek directly fits LR/batch empirically without µP.
2. **MiniCPM (Slides 6–18) — µP + WSD + joint-fit Chinchilla**: 1–2.5B models beating most 2Bs and matching many 7Bs. Uses `scale_emb=12, scale_depth=1.4, init_std=0.1, LR=0.01`; fixes aspect ratio, scales overall size (≈5× gap to deployed model). Optimal LR is *≈ stable* across widths (validating µP), while optimal batch size grows *polynomially* with loss (`B*∝1/L^α`, Kaplan-style). To avoid `n²` cost of Chinchilla Method 3, replaces cosine with **WSD (warmup → stable → decay, decay ≈10% of steps)** — restart at end of stable phase for joint-fit frontier; lower envelope vs joint fit give *very* high data-to-model ratios (96:1–39:1 range in Hunyuan/LLaMA 3 analogues).
3. **DeepSeek 7B/67B (Slides 19–24) — direct LR/batch fits + IsoFLOP**: No µP; grid-searches small runs collecting "near-optimal" (within 0.25% of min) models — LR fit looks "questionable" (slide 21) but suffices. Uses **WSD variant** (fast warmup + two 10% decays, matches cosine performance). Chinchilla **Method 2 (IsoFLOP)** sweep directly selects model sizing; scaling-predicted final losses accurately match deployed 7B/67B (slide 24).
4. **2024–2025 landscape confirms isoFLOPs everywhere** (slides 25–30): **Qwen 2.5/3** (LR/batch fits, few details), **Kimi K2** (sparsity scaling for MoE), **Hunyuan MoE** (96:1 data:active-param), **LLaMA 3** (39:1, plus downstream-compute scaling), **MiniMax-01** (architecture decision scaling via Method 1). Recipe taxonomy at slide 30 cleanly contrasts DeepSeek vs MiniCPM vs late-2024 isoFLOP-only reports.
5. **Optimizer scaling is the confounder** (slides 31–41): **StepFun (2025)** exhaustive grid on pretraining loss shows `loss(B,LR)` convex with clean minima; `B_opt` depends primarily on *dataset size `D`* (not `N`), `LR_opt` rises with `D` at fixed `M` (fragile under WSD — InternLM 2026 caveat). MoE and dataset transfers are robust but not guaranteed. Two pitfalls: (a) **hparam mistuning mimics optimizer superiority** — different optimizers need different `(LR, batch)` scalings; (b) **scale dependence is massive** — any algorithm claim untested at Chinchilla ratios is suspect; non-careful scalings can *look good then blow up* (William Held Delphi example: cautious Adam + √batch LR scaling, slide 41).
6. **µP derivation audit (Slides 44–50) — why `init∝1/√fan-in, LR∝fan-out/fan-in`?**: From first principles for deep linear net `h_l=W_l h_{l-1}`, conditions A1 (`‖h_l‖=Θ(√n_l)` at init) and A2 (`‖Δh_l‖=Θ(√n_l)` after one SGD step) give operator-norm control: `σ = Θ(1/√n_{l-1}·min(1,√(n_l/n_{l-1})))`, `η_l = Θ(n_l/n_{l-1})` (for SGD; for Adam `‖ΔW‖_*∝η_l`). For standard param (SP), `init∝1/√n_{l-1}, LR∝Θ(1)` breaks width transfer; for µP, LR becomes stable vs width (slide 52 replication).
7. **µP fragilities (Slides 53–57)**: Robust to SwiGLU/squared-ReLU, large/small batch, zero-attention init, exotic gains — but **breaks** on (a) **learnable RMSNorm gains** (removable with little perf loss), (b) **sign-based optimizers** (Lion — gradient-sign transfer fails, slide 55), (c) **strong weight decay 0.1** (only significant failure mode, slide 56). Overall, µP "generally useful" — SP far more unstable; CerebrasGPT (0.1–13B, Chinchilla recipe) finds µP stabilizes scaling (slide 45).
8. **Muon optimizer & forward look** (slides 42–43, 58): **Muon** orthogonalizes matrix updates `B_t=USVᵀ→UVᵀ` via Newton-Schulz; NanoGPT speedrun and early scaling study show promise; Kimi K2 adopts at scale — gains tricky to isolate but "clearly works at scale" per slide 43. Lecture takeaway (slide 58): scale-aware arch/hparam choices via invariance or sweep, and cheap frontier fitting via WSD.

## Detailed Notes

### Motivation & Landscape (Slides 2–5)
- Poses three questions: Does Chinchilla still work? Can we save fitting compute? Should we pick arch/param scalings specially?
- Observes newest public scaling recipe is 2022 — gap to 2024–2026 models motivates public recipes to study (MiniCPM, DeepSeek).

### MiniCPM Recipe (Slides 6–18)
- **Model**: Tsinghua 1–2.5B, "not SOTA even in 2024 but many scaling lessons" (slide 6).
- **Technique 1 — µP**: hyperparameter table (`scale_emb 12, scale_depth 1.4, init_std 0.1, LR 0.01`); slide 9 fixes aspect ratio, scales size, gap to deployed model ≈5× (enables extrapolation).
- **Optimal LR (slide 10)**: vs model size, essentially flat — matches µP prediction that LR transfer is width-invariant.
- **Optimal batch (slides 11–12)**: 3 sizes (9M,30M,170M) vs `D` (y) and batch `B` (x), colored by loss; red line traces min-loss points per y → `B_opt` vs final loss polynomial — same as Kaplan `B_crit↑ as L↓`.
- **Fitting cost problem (slide 13)**: Chinchilla joint fit needs from-scratch runs per `(N,D)` → `O(n²)`. MiniCPM solution (slide 14): **WSD schedule** — warmup, long stable plateau, rapid 10% decay; restart at stable-phase end to sample multiple `D` (cheap frontier).
- **WSD works** (slide 15): loss decays slowly in stable phase, rapidly in decay; decay ≈10%.
- **Chinchilla analyses** (slides 16–18): M1 lower envelope (maybe not perfectly linear), M3 joint fit → very high `D/N` (high data side of Chinchilla); overtraining intuition aligns with inference amortization from L09.

### DeepSeek Recipe (Slides 19–24)
- **Model**: 7B + 67B, high vs open LMs (slides 20).
- **LR/batch scaling** (slide 20): no µP, *direct* fit of optima from small runs (0.25% band); LR fit noisy (slide 21).
- **WSD LR** (slide 22): fast warmup + two 10% decays — empirically matches cosine.
- **IsoFLOP M2** (slide 23): sweep FLOPs, valley minimum per budget → final `N/D`; slide 24 shows scaling-predicted loss matches actual 67B deployment — validation.

### 2024–2025 Other Recipes (Slides 25–30)
- Qwen 2.5/3: LR/batch power laws (few details). Kimi K2: sparsity-level scaling law. Hunyuan: MoE IsoFLOP with data/active-param 96:1. LLaMA 3: IsoFLOP 39:1 plus compute→downstream scaling. MiniMax-01 (2025): architecture + M1 Chinchilla.
- Slide 30 taxonomy: DeepSeek (assume invariant → sweep LR/batch → IsoFLOP + piecewise schedule), MiniCPM (use µP → piecewise for M3), late-2024 (isoFLOP only).

### Optimizer Scaling Deep Dive (Slides 31–43)
- **Schedule dependence** (slide 31): init/optimizer/LR/batch all scale-sensitive.
- **StepFun (slide 33–37)**: "What are right variables?" — critical batch `B(L)` vs `C`-power law vs other. Purely empirical grid. Obs 1: convex loss surface in `(B,LR)` (slide 35). Obs 2: `B_opt∝D^β`, `LR_opt↑ with D` at fixed `M` (fragile under WSD). Obs 3: robust to MoE/dataset to first order.
- **General lesson** (slides 38–41): Optimizer comparisons *must* control hparam scaling; scale dependence itself is confounder; establishing apparent scaling nontrivial — counterexample of blow-up (Held Delphi).
- **Muon** (slides 42–43): matrix-valued, Newton-Schulz orthogonalization `B→UVᵀ`; NanoGPT + scaling study + K2 adoption.

### µP Parametrization (Slides 44–57)
- **Appeal** (44): Hyperparam transfer `n→∞` would be ideal; CerebrasGPT validates stability (45).
- **Definition** (46): Width `n_l`, conditions A1 (`a_l=Θ(1)` per activation, so `‖h_l‖=Θ(√n_l)`) and A2 (`Δa_l=Θ(1)`).
- **Derivation A1** (47): For `h_l=W_l h_{l-1}, W_l∼N(0,σ²)`, spectral norm `‖W_l‖_*→σ(√n_{l-1}+√n_l)`; requiring `‖h_l‖=Θ(√n_l)` with `‖h_{l-1}‖=Θ(√n_{l-1})` forces `σ=Θ(1/√n_{l-1}·min(1,√(n_l/n_{l-1}))`.
- **Derivation A2** (48–49): SGD update `ΔW_l=-η_l∇_{h_l}ℓ·h_{l-1}ᵀ` rank-1; decompose `Δh_l=W_lΔh_{l-1}+ΔW_l(h_{l-1}+Δh_{l-1})`; requiring `‖ΔW_l‖_*=Θ(n_l/√n_{l-1}·√n_l?)` → `η_l=Θ(n_l/n_{l-1})` (Adam variant `‖ΔW‖_*∝η_l` instead → different effective rule). Slide 50 contrasts SP vs µP tables.
- **Scope & table** (51): µP maps per param type (attention/embedding/MLP/softmax) with scaling rules.
- **Replication Q1** (52): Width sweep shows µP optimal LR flat, SP drifts — confirms claim.
- **Robustness sweep** (53–57): SwiGLU etc. OK; RMSNorm *gain* breaks (fix: remove gain); Lion breaks; strong WD 0.1 breaks (Adam + WD scaling mismatch). Still net useful vs SP instability.

### Recap (Slide 58)
- Three challenges: arch hypers (width…), optimizer hypers (LR/batch), `n²` fitting cost; solutions: assume invariance / use µP, small-scale sweep + law, WSD.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 3 passages in this section could not be located in the stored source ([https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_11.pdf](https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_11.pdf)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "What is the best practice for scaling and hparam tuning LMs? Does Chinchilla's approach actually work? Can we save compute when fitting these? Should we pick particular parametrizations to scale nicely?" — Motivation, Slide 2

> "Instead of cosine, split learning rate into warmup, stable, and decay phases. For Chinchilla-style analysis, can restart the run at the end of the stable phase." — WSD trick, Slide 14

> "If we naively scale up — optimal learning rate depends on scale. We need scaling-aware initialization and learning-rate scaling — µP." — Slide 4 preview

## Concepts Introduced or Referenced
- [[scaling-laws]] — IsoFLOP/M1/M3, data-vs-model frontier, µP transfer, WSD schedules, batch/LR power laws, MoE sparsity scaling.
- [[pretraining]] — WSD vs cosine schedules, Lion vs Adam vs Muon, weight decay 0.1 interaction, data-mixture lessons.
- [[inference]] — Implicit via overtraining ratios (96:1, 39:1) favoring lifetime compute — links to Lecture 10.
- [[lora]] / [[parameter-efficient-fine-tuning]] — Context for "not all params equal" extended to MoE active params.

## Critical Assessment
- **Strengths**: Only CS336 source that turns scaling laws from *observation* into *actionable recipe* — compares two fully public 2024 recipes side-by-side, includes honest noisy LR fits (DeepSeek) and fragilities (µP+RMSNorm/Lion/WD); WSD `n²→n` savings and StepFun convex-frontier evidence are uniquely valuable operationally; µP derivation from `‖W‖_*` bounds is most accessible "µP for babies" in the CB.
- **Weaknesses**: Figure-heavy slides lose detail in PyPDF2 extraction — isoFLOP valley parabolas, batch=loss curves, and µP LR flat-vs-drift plots must be read in PDF; some tables (Kimi sparsity, Qwen batch, Hunyuan numbers) are single-bullet summaries without full methods; StepFun internals and Muon derivations are overview-only (2-page each); no code or fitted coefficients released inline.
- **Relation to Lecture 09 & wiki**: Directly deepens [[source-cs336-lecture09-scaling-laws]] (adds practice/engineering layer) and [[source-scaling-laws-for-neural-language-models]] / [[source-training-compute-optimal-large-language-models]] (adds inference-amortized overtraining and modern validations). WSD schedule bridges to [[pretraining]]; µP clarifies parametization vs SP in [[transformer]] init.

---

**Source:** CS336 Lecture 11 — Scaling: Case Study and Details (Tatsu Hashimoto, Mon May 4) by Tatsu Hashimoto (Stanford CS336) — <https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_11.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
