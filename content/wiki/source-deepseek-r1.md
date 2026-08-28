---
type: source-summary
title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning"
summary: The January 2025 DeepSeek-AI paper (arXiv 2501.12948) demonstrates that pure reinforcement learning (RL) without supervised fine-tuning (SFT) can incentivize emergent reasoning in LLMs.
status: draft
visibility: public
author: "DeepSeek-AI"
source-type: paper
url: "https://arxiv.org/abs/2501.12948"
date-published: 2025-01-22
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
  - fine-tuning
  - eval-safety
  - inference
key-concepts:
  - "[[thinking-models]]"
  - "[[reasoning-llms]]"
  - "[[rlhf]]"
  - "[[inference]]"
  - "[[chain-of-thought]]"
  - "[[self-consistency]]"
  - "[[evaluation]]"
key-entities:
  - "[[deepmind]]"
  - "[[openai]]"
---

# DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning

## Summary
The **January 2025 DeepSeek-AI paper (arXiv 2501.12948)** demonstrates that **pure reinforcement learning (RL) without supervised fine-tuning (SFT)** can incentivize emergent reasoning in LLMs. Starting from **DeepSeek-V3-Base** and optimizing with **Group Relative Policy Optimization (GRPO)** against **rule-based verifiable rewards** (accuracy + format), the authors train **DeepSeek-R1-Zero** — which jumps from **15.6% → 71.0% AIME 2024 pass@1** (86.7% cons@64) with steadily lengthening chain-of-thought — and then **DeepSeek-R1** via a **cold-start SFT (thousands of curated long-CoT) → reasoning RL → rejection-sampling SFT (800K mixed reasoning/non-reasoning) → second RL for helpfulness/harmlessness** pipeline. R1 matches OpenAI o1 on math/code/STEM while fixing Zero's readability and language-mixing, and **distillation of R1 traces to Qwen/Llama (1.5B–70B)** surpasses RL-from-scratch at small scale.

## Key Takeaways
1. **R1-Zero: SFT is optional for reasoning**: Skipping SFT and RL-tuning V3-Base directly with only `DeepSeek-R1-Zero`'s outcome reward (boxed answer / compiler pass) + `<think>/<answer>` format reward yields **77.9% AIME 2024 pass@1, 86.7% cons@64** (DeepSeek evaluation) and strong Codeforces (1444→2029) — evidence that SFT biases/exploration caps can be avoided. Response length and reflection ("aha moment": model spontaneously learns to say "Wait, wait... let's reevaluate") grow intrinsically with training steps (8.2K context jump 32K→65K).
2. **GRPO simplified RL**: GRPO samples **G=16 outputs per prompt**, computes **group-relative advantage** \(A_i = (r_i - mean)/std\) without a learned value model, optimizing clipped objective plus **KL 0.001** (Zero) or **no KL but language-consistency reward** (R1). Rollouts: temperature 1.0, batch 512, replacing reference every 400 steps; single inner epoch over 8,192 rollouts → efficiency at 10K+ steps (1.6 epochs). Appendix compares to PPO, justifies KL removal for long-CoT divergence.
3. **Reward design: rules > neural RMs for verifiable tasks**: Accuracy reward via deterministic verifiers (math boxed answer equivalence, code unit-test pass) + format reward equally weighted; **no neural PRM/ORM** for reasoning (prone to hacking, costly retraining). Language-consistency reward \(Num(target)/Num(total)\) added in R1 to penalize Zh/En mixing (slight performance cost, human preference gain). General data in stage-2 RL uses **model-based helpful/safety RMs** (66K helpful pairs, 106K safety point-wise) summarizing over final answer (helpfulness) vs whole trace (safety).
4. **Multi-stage R1 pipeline (Figure 2)**: **Cold-start SFT** (thousands of long-CoT exemplars with readable `<think>` enriched by rejection-sampling) → **RL stage 1** (reasoning, clip 0.2→10 ablation note, language reward) → **Rejection-sampling + SFT** (600K reasoning curated via R1 + 200K non-reasoning: writing, QA, tool) → **RL stage 2** (mixed reasoning rule-reward + general RM + language reward, temp 0.7, 1700 steps, only last 400 with general data) → R1. Table 3: Dev1 (cold-start+RL1) → Dev2 (+RL) → Dev3 (+mixed SFT) → R1; instruction-following (IF-Eval 46.6→83.3, AlpacaEval 24.7→87.6, ArenaHard 53.6→92.3) climbs while math mostly preserved.
5. **Self-evolution dynamics**: During R1-Zero RL, performance and response length coevolve (Figure 1); qualitative shift at "aha moment" where intermediate policy inserts anthropomorphic reflection and verification, backtracking from flawed squaring steps — emergent via incentive, not teaching.
6. **Distillation > RL for small models**: R1's 800K traces distilled into **Qwen-32B/14B/7B/1.5B and Llama-70B/8B** yields stronger reasoning than direct RL on those bases (Section F). Example: **DeepSeek-R1-Distill-Qwen-32B 47% AIME** vs Zero-Qwen-32B 47% but at far lower cost; also transfers to **Llama-70B**. Validates "big teaches small" paradigm.
7. **Evaluation breadth + safety**: Standard benchmarks: **MMLU 90.8, MATH-500 97.3, AIME 79.8 (pass@1 R1), GPQA Diamond 71.5, LiveCodeBench 65.9, Codeforces 96.3 percentile**. Safety report (Appendix D.3) adds helpful/safety RMs plus rule-based risk filtering; notes unsuccessful PRM and MCTS ablations (Appendix G) — PRM hacking and search overhead not worth cost vs outcome reward.

