---
type: source-summary
title: "DAPO: An Open-Source LLM Reinforcement Learning System at Scale"
summary: The March 2025 ByteDance Seed paper (Yu et al., arXiv 2503.14476, v2 May 2025) open-sources a state-of-the-art large-scale LLM RL system that reaches 50 points on AIME 2024 with Qwen2.5-32B base, surpassing…
status: draft
visibility: public
author: "Qiying Yu, Zheng Zhang, Ruofei Zhu, Yufeng Yuan et al. (ByteDance Seed, Tsinghua AIR)"
source-type: paper
url: "https://arxiv.org/abs/2503.14476"
date-published: 2025-03-17
date-ingested: 2026-08-25
tags:
  - fine-tuning
  - llm-fundamentals
  - inference
  - eval-safety
key-concepts:
  - "[[thinking-models]]"
  - "[[reasoning-llms]]"
  - "[[rlhf]]"
  - "[[inference]]"
  - "[[evaluation]]"
  - "[[chain-of-thought]]"
key-entities:
  - "[[openai]]"
  - "[[deepmind]]"
aliases:
  - wiki/source-dapo
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The March 2025 ByteDance Seed paper (Yu et al., arXiv 2503.14476, v2 May 2025) open-sources a state-of-the-art large-scale LLM RL system that reaches 50 points on AIME 2024 with Qwen2.5-32B base, surpassing…</p>
<p class="kb-provenance">Qiying Yu, Zheng Zhang, Ruofei Zhu, Yufeng Yuan et al. (ByteDance Seed, Tsinghua AIR), 2025-03-17. <a href="https://arxiv.org/abs/2503.14476">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
The **March 2025 ByteDance Seed paper (Yu et al., arXiv 2503.14476, v2 May 2025)** open-sources a **state-of-the-art large-scale LLM RL system** that reaches **50 points on AIME 2024 with Qwen2.5-32B base**, surpassing **DeepSeek-R1-Zero-Qwen-32B (47)** with **50% fewer steps**. Diagnosing vanilla GRPO's **entropy collapse, reward noise, and gradient dilution** on long-CoT RL, the authors propose **DAPO (Decoupled Clip and Dynamic sAmpling Policy Optimization)** — four orthogonal fixes: **Clip-Higher** (decoupled upper/lower clip), **Dynamic Sampling** (filter zero-gradient groups), **Token-Level Policy Gradient Loss**, and **Overlong Reward Shaping (soft punishment)**, plus integer-answer dataset curation (DAPO-Math-17K). Code built on **verl/HybridFlow** and data are fully released.

## Key Takeaways
1. **GRPO baseline collapses**: Naive GRPO on Qwen2.5-32B achieves only **30 AIME** vs R1-Zero's 47. Entropy of policy drops sharply (Figure 2), outputs per group become near-identical (exploration collapse), and proportion of prompts with accuracy 1.0 steadily rises → many groups have **zero advantage** (identical rewards) → batch gradient magnitude shrinks, variance spikes.
2. **Clip-Higher (raise the ceiling)**: Decouple clipping to **ε_low=0.2, ε_high=0.28** (vs symmetric 0.2). Analysis: for low-prob "exploration" tokens (p=0.01), symmetric clip caps uplift to 0.012, while high-prob tokens (0.9) can still climb to 1.08 — exploration starved. Raising ε_high lets low-prob tokens be more reinforced, restoring entropy/diversity without pushing high-prob tokens to 0. Empirically +2 points (36→38) and halts collapse; increasing ε_low instead collapses sampling space.
3. **Dynamic Sampling (more the merrier)**: If all G samples for a prompt are **all-correct or all-wrong**, advantage = 0 → wasted compute and noisy gradients. DAPO **over-samples and filters** until batch is full of prompts with **0 < |correct| < G** (Equation 11). Despite oversampling, generation is dominated by long-tail samples anyway, so walltime not increased; convergence faster (Figure 6) with **+8 points** final (42→50).
4. **Token-Level Loss (rebalancing act)**: Vanilla GRPO averages **per-sample then per-batch** (each sample equal weight). Long samples thus have per-token gradient diluted; long & low-quality (gibberish/repetitive) not penalized enough → entropy and length blow up unhealthily (Figure 4). DAPO switches to **token-level**: `1/∑|o_i| ∑_i ∑_t` (global token average). Longer sequences contribute proportionally more — high-quality long samples reinforced, repetitive long samples suppressed. +1 point plus stability.
5. **Overlong Reward Shaping (hide and seek)**: Default punitive -1 reward for truncated samples (max length exceeded) **noises training** — a sound reasoning chain penalized merely for length confuses model. **Overlong Filtering** (mask loss for truncated) already jumps 30→36. **Soft Overlong Punishment** refines: `R_length = 0 if |y|≤Lmax-Lcache, linear ramp (Lmax-Lcache -|y|)/Lcache if in cache, -1 if >Lmax` (Eq 13, Lmax 20480, Lcache 4096, expected 16384). Rewards decay linearly in cache window — signals to avoid excessive length without hard cliff. +3 points (38→41) over filtering alone, stabilizes entropy.
6. **Dataset transformation (DAPO-Math-17K)**: Mix of web-scraped/competition math with diverse answer formats (expressions, formulas) → hard to verify via rules. Transform answers to **integers** via LLM rewriting (e.g., ` (a+√b)/c → a+b+c`), following AIME style — enables reliable `is_equivalent` rule reward (1 / -1). 17K prompts, each integer answer, easy parsing.
7. **DAPO objective & training**: Unified `J_DAPO = E[ 1/∑|o_i| ∑_i ∑_t min(r·Â, clip(r,1-ε_low,1+ε_high)·Â) ] s.t. 0<|correct|<G`. **No KL penalty** (long-CoT diverges far from init, restriction unnecessary — same as R1). Hyperparams: AdamW 1e-6, prompt batch 512, 16 samples/prompt, mini-batch 512 (16 grad steps per rollout), temp 1.0 eval avg@32. Progressive ablation: Naive 30 → +Overlong Filter 36 → +Clip-Higher 38 → +Soft Punish 41 → +TokenLoss 42 → +Dynamic Sampling **50** (Table 1).
8. **Training dynamics as monitoring**: Figure 7 tracks **length, reward, entropy, mean probability** — length not monotonic (stalls/declines periods), reward steadily climbs but **overfits train set** (val accuracy uncorrelated), entropy must stay in band (too low = deterministic, too high = gibberish). Clip-Higher needed to keep slow upward entropy trend.

