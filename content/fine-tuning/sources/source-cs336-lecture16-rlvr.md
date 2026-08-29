---
type: source-summary
title: "CS336 Lecture 16 — Post-training 2: Reinforcement Learning from Verifiable Rewards (Tatsu Hashimoto)"
summary: Lecture 16 ascends from RLHF (~GPT-3.5) to reasoning-model RL (~o1/R1) via Reinforcement Learning from Verifiable Rewards (RLVR) — optimizing exactly what can be checked.
status: verified
visibility: public
author: "Tatsu Hashimoto (Stanford CS336, Spring 2026)"
source-type: article
url: "https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_16.pdf"
date-published: 2026-05-20
date-ingested: 2026-08-26
tags:
  - fine-tuning
  - llm-fundamentals
key-concepts:
  - "[[rlhf]]"
  - "[[direct-preference-optimization]]"
  - "[[reasoning-llms]]"
  - "[[supervised-fine-tuning]]"
key-entities:
  - "[[stanford-university]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-cs336-lecture16-rlvr
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Lecture 16 ascends from RLHF (~GPT-3.5) to reasoning-model RL (~o1/R1) via Reinforcement Learning from Verifiable Rewards (RLVR) — optimizing exactly what can be checked.</p>
<p class="kb-provenance">Tatsu Hashimoto (Stanford CS336, Spring 2026), 2026-05-20. <a href="https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_16.pdf">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
Lecture 16 ascends from RLHF (~GPT-3.5) to reasoning-model RL (~o1/R1) via **Reinforcement Learning from Verifiable Rewards (RLVR)** — optimizing exactly what can be checked. Motivation: RLHF overoptimizes because reward models are noisy proxies; verifiable domains (math `is_equivalent` boxed answer, code unit tests) allow clean scaling. After a concise PPO autopsy (theory `∇E[R]=E[R∇log π]` → TRPO linearization → PPO clip; LM idealization as token-level bandit with dense final reward; AlpacaFarm `ppo_trainer.py` outer/inner loops, clip 0.2, per-token KL + last-token reward with clipping, GAE γ=λ=1, expected rising RM reward vs negative KL curves), the lecture introduces **GRPO** (DeepSeekMath): drop the value model, use group z-score advantages; shows nano-aha tiny implementation, unbiased-baseline fix (Liu 2025, stdev ≠ valid baseline, LOO-style), and length biases (stdev upweights hard/easy; token-normalization). Three open case studies then detail field recipes: **DeepSeek-R1** (R1-Zero GRPO + accuracy/format rewards → aha/long-CoTs, but overstated; R1 adds SFT cold-start + language-consistency reward + post-RLVR SFT/RLHF stages; 800K distillation to Qwen), **Kimi K1.5** (long-CoT data filtering, DPO-inspired reference-regularized squared-loss policy gradient, late-stage length compression `λ∈[-0.5,0.5]`, curriculum + synthetic test-case/Code-RM math verifier), and **Qwen 3 / Qwen 3 Coder** (3995-example GRPO for reasoning, thinking-mode fusion, midtraining 600B repo-level + LLM-parsed HTML, expert SWE/web/UX agents, 800K auto-built SWE env + agent RL). Infra pain (on-policy inference, uneven long CoTs) and the SFT-vs-RL interplay close out.

## Key Takeaways
1. **RLVR escapes RLHF Goodhart by verifiability.** Where human preference RMs overoptimize, `accuracy(reward==GT)` for math/code is noiseless — enabling the o1/R1 jump without MCTS/PRMs (DeepSeek ablated and rejected both).
2. **GRPO simplifies PPO but introduces bias.** Advantage = `(r - mean_group)/std_group` (1e-4 stabilizer) removes critic memory/tuning — online same as group-normed policy gradient; simplicity enables tiny implementations (`github.com/McGill-NLP/nano-aha-moment`). Fix: stdev scaling not a valid baseline (unbiased → `1 - (LOO)`), length-normalizer trade-offs; DAPO/Dr-GRPO variants follow.
3. **R1-Zero proves pure RL suffices, but product R1 needs SFT.** Base DeepSeek-V3 + GRPO (accuracy + `<think>` format) reaches ~o1-minus but mixes languages and is less readable; cold-start long-CoT SFT (1K Gemini/R1 traces — DeepSeek note: small SFT bootstraps reasoning effectively) + language-consistency loss fixes it. Post-reasoning pipeline: 600K non-verifiable reasoning (V3 judge) + 200K non-reasoning SFT (2 epochs) → second GRPO RLHF (reasoning verifiable + general RM) — ordering RL→SFT→RL matters and general RLHF slightly hurts STEM.
4. **Distillation beats RL for small bases.** R1 800K CoT distillation into Qwen 2.5 yields stronger small reasoners than training them with RL from scratch — practical takeaway for deploying LRMs.
5. **Kimi diverges on loss and length control.** Reference-based RM, DPO-type derivation with squared loss + baseline PG + regularization; length reward `λ = 0.5 - len/center` per group to compress CoTs (correct short rewarded, incorrect near-center), activated late due to perf cost. Complementary to R1: difficulty filtering (exclude MC/T-F false positives, keep best-of-8 failures), curriculum sampling ∝(1-success), synthetic execution for code (generated tests) / learned equivalence RM (800K) for math.
6. **Qwen 3 shows low-data RLVR is real.** Thinking-mode fusion (mixed thinking/non-thinking tags + early-stop token), careful CoT quality filtering (remove guess-right, dedup vs val), and **3,995-example** GRPO outperforming larger runs — plus midtraining at 600B repo-concat (PRs with RAG, joint text+code, synthetic QA/trajectories) and expert NextCoder distillation (WASM? via VLM validity, tool-format UX, 800K auto SWE envs) — demonstrate data quality >> quantity for reasoning RL.

