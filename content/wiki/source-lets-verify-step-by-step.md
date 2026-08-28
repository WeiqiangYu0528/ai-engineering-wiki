---
type: source-summary
title: "Let's Verify Step by Step"
summary: "The May 2023 OpenAI paper (Lightman et al., arXiv 2305.20050) conducts the first large-scale comparison of outcome supervision (ORM: feedback only on final answer correctness) vs process supervision (PRM: feedback on…"
status: draft
visibility: public
author: "Hunter Lightman, Vineet Kosaraju, Yura Burda, Harri Edwards, Bowen Baker, Teddy Lee, Jan Leike, John Schulman, Ilya Sutskever, Karl Cobbe (OpenAI)"
source-type: paper
url: "https://arxiv.org/abs/2305.20050"
date-published: 2023-05-31
date-ingested: 2026-08-25
tags:
  - eval-safety
  - agents
  - inference
  - llm-fundamentals
key-concepts:
  - "[[reasoning-llms]]"
  - "[[thinking-models]]"
  - "[[chain-of-thought]]"
  - "[[self-consistency]]"
  - "[[evaluation]]"
key-entities:
  - "[[openai]]"
---

# Let's Verify Step by Step

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 5 of 33 figures on this page were not found in [https://arxiv.org/abs/2305.20050](https://arxiv.org/abs/2305.20050): `1,085,590`, `101,599`, `95%`, `880M`, `130M`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The **May 2023 OpenAI paper (Lightman et al., arXiv 2305.20050)** conducts the first large-scale comparison of **outcome supervision** (ORM: feedback only on final answer correctness) vs **process supervision** (PRM: feedback on correctness of each intermediate reasoning step) for training verifiers to improve mathematical reasoning. Using GPT-4 base models on the **MATH dataset** (Hendrycks et al., competition-level math) and collecting **PRM800K** (800K step-level human labels over 75K solutions to 12K problems), the authors show **PRMs dramatically outperform ORMs** under best-of-N search: **78.2%** of a 500-problem MATH test subset solved vs **72.4% ORM** vs **69.6% majority vote**, with gap widening as N→1860. Small-scale synthetic ablations using the large PRM as an oracle confirm process > outcome at all data scales, and **active learning** by surfacing convincing wrong-answer solutions yields **2.6× data efficiency**.

## Key Takeaways
1. **PRM >> ORM on hard math**: Large-scale PRM trained on PRM800K solves 78.2% MATH subset (best-of-1860) vs ORM 72.4% trained on 100 uniform samples/problem (order magnitude more data than PRM) — process supervision wins despite smaller, heavily biased (wrong-answer) training set. Demonstrates credit-assignment advantage.
2. **Why process helps**: ORM faces hard credit assignment — must infer *where* error occurred among many steps; for hard problems most samples contain an error so negative ORM label has low information. PRM specifies correct prefix length + exact first error location → richer, localized signal. Also supervises only up to first incorrect step to keep comparison fair and match cost of checking solution without easy final answer.
3. **PRM800K dataset**: 1,085,590 raw step labels over 101,599 samples; filtered to 800K over 75K solutions (12K problems). Labels are positive/negative/neutral per step (neutral = ambiguous/misleading but technically valid). Collected in 2 phases: Phase 1 (5%, 40K labels) with alternative completions per step (repetitive); Phase 2 (95%) with iterative retraining and top-K convincing wrong-answer surfacing (85.1% correct solutions phase1 → 13.2% phase2; correct steps 58.6%→74.1%). Includes 4.5K MATH test problems → evaluation only on remaining 500 to avoid overfit. Released at https://github.com/openai/prm800k. Quality control: 30 gold questions, 75% agreement threshold.
4. **Active learning 2.6× efficiency**: Uniform surfacing of solutions wastes labels on obvious errors. Selecting solutions rated highly by current best PRM but reaching wrong final answer (convincing wrong-answers) surfaces most informative mistakes. Small-scale synthetic experiments: PRM_selector trained on 1 sample/problem scores 1,000 samples/problem, selects 80% most convincing wrong-answer + 20% most convincing remaining → slope analysis shows 2.6× data efficiency vs uniform. Iterative retraining of selector was unstable — future work.
5. **Synthetic supervision validates**: To isolate training set incomparability and ORM false positives (correct answer via wrong reasoning misgraded as positive), authors use PRM_large to supervise small models with 3 forms on *identical* datasets: (a) process via PRM_large, (b) outcome via PRM_large, (c) outcome via final-answer check. Across 1→200 samples/problem and best-of-N sweeps, (a) >> (b) >> (c) — confirms PRM_large outcome > final-answer outcome due to false positives, but process still clearly best even with perfect outcome proxy.
6. **Training details**: PRM predicts correctness after each step (single token, standard LM pipeline, one forward pass yields all scores). Solution score = product of per-step correctness probabilities (P(every step correct)). ORM predicts at final token only. Base models: large-scale all from GPT-4 (next-token only, no RLHF) + MathMix pretraining (1.5B math tokens: problems/solutions 275M, free-form discussion 880M, synthetic 130M, critiques 500M); small-scale ~200× less compute.
7. **OOD generalization**: On 234 fresh STEM problems post-pretraining cutoff (45 AP Calculus, 60 AP Chemistry, 45 AP Physics, 84 AMC 10/12), best-of-100 PRM 72.9% (Calc 86.7, Chem 80.0, Phys 86.7, AMC 53.2) vs ORM 63.8% vs Majority 61.3% — holds under distribution shift, supporting that contamination not driving MATH gains. Low generator pass rate on some PRM-correct MATH solutions further argues against memorization.
8. **Alignment implication — negative alignment tax**: Process supervision is more interpretable (human-endorsed chain), safer (directly rewards aligned reasoning vs outcome proxy exploitable via reward hacking), and *more performant* — no sacrifice. Encourages adoption; open question whether generalizes beyond verifiable math.

## Detailed Notes

### Methods Nuances
- Generator SFT: few-shot generate MATH train solutions, filter to correct final answer, SFT 1 epoch to teach newline-delimited step format — not to teach new math skills.
- Neutral labels: treated as either positive or negative at test time; defer handling of ambiguity; step-level modeling choice.
- Scoring ablations (Appendix F): alternatives — product, min, last-step, max — product of step correctness probabilities best for MATH; other domains may differ.
- ORM training: follows Cobbe 2021, uniform samples, cross-entropy on correctness; at test score = logit at final token.

### Scaling Perspective
- Compared to Uesato et al. 2022 on GSM8K where outcome≈process — authors argue difference is data scale: small data sizes outcome≈process consistent with Fig 4a trend; at scale process >> outcome even judged on final-answer accuracy alone. Larger base model not required — small-scale synthetic also shows gap.
- Visualization: Fig 2 shows two solutions to same problem with PRM heatmap (green high score, red low) correctly localizing error.

### Alignment Discussion
- Process supervision eases scrutiny, rewards *how* vs *what*; outcome supervision could lead to models that exploit reward (Cotra 2022, Stuhlmüller & Byun "Supervise process, not outcomes").
- Alignment tax: typically safer methods cost capability (Ouyang 2022, Askell 2021), but here PRM gives negative tax — win-win.

### Limitations & Contamination
- Includes 4.5K MATH test problems in training → must evaluate on held-out 500; test-set contamination risk for pre-training discussed (MathMix decontaminated via LaTeX-stripped n-grams but imperfect); manual inspection shows no memorization, low solve-rate on PRM successes, OOD results reinforce robustness.
- Expensive: human labeling cost high; synthetic supervision via PRM_large as proxy may introduce bias (PRM_large imperfections propagated).

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 3 of 3 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2305.20050](https://arxiv.org/abs/2305.20050)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Process supervision significantly outperforms outcome supervision for training models to solve problems from the challenging MATH dataset. Our process-supervised model solves 78% of problems from a representative subset of the MATH test set." — Lightman et al., Abstract

> "Process supervision makes credit assignment easier, and we believe that this explains its strong performance."

> "In some cases, safer methods for AI systems can lead to reduced performance, a cost which is known as an alignment tax. Our results show that process supervision in fact incurs a negative alignment tax."

## Concepts Introduced or Referenced
- [[reasoning-llms]] — PRM as verifier for large reasoning models; foundation for o1/R1-style reward modeling and test-time search.
- [[thinking-models]] — Test-time compute scaling via verifier (best-of-N, beam search) vs thinking tokens; PRM enables search over thinking traces.
- [[chain-of-thought]] — Step-level supervision operates over CoT traces; newline-delimited steps formalize CoT for verification.
- [[self-consistency]] — Majority vote baseline (69.6%) outperformed by ORM and PRM; RM-weighted voting ablated (no gain over PRM alone).
- [[evaluation]] — From answer-only accuracy to step-level correctness — granular evaluation; PRM800K enables process-level benchmarking.

## Critical Assessment
- **Strengths**: Rigorous apples-to-apples synthetic ablation disentangles dataset bias vs supervision type; large-scale human data release catalyzed follow-ups (DeepSeekMath, Qwen2.5-Math, Llama 3 verifiers); clear practical win with theoretical credit-assignment explanation; OOD validation strong.
- **Weaknesses**: Limited to verifiable math where final-answer checking is possible (and neutral label handling deferred); product scoring assumes step independence; human label noise on neutral/ambiguous steps not fully quantified; large-scale ORM/PRM training sets incomparable in original comparison (acknowledged). Generalization to open-ended/subjective reasoning untested — process supervision may be less suited where "correct step" is ill-defined.
- **Relation to later work**: Direct predecessor to Snell et al. 2024 test-time scaling: Snell re-uses PRM for search but finds exploitation at high budgets and difficulty-dependent optimal search — nuancing Lightman's monotonic "more search better" finding.

---

**Source:** Let's Verify Step by Step by Hunter Lightman, Vineet Kosaraju, Yura Burda, Harri Edwards, Bowen Baker, Teddy Lee, Jan Leike, John Schulman, Ilya Sutskever, Karl Cobbe (OpenAI) — <https://arxiv.org/abs/2305.20050>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