## Detailed Notes

### Why GRPO Fails at Scale (Section 2)
- PPO clip stabilizes but dual clip symmetric binds low-prob tokens disproportionately. Value model eliminated in GRPO saves compute but relies on group baseline — when group variance 0, baseline fails.
- Rule-based reward `R(ŷ,y)=1 if equivalent else -1` avoids RM hacking (cited Amodei 2016, Gao 2022, Weng 2024); follows theorem proving/code/math prior work.

### Clip-Higher Intuition (Section 3.1)
- Mean up-clipped probability <0.2 empirically — confirms bound hits exploration tokens. Decoupling is minimal code change with large effect.

### Dynamic Sampling Implementation (Algorithm 1)
- Rollout buffer: sample G per question, compute rewards, filter, buffer until nb≥N (512). If not enough effective prompts, continue sampling — dynamic batch construction. Inner loop μ updates per buffer.

### Token vs Sample Loss (Section 3.3)
- Derivation: sample-level `1/G ∑ 1/|o_i| ∑_t` vs token-level `1/∑|o_i| ∑∑`. Latter equals weighting each token equally regardless of which sample it belongs to — fair credit for patterns appearing in long contexts.

### Overlong Details (Section 3.4)
- Max generation 20480 = 16384 expected + 4096 cache. Linear penalty gentle enough to not punish near-boundary good reasoning.

### Emergent Reflection (Table 2, Section 4.4)
- Same "wait, let's rethink" reflective behavior as R1 emerges — but training is faster/stable with DAPO fixes.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 4 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2503.14476](https://arxiv.org/abs/2503.14476)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "We propose the Decoupled Clip and Dynamic sAmpling Policy Optimization (DAPO) algorithm ... which achieves 50 points on AIME 2024 using Qwen2.5-32B base model." — Abstract

> "The sampled responses of certain groups tend to be nearly identical ... limited exploration and early deterministic policy ... hinder scaling." — Section 3.1 (entropy collapse)

> "If all outputs {o_i} of a particular prompt are correct ... advantage ... is zero. A zero advantage results in zero policy gradients, shrinking magnitude and increasing noise sensitivity." — Section 3.2

> "Improper reward shaping for truncated samples can introduce reward noise and significantly disrupt training." — Section 3.4

## Concepts Introduced or Referenced
- [[thinking-models]] — Long-CoT RL stability: entropy as health metric; length scaling not monotonic.
- [[reasoning-llms]] — Verifiable math RL (Qwen2.5-32B) surpassing R1-Zero with open recipe.
- [[rlhf]] — GRPO→DAPO evolution, clipping, KL removal, token-level credit assignment.
- [[inference]] — Overlong handling directly conditions inference length 20K, cost/efficiency.
- [[evaluation]] — AIME 50 vs 47, progressive ablations, length/reward/entropy monitoring.
- [[chain-of-thought]] — Long-CoT 16K–20K, reflection emerges without explicit teaching.
- [[self-consistency]] — Baseline vs DAPO gains; rejection of zero-gradient groups akin to filtering.

## Critical Assessment
- **Strengths**: First fully open large-scale RL system matching industry (50 AIME from 32B base) with reproducible code/data; each of 4 techniques ablated cleanly with +2 to +8 points; deep dynamics analysis (Figure 7) practical for practitioners; integer-answer curation clever for verifiable rewards.
- **Weaknesses**: Focus narrowly on **math (DAPO-Math-17K, AIME)** — transfer to code/general helpfulness not evaluated; dynamic sampling oversampling cost hidden (though claimed dominated by long-tail); token-level loss may overweight pathological long repetitive samples before filtering — interplay with overlong not fully disentangled; entropy collapse fix via ε_high tuned empirically (0.28) may not generalize across model scales.
- **Relation to R1**: Directly builds on [[source-deepseek-r1]] GRPO + rule rewards; shows vanilla R1 recipe leaves performance on table (30→50). Validates R1's no-KL and reflection findings, adds stability layer. Complements [[source-scaling-test-time-compute]] — DAPO optimizes training to enable better test-time scaling, but does not address difficulty-adaptive inference budgeting.

---

**Source:** DAPO: An Open-Source LLM Reinforcement Learning System at Scale by Qiying Yu, Zheng Zhang, Ruofei Zhu, Yufeng Yuan et al. (ByteDance Seed, Tsinghua AIR) — <https://arxiv.org/abs/2503.14476>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