## Detailed Notes

### Core Algorithms (pp. 5–24)
- **PPO theory→practice:** attempt 1 policy grad (high variance), 2 TRPO, 3 PPO clip; conceptual objective (Spinning Up); LM bandit view (tokens=actions); AlpacaFarm idealization (30717ddae.../ppo_trainer.py), outer rollouts → inner PPO epochs, loss clip 0.2, per-token KL (clipped when `logπ_new < logπ_ref`), GAE with γ=λ=1 as reward-to-go vs value.
- **Why not PPO/DPO → GRPO:** PPO complex/value-heavy, DPO pairwise/offline. GRPO: keep PPO skeleton, drop value/baseline → group z-score. Demo: per-group mean/std → KL → grad. Figure: DeepSeekMath RFT vs GRPO (+process). Sutton & Barto baseline lesson → Liu 2025 unbiased + length-norm fix.

### Case Studies (pp. 25–61)
- **R1 (25–38):** Phenomena (longer CoTs, aha) overstated (Dr-GRPO analysis: bias + base already aha); SFT init interpretability claim vague on data provenance; 1K-sample SFT efficacy; language mixing as RL artifact; failures: PRM800K/DeepSeekMath PRMs, MCTS unsuccessful; distillation pipeline Qwen.
- **Kimi (39–48):** Curation balanced topics, filtered MC/T-F, best-of-8 failure selection; SFT via "prompt engineering" distillation; RL infra (rollout inefficiency, framework switch, batch unevenness from long CoT tail); scaling to small math wins; expert-iteration ablation (positives-only vs negative grads → negatives win).
- **Qwen 3 (49–61):** Overall picture RLHF-after-reasoning; filtering (no-CoT correct → drop, sim-filter vs val, manual guess filter); GRPO 3995; thinking fusion + test-time scaling curves; composition table showing RLHF dip on math; agentic Qwen 3 Coder Next: midtraining sources (GitHub 600B repo-concat, Joint text+code LLM HTML parse, synthetic QA/trajectories, FIM), expert models (web/UX/QA/SWE), distillation, agent env auto-build 800K, RL loop.
- **General infra note:** on-policy = slow inference, training↔rollout framework gap, long CoTs cause stragglers.

## Notable Quotes
> "With RLHF: we can't cleanly scale out due to overoptimization. Can we work in domains where RL excels? Where we optimize exactly what we want." — goal slide

> "You know you're in for a bad time if there's a blog post like this... PPO in practice — we need to look at a live implementation." — PPO caveat

> "GRPO is very simple (thanks to lack of value function)... You can (and people do) write tiny GRPO implementations." — simplification punchline

## Concepts Introduced or Referenced
- [[rlhf]] — RLVR as verifiable generalization solving RLHF overoptimization; PPO/KL/GAE foundations.
- [[direct-preference-optimization]] — DPO lineage (Kimi DPO-inspired squared-loss derivation) vs GRPO; reference-regularized PG.
- [[reasoning-llms]] / [[thinking-models]] — long-CoT phenomena, aha, test-time scaling, expert iteration vs RL.
- [[supervised-fine-tuning]] — cold-start SFT (1K–800K traces) as prerequisite/enabler for RL; post-RLVR SFT pattern.
- [[synthetic-data]] — synthetic SWE tasks, CoT traces for distillation, LLM HTML parsing as synthetic supervision.
- [[pretraining]] / [[data-curation]] — midtraining repo-level 600B as pretraining→RLVR bridge.

## Critical Assessment
Practical complement to Lecture 15: moves from abstract reward-overoptimization to concrete GRPO hygiene (stdev/length fixes) and replicate-friendly recipes (R1-Zero minimal: accuracy+format, Kimi late length control). Strength: candid about negative results (PRM/MCTS failures, language mixing, overstated aha) and infra reality. Limitation per slide: R1 data not public, Kimi SFT details minimal, Qwen numbers partly contemporaneous-to-lecture — treat as pattern template not fixed recipe. Directly enriches [[reasoning-llms]] and [[rlhf]] with RLVR nuance and supplies the Assignment 5 GRPO bridge.

---

**Source:** CS336 Lecture 16 — Post-training 2: Reinforcement Learning from Verifiable Rewards (Tatsu Hashimoto) by Tatsu Hashimoto (Stanford CS336, Spring 2026) — <https://raw.githubusercontent.com/stanford-cs336/lectures/main/lecture_16.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
