---
type: concept
title: "Thinking Models"
summary: Thinking Models (also referred to as Reasoning Models, such as OpenAI o1/o3 or DeepSeek-R1) represent a major architectural paradigm shift in LLM capabilities.
visibility: public
aliases:
  - Reasoning Models
  - Test-Time Compute
  - System 2 Reasoning
  - Inference-Time Scaling
  - wiki/thinking-models
tags:
  - llm-fundamentals
  - fine-tuning
  - inference
  - eval-safety
created: 2026-08-23
updated: 2026-08-25
status: draft
sources:
  - "[[source-chain-of-thought-prompting-elicits-reasoning]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "[[source-promptingguide-guides-reasoning-llms]]"
  - "[[source-lets-verify-step-by-step]]"
  - "[[source-scaling-test-time-compute]]"
  - "[[source-deepseek-r1]]"
  - "[[source-dapo]]"
  - "[[source-speculative-decoding]]"
  - "[[source-mmlu]]"
  - "[[source-helm]]"
related:
  - "[[chain-of-thought]]"
  - "[[self-consistency]]"
  - "[[tree-of-thoughts]]"
  - "[[rlhf]]"
  - "[[transformer]]"
  - "[[positional-encoding]]"
  - "[[hallucination]]"
  - "[[reasoning-llms]]"
  - "[[deep-agents]]"
  - "[[context-engineering]]"
  - "[[tool-use]]"
  - "[[evaluation]]"
  - "[[inference]]"
  - "[[scaling-laws]]"
  - "[[decoding-strategies]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Thinking Models (also referred to as Reasoning Models, such as OpenAI o1/o3 or DeepSeek-R1) represent a major architectural paradigm shift in LLM capabilities.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/prompt-engineering/concepts/self-consistency">Self-Consistency</a></li><li><a href="/prompt-engineering/concepts/tree-of-thoughts">Tree of Thoughts (ToT)</a></li><li><a href="/fine-tuning/concepts/rlhf">Reinforcement Learning from Human Feedback</a></li><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/positional-encoding">Positional Encoding</a></li><li><a href="/eval-safety/concepts/hallucination">Hallucination</a></li><li><a href="/agents/concepts/reasoning-llms">Reasoning LLMs</a></li><li><a href="/agents/concepts/deep-agents">Deep Agents</a></li><li><a href="/agents/concepts/context-engineering">Context Engineering</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li><li><a href="/inference/concepts/decoding-strategies">Decoding Strategies</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-chain-of-thought-prompting-elicits-reasoning">Chain-of-Thought Prompting Elicits Reasoning in Large Language Models</a></li><li><a href="/llm-fundamentals/sources/source-deep-dive-into-llms-like-chatgpt">Deep Dive into LLMs like ChatGPT</a></li><li><a href="/agents/sources/source-promptingguide-guides-reasoning-llms">Reasoning LLMs Guide — Prompt Engineering Guide (DAIR.AI) Guides</a></li><li><a href="/eval-safety/sources/source-lets-verify-step-by-step">Let's Verify Step by Step</a></li><li><a href="/inference/sources/source-scaling-test-time-compute">Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters</a></li><li><a href="/llm-fundamentals/sources/source-deepseek-r1">DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning</a></li><li><a href="/fine-tuning/sources/source-dapo">DAPO: An Open-Source LLM Reinforcement Learning System at Scale</a></li><li><a href="/inference/sources/source-speculative-decoding">Fast Inference from Transformers via Speculative Decoding</a></li><li><a href="/eval-safety/sources/source-mmlu">Measuring Massive Multitask Language Understanding (MMLU)</a></li><li><a href="/eval-safety/sources/source-helm">Holistic Evaluation of Language Models (HELM)</a></li></ul></nav>
</aside>