## Detailed Notes

### GRPO Formulation (Eq 1–3)
- Objective: \(\mathcal{J}_{GRPO}= E[1/G \sum \min(ratio·A, clip(ratio,1-ε,1+ε)·A) - β KL]\), where \(ratio=π_θ/π_{old}\), \(A_i\) group-normalized. KL estimator unbiased: \(π_{ref}/π_θ - log -1\). Zero: lr 3e-6, KL 0.001, ε adaptive discussion; R1 RL1 ε=0.2→? Appendix B notes high clip (10) destabilizes, low truncates gradients.
- Sampling: 16 per question, max 32768 tokens (→65536 after 8.2K), batch 512, 10400 steps ≈1.6 epochs. Reference refresh every 400 steps. Single-epoch inner loop over 16 mini-batches per rollout.

### Template & Data
- Simple prompt: `User: {prompt}\nAssistant: <think> reasoning ... </think> <answer> answer </answer>` — only structural constraint, no content bias, to observe natural emergence.
- RL data: verifiable math/code/logic; SFT cold-start: few thousand human-curated long-CoT with language consistency; 800K SFT: 600K reasoning (R1 rejection sampled, verified) + 200K non-reasoning; general RL data distribution similar to V3 pipeline (preference pairs).
- Overlong handling: punitive reward for truncated samples deferred to DAPO-style shaping discussion; R1 observes length increase signals exploration but not monotonic (cf. DAPO dynamics).

### Why Not PRM/MCTS (Appendix G)
- **PRM failed**: reward hacking and training complexity outweighed gains; outcome rule sufficient when verifiable.
- **MCTS failed**: token-level search overhead high, gains limited vs sampling; consistent with DAPO finding that pure search without shaping plateaus.

### Infrastructure & Cost (Appendix B)
- High-performance RL infra (verl-like) with scalable rollout (8192 concurrent) and hybrid engine; training cost table B.4.4 lists GPU-hours; largest runs multi-week on thousands of H800.

## Notable Quotes
> "We show that the reasoning abilities of LLMs can be incentivized through pure reinforcement learning (RL), obviating the need for human-labeled reasoning trajectories." — Abstract

> "Rather than explicitly teaching the model how to solve a problem, we simply provide it with the right incentives, and it autonomously develops advanced problem-solving strategies. This is also an aha moment for us." — Section 2.3 (Table 2 commentary)

> "We abstain from applying neural reward models — whether outcome-based or process-based — to reasoning tasks ... susceptible to reward hacking." — Section 2.2

> "DeepSeek-R1-Zero naturally learns to solve reasoning tasks with more thinking time. Note that a training step refers to a single policy update." — Figure 1 caption

## Concepts Introduced or Referenced
- [[thinking-models]] — RLVR as System 2 enabler; test-time scaling via longer `<think>` traces; aha-moment self-reflection.
- [[reasoning-llms]] — Production pattern for LRMs (DeepSeek-R1/o1) with hidden deliberation and distillation to small models.
- [[rlhf]] — GRPO as PPO simplification (value model removed), rule-based vs model-based rewards, RL infrastructure.
- [[chain-of-thought]] — `<think>` traces as RL-optimized CoT, not prompt-engineered.
- [[self-consistency]] — AIME cons@16 metric; baseline for improvement.
- [[inference]] — Long-CoT 32K–65K decoding, KV-cache pressure, latency trade-off.
- [[evaluation]] — AIME, Codeforces, GPQA, MMLU, IF-Eval, ArenaHard holistic suite.
- [[pretraining]] — V3-Base as foundation (671B MoE, 14.8T tokens) — reasoning built on pretraining scale.

## Critical Assessment
- **Strengths**: Landmark demonstration that RL alone can elicit reflection/verification; clean rule-based reward avoids RM hacking; full pipeline (cold-start→RL→SFT→RL) balances reasoning and human preference; open-weights + distilled family democratizes LRMs; thorough safety and ablation appendices.
- **Weaknesses**: Results heavily on verifiable math/code where rule verifiers exist — generalization to open-ended, non-verifiable (writing, nuanced QA) relies on model-based RM in stage 2, with reward hacking risk (Appendix B.5); language-consistency trade-off slightly hurts math; evaluation includes 800K SFT distilled from R1 itself (partial circularity); training cost enormous, reproducibility barrier despite open weights.
- **Contradictions / Gaps**: Claims SFT-before-RL caps exploration, yet final R1 still needs cold-start SFT for readability — tension unresolved; PRM given up as hacking-prone vs Lightman/Snell showing PRM value — domain dependence (math process vs general helpfulness) warrants nuance. Complements [[source-scaling-test-time-compute]] (optimal test-time routing) but R1 does not discuss difficulty-adaptive budgeting.
- **Link to DAPO**: DAPO later shows R1-Zero-Qwen-32B at 47 AIME can be surpassed (50) with 50% steps via Clip-Higher/Dynamic Sampling — suggests R1's vanilla GRPO still has headroom.

---

**Source:** DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning by DeepSeek-AI — <https://arxiv.org/abs/2501.12948>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