## Overview
**Thinking Models** (also referred to as **Reasoning Models**, such as OpenAI o1/o3 or DeepSeek-R1) represent a major architectural paradigm shift in LLM capabilities. Rather than generating immediate response tokens with a fixed compute budget per token, thinking models dynamically allocate variable **test-time compute** to generate structured internal reasoning traces (`<think> ... </think>`) before outputting the final answer. The paradigm was directly foreshadowed by Wei et al. (2022) in [[source-chain-of-thought-prompting-elicits-reasoning]] — where **[[chain-of-thought]]** prompting with just 8 exemplars let PaLM 540B emergent-ly solve GSM8K — and later scaled from prompting to *training* via RL with verifiable rewards (RLVR). [[source-deepseek-r1]] proves pure RL without SFT can elicit this natively (R1-Zero 15.6%→77.9% AIME), while [[source-dapo]] shows the engineering needed to stabilize that RL at scale.

## Key Ideas
- **System 1 vs. System 2 Cognition:** Standard autoregressive transformers operate like intuitive, fast "System 1" thinking. Thinking models introduce deliberate, reflective "System 2" computation, allowing the model to explore multiple hypotheses, verify logic, and backtrack when an error is encountered. Wei et al. showed this emerges via prompting at ~100B scale; [[source-deepseek-r1]] makes it native via RL.
- **Inference-Time Scaling Laws:** While traditional scaling laws focused on pretraining compute ($C = 6ND$), thinking models reveal that **scaling test-time compute** (generating longer, deeper reasoning traces or exploring search trees) linearly or super-linearly improves accuracy on complex reasoning benchmarks (e.g., AIME math, Codeforces, theorem proving). The original CoT paper already demonstrated variable compute via intermediate tokens correlates with problem difficulty. [[source-scaling-test-time-compute]] (Snell et al. 2024) systematically quantifies this: on MATH with PaLM 2-S*, **compute-optimal adaptive allocation** per difficulty (parallel best-of-N vs sequential revisions vs beam/lookahead search against PRM) yields **>4× efficiency** over fixed best-of-N; FLOPs-matched small model + optimal test-time compute can **outperform 14× larger pretrained model** (Y<<X regime), but hard tasks (L5) still favor larger pretraining — test-time ≠ pretraining 1-to-1 with current methods.
- **Self-Correction & Verification:** The model learns to critique its own intermediate steps, catch arithmetic mistakes, rewrite failing algorithms, and simulate execution before committing to a final response. Manual error analysis on LaMDA 137B (46% almost-correct vs 54% major errors) foreshadowed the need for verifiers later operationalized via [[self-consistency]] and RL. [[source-lets-verify-step-by-step]] formalizes this via **process-supervised reward models (PRMs)** — trained on PRM800K (800K step labels) to score each reasoning step (product of correctness probs) vs outcome-supervised ORMs (final answer only). PRM best-of-N reaches **78.2% MATH** vs ORM 72.4% vs majority 69.6%, and **2.6× data efficiency** via active learning on convincing wrong-answers; negative alignment tax. [[source-deepseek-r1]] deliberately **avoids PRMs** for verifiable tasks (prone to hacking, costly), using rule-based rewards instead; DAPO retains this choice.
- **RLVR via GRPO and DAPO Stabilization:** [[source-deepseek-r1]] introduces **Group Relative Policy Optimization (GRPO)** — samples G=16 outputs per prompt, computes group-normalized advantage \(A_i=(r_i-mean)/std\) without a value model, optimizing clipped objective \(min(ratio·A, clip(ratio,1-ε,1+ε)·A) - βKL\). [[source-dapo]] diagnoses three failure modes of vanilla GRPO at long-CoT scale and fixes them: **Clip-Higher (ε_low=0.2, ε_high=0.28)** to preserve exploration entropy for low-prob tokens, **Dynamic Sampling** to filter prompts where all G samples are all-correct/all-wrong (zero advantage → wasted gradient), **Token-Level Loss** \(1/∑|o_i| ∑∑\) to prevent long-sample dilution and penalize repetitive gibberish, and **Soft Overlong Punishment** (linear ramp over 4096 cache within 20480 max) to avoid noisy truncation penalties. Combined, DAPO lifts **Qwen2.5-32B AIME 30→50**, beating R1-Zero-Qwen-32B (47) with 50% steps.
- **Emergence and Distillation:** R1-Zero's "aha moment" — spontaneous insertion of "Wait, wait ... let's reevaluate" reflection and verification — emerges purely from incentive, not teaching (Figure 1, Table 2). The 800K mixed SFT traces from R1 then **distill** stronger reasoning into small models (Qwen 1.5B–32B, Llama 8B/70B) more efficiently than RL from scratch, validating big-teaches-small.

## How It Works
1. **Reinforcement Learning on Chain of Thought (RLVR):** Models are trained using pure RL with verifiable rewards on verifiable tasks (coding, mathematics, formal logic). Verifiers are PRMs via step-level supervision ([[source-lets-verify-step-by-step]]) or Monte Carlo rollout values ([[source-scaling-test-time-compute]] avoids human cost), but [[source-deepseek-r1]] shows **rule-based accuracy (boxed answer / unit tests) + format (`<think>/<answer>`)** suffices for math/code without neural RM — chosen to avoid hacking.
2. **GRPO / DAPO Optimization:** For each prompt, sample G=16 traces at temperature 1.0, compute binary rule reward (1 / −1 via `is_equivalent`), derive group advantage, apply DAPO's decoupled clipping and token-level objective subject to `0<|correct|<G` (dynamic sampling) and length-aware soft punishment. KL penalty removed for long-CoT (divergence from init expected). Reference refresh every 400 steps, batch 512, max 32K→65K tokens; R1 pipeline adds **cold-start SFT → RL1 → rejection-sampling SFT (600K reasoning +200K non-reasoning) → RL2 (general helpful/safety RM + language-consistency reward)** to fix readability/language-mixing.
3. **Hidden Deliberation Loop:** When prompted with a complex query, the model outputs thousands of hidden reasoning tokens detailing step-by-step logic, edge case analysis, and counter-examples. Difficulty estimated via pass@1 over 2,048 samples into 5 bins; predicted bins via averaged PRM scores enable adaptive budgeting ([[source-scaling-test-time-compute]]).
4. **Branch Exploration via Search:** Beyond single trace, system can run **parallel sampling (best-of-N), beam search (BFS-V keeping top N/M per step, expanding M), or lookahead/MCTS-like search (k-step rollout at temp 0)** scored by PRM (last-step or product aggregation) with best-of-N weighted marginalization across same final answers. Sequential revision chains (finetuned to correct prior attempts correlated by edit distance) offer alternative sequential axis. DAPO's token-level loss and overlong shaping keep search from exploiting repetitive low-info suffixes.
5. **Final Synthesis & Acceleration:** Once verified, clean answer emitted. Latency of long traces mitigated by **[[source-speculative-decoding]]**: draft γ tokens with small M_q, verify γ+1 in parallel with M_p, speculative sampling preserves distribution while reducing serial M_p calls by `(1-α^{γ+1})/(1-α)` and walltime by `/(γc+1)` (e.g., T5-small drafts T5-XXL 3.4× at temp 0) — critical for thinking-models serving.
6. **Distillation Path:** R1's long-CoT traces SFT small models directly — often more compute-efficient than RL for ≤70B scale.

## Practical Implications
- **Superhuman Reasoning in Verifiable Domains:** Drastically outperforms standard models on competitive coding, advanced calculus, physics problems, and multi-step agent planning — see [[reasoning-llms]] for orchestrator-worker planning, agentic RAG, and LLM-as-a-Judge patterns. Lightman's PRM proves stepwise verification further boosts reliability; R1/DAPO show outcome-rule RL suffices when verification is programmatically checkable.
- **Prompting Shift:** Avoid manual “think step-by-step” with native reasoners; instead provide explicit high-level constraints and structured I/O (prefer XML unless JSON required) and use hybrid thinking ladder (standard → low → medium → high). See arXiv:2505.11423 mitigations in [[reasoning-llms]].
- **Cost & Latency Trade-offs:** Test-time tokens incur real inference latency and cost; a difficult math problem may take 30–60 seconds of thinking. Optimize accuracy first, then latency via smaller distilled model (Claude 3.7 Sonnet / Distill-Qwen-32B) or streaming or **speculative decoding** (2–3× without changing outputs) — per [[reasoning-llms]] and [[source-speculative-decoding]]. Snell adds budgeting strategy: easy → sequential revisions (refine near-correct), medium → parallel/beam search, hard L5 → diminishing returns (consider larger pretraining instead); FLOPs analysis (6ND vs 2NY) determines when smaller + test-time beats 14× larger. DAPO adds training stability: monitor **entropy (keep slow upward), length, reward** — collapse → raise ε_high, filter zero-gradient groups.
- **Tool Calling Caveat:** Reasoning models can have weak parallel/multi-tool calling (esp. DeepSeek-R1/Qwen) unless explicitly trained; impacts [[deep-agents]] designs.
- **Reduction in Hallucination:** Internal self-verification significantly decreases logical and factual [[hallucination]] on complex multi-step reasoning; PRM's per-step scoring catches errors before final answer, though R1 trades PRM for rule precision on verifiable subset.
- **Evaluation discipline:** Benchmark via [[evaluation]]: track MMLU calibration (gap up to 24% → trust risk) and HELM multi-metric trade-offs (instruction tuning ↑ accuracy ↓ calibration); report difficulty-binned test-time curves, not single greedy score; monitor AIME avg@32, entropy, and length dynamics as DAPO recommends.

## Connections
- Extends the core [[transformer]] sequence decoding loop; inference scaling complements [[scaling-laws]] pretraining scaling (C=6ND) with test-time counterpart; positional extrapolation via [[positional-encoding]] RoPE enables long CoT contexts (32K–65K) and music/image long sequences.
- Trained via verifiable reward mechanisms within [[rlhf]] frameworks; GRPO is PPO simplification, DAPO its stabilized successor; PRM is dense process-level RM variant vs R1's sparse rule RM.
- Improves planning and resilience in autonomous [[tool-use]] / [[function-calling]] agents and [[deep-agents]] orchestrators.
- Evaluated by [[evaluation]] (MMLU/HELM, AIME, Codeforces) and billed under [[inference]] (beam/lookahead cost, KV cache, speculative decoding).
- Detailed practitioner guide in [[reasoning-llms]] (usage tips, design patterns, limitations); styled via [[context-engineering]]; decoded via [[decoding-strategies]] (temperature/top-p standardized).

## Open Questions
- Can test-time compute scaling generalize effectively to subjective, non-verifiable domains (e.g., creative writing, nuanced legal arguments)? Lightman's neutral labels defer ambiguity; Snell's L5 stagnation suggests limits; R1's stage-2 general RM attempts but risks hacking (Appendix B.5).
- What is the computational limit where additional reasoning tokens yield diminishing returns? Snell shows beam degrades on easy at high budget due to PRM exploitation (repetitive/collapsed solutions) — need verifier regularization; Lightman shows gap widens with best-of-N up to 1860 without saturation, but may plateau beyond. DAPO shows soft overlong helps but optimal Lmax/Lcache not universal.
- How to cheaply estimate difficulty for compute-optimal routing without 2,048 samples — can classifier or single-pass verifier proxy survive? DAPO's dynamic sampling mitigates zero-gradient waste but not difficulty-aware allocation.
- When does test-time compute substitute for pretraining? Snell's Y/X ratio analysis gives partial answer (Y<<X favors test-time); DAPO's 14× vs R1's MoE scale suggests smaller + DAPO RL may beat giant pretraining for few-query regimes — need broader domain validation beyond math.
- Does DAPO's ε_high, token-level weighting, and overlong hyperparameters transfer across model families/scales or require per-architecture tuning?

## Sources
- [[source-deep-dive-into-llms-like-chatgpt]]
- [[source-promptingguide-guides-reasoning-llms]]
- [[source-chain-of-thought-prompting-elicits-reasoning]]
- [[source-lets-verify-step-by-step]]
- [[source-scaling-test-time-compute]]
- [[source-deepseek-r1]]
- [[source-dapo]]
- [[source-speculative-decoding]]
- [[source-mmlu]]
- [[source-helm]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
