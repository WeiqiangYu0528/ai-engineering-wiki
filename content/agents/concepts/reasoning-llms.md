---
type: concept
title: "Reasoning LLMs"
summary: Reasoning LLMs (Large Reasoning Models, LRMs) are models explicitly trained to perform native chain-of-thought — generating hidden deliberation traces before answering — enabling inference-time compute scaling.
visibility: public
aliases:
  - Large Reasoning Models
  - LRMs
  - Thinking Models
  - wiki/reasoning-llms
tags:
  - agents
  - llm-fundamentals
  - inference
  - eval-safety
created: 2026-08-24
updated: 2026-08-25
status: draft
sources:
  - "[[source-promptingguide-guides-reasoning-llms]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "[[source-promptingguide-research-llm-reasoning]]"
  - "[[source-promptingguide-research-thoughtsculpt]]"
  - "[[source-promptingguide-research-guided-cot]]"
  - "[[source-lets-verify-step-by-step]]"
  - "[[source-scaling-test-time-compute]]"
  - "[[source-deepseek-r1]]"
  - "[[source-dapo]]"
  - "[[source-speculative-decoding]]"
  - "[[source-mmlu]]"
  - "[[source-helm]]"
related:
  - "[[thinking-models]]"
  - "[[ai-agents]]"
  - "[[deep-agents]]"
  - "[[context-engineering]]"
  - "[[tool-use]]"
  - "[[inference]]"
  - "[[thoughtsculpt]]"
  - "[[guided-cot]]"
  - "[[chain-of-thought]]"
  - "[[evaluation]]"
  - "[[self-consistency]]"
  - "[[rlhf]]"
  - "[[post-training-lineage]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Reasoning LLMs (Large Reasoning Models, LRMs) are models explicitly trained to perform native chain-of-thought — generating hidden deliberation traces before answering — enabling inference-time compute scaling.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/thinking-models">Thinking Models</a></li><li><a href="/agents/concepts/ai-agents">AI Agents</a></li><li><a href="/agents/concepts/deep-agents">Deep Agents</a></li><li><a href="/agents/concepts/context-engineering">Context Engineering</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/prompt-engineering/concepts/thoughtsculpt">THOUGHTSCULPT</a></li><li><a href="/prompt-engineering/concepts/guided-cot">LM-Guided Chain-of-Thought</a></li><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li><li><a href="/prompt-engineering/concepts/self-consistency">Self-Consistency</a></li><li><a href="/fine-tuning/concepts/rlhf">Reinforcement Learning from Human Feedback</a></li><li><a href="/fine-tuning/concepts/post-training-lineage">Post-Training Lineage: What Actually Replaced What</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/agents/sources/source-promptingguide-guides-reasoning-llms">Reasoning LLMs Guide — Prompt Engineering Guide (DAIR.AI) Guides</a></li><li><a href="/llm-fundamentals/sources/source-deep-dive-into-llms-like-chatgpt">Deep Dive into LLMs like ChatGPT</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-research-llm-reasoning">LLM Reasoning — Survey Overview</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-research-thoughtsculpt">THOUGHTSCULPT — Reasoning with Intermediate Revision and Search</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-research-guided-cot">LM-Guided Chain-of-Thought — Small LM Rationale Generation with RL</a></li><li><a href="/eval-safety/sources/source-lets-verify-step-by-step">Let's Verify Step by Step</a></li><li><a href="/inference/sources/source-scaling-test-time-compute">Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters</a></li><li><a href="/llm-fundamentals/sources/source-deepseek-r1">DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning</a></li><li><a href="/fine-tuning/sources/source-dapo">DAPO: An Open-Source LLM Reinforcement Learning System at Scale</a></li><li><a href="/inference/sources/source-speculative-decoding">Fast Inference from Transformers via Speculative Decoding</a></li><li><a href="/eval-safety/sources/source-mmlu">Measuring Massive Multitask Language Understanding (MMLU)</a></li><li><a href="/eval-safety/sources/source-helm">Holistic Evaluation of Language Models (HELM)</a></li></ul></nav>
</aside>

## Overview
**Reasoning LLMs** (Large Reasoning Models, LRMs) are models explicitly trained to perform *native* chain-of-thought — generating hidden deliberation traces before answering — enabling inference-time compute scaling. Exemplars: Gemini 2.5 Pro, Claude 3.7 Sonnet / Claude 4, OpenAI o3/o4-mini, DeepSeek-R1. They extend [[thinking-models]]’ System 2 / test-time scaling paradigm into production prompting and agentic patterns.

## Key Ideas
- **Training & behavior:** Trained via RL on verifiable tasks to produce structured internal reasoning, explore branches, self-correct, and backtrack before final synthesis — distinct from manual CoT prompting of instruct models. [[source-lets-verify-step-by-step]] shows **process supervision (PRM)** training verifiers on each reasoning step (PRM800K: 800K step labels over 75K solutions) outperforms outcome supervision (ORM: final-answer only) — **78.2% vs 72.4% vs 69.6% majority** on MATH best-of-1860, with negative alignment tax (safer and more capable).
- **Open recipes for training reasoners (DeepSeek-R1 / DAPO):** [[source-deepseek-r1]] proves pure RL suffices: R1-Zero (GRPO + rule-based accuracy/format rewards on DeepSeek-V3-Base) reaches **77.9% AIME pass@1** with emergent "aha moment" self-reflection; the production R1 adds a four-stage pipeline — cold-start SFT → reasoning RL → rejection-sampling SFT (600K reasoning + 200K non-reasoning) → general RL with helpful/safety RM + language-consistency reward — fixing readability and language mixing while matching o1 (MMLU 90.8, Codeforces 96.3 percentile). [[source-dapo]] stabilizes the same recipe at scale on Qwen2.5-32B (**30→50 AIME**, beating R1-Zero-Qwen-32B's 47 with half the steps) via four orthogonal fixes: **Clip-Higher** (ε_low=0.2, ε_high=0.28 preserves exploration entropy), **Dynamic Sampling** (filter zero-gradient all-correct/all-wrong groups), **Token-Level Loss** (global token average prevents long-sample dilution), and **Soft Overlong Punishment** (linear ramp over a 4096 cache within 20480 max instead of noisy truncation cliffs).
- **Distillation beats RL at small scale:** R1's 800K curated long-CoT traces distilled into Qwen (1.5B–32B) and Llama (8B/70B) bases yield stronger reasoners than RL-from-scratch on those bases — the practical path for deploying LRMs cheaply ([[source-deepseek-r1]] Section F).
- **Design patterns:**
  - *Planning for agentic systems:* Reasoning planner breaks queries → orchestrates searches (orchestrator-worker).
  - *Agentic RAG:* Retrieval agent with reasoning chain routes complex queries via [[function-calling]] over large KBs.
  - *LLM-as-a-Judge:* Evaluator-optimizer loop — reasoning evaluator assesses predictions and feeds feedback to meta-prompt for iterative optimization. PRMs operationalize this as **process-based LLM-as-a-Judge** scoring each step.
  - *Visual reasoning:* o3 multi-tool image manipulation (zoom/crop/rotate) within chain-of-thought (e.g., crossword).
  - *Verifier-guided search:* [[source-scaling-test-time-compute]] unifies proposer (revision model) and verifier (PRM) — best-of-N, beam search BFS-V, and lookahead/MCTS-like search. Product (Lightman) or last-step (Snell) aggregation + best-of-N weighted (marginalize same answers, cf. [[self-consistency]]) selects final answer.
  - Others: large-dataset QA, codebase review, scientific coding, literature synthesis, routine generation (meta-prompting), data validation, multi-step planning.
- **Usage tips (core):** Use strategically for reasoning-heavy modules only (separation of concerns); scale thinking effort low→medium→high; be explicit but *avoid* manual chain-of-thought instructions; structure I/O with delimiters and JSON/XML (prefer XML unless JSON required; note Claude 4 mirrors prompt structure); add few-shot when style requires; descriptive modifiers improve code/output (“Add hover states, transitions, micro-interactions”).
- **Hybrid reasoning ladder:** Start with standard (thinking off) + manual CoT → if shallow/mistaken, enable native thinking low → medium → high → add few-shot. References spreadsheet `1Ru587…` and benchmark hubs (Chatbot Arena, General Reasoning, Agent Leaderboard).
- **Compute-optimal test-time scaling:** [[source-scaling-test-time-compute]] (PaLM 2-S* on MATH) finds optimal strategy is **difficulty-dependent** — easy questions favor sequential revisions, medium (L3–L4) favor beam search, hard L5 resists all. Adaptive per-difficulty allocation yields **>4× efficiency** over fixed best-of-N (16 vs 64 generations). Define difficulty via pass@1 over 2,048 samples (5 bins); model-predicted bins via PRM scores approximate oracle. Overoptimization warning: beam/lookahead exploit PRMs at high budgets (repetitive low-info suffixes, 1–2 step collapses) and degrade on easy questions.
- **Evaluation grounding:** [[source-mmlu]] (57 subjects, calibration gap up to 24%) and [[source-helm]] (42 scenarios × 7 metrics, no Pareto winner) provide holistic benchmarks for reasoning models; instruction tuning ↑ accuracy but ↓ calibration/fairness per HELM — prompting standardization critical.

## How It Works
```
Prompt (explicit constraints, no manual CoT, structured I/O)
  │
  ▼
[ Reasoning LLM — RL-trained deliberation ]
  Hidden trace: hypothesis exploration → verification → branch pivot
  (allocates variable test-time tokens)
  │
  ▼
[ Optional Verifier Loop — from [[source-lets-verify-step-by-step]] / [[source-scaling-test-time-compute]] ]
  Generator → N candidates (parallel) or sequential revisions (edit-distance correlated)
  → PRM scores each step (product or last-step) → beam search (N/M keep, M expand) or lookahead k-step rollout
  → best-of-N weighted (marginalize verifier scores across same final answer)
  │
  ▼
Final answer (clean, often via structured output schema)
```
- Inference-time scaling: more thinking tokens → higher accuracy; “optimize accuracy first, then latency/cost.” **But** [[source-scaling-test-time-compute]] shows non-monotonic: more search tokens can *hurt* via PRM exploitation (easy questions degrade with beam at high budget); needs difficulty-adaptive budgeting and verifier regularization.
- Pretraining vs test-time trade-off: In FLOPs-matched analysis (6ND pretraining vs 2NY inference), smaller model + optimal test-time compute can **outperform 14× larger model** when inference/pretraining ratio Y<<X; as Y/X grows, hard tasks still favor larger pretraining (Snell Figure 1 right) — not 1-to-1 interchangeable with current methods.
- Training loop mechanics ([[source-deepseek-r1]] / [[source-dapo]]): GRPO samples G=16 rollouts per prompt, advantage = group-normalized reward, no value model; rule rewards (`is_equivalent` boxed-answer check / unit tests) + format reward replace neural RMs on verifiable tasks (hacking-prone per Appendix G — failed PRM and MCTS ablations); KL penalty dropped for long-CoT. DAPO adds dynamic batch construction (over-sample → filter until `0<|correct|<G`), decoupled clipping, token-level objective, and length shaping; monitor **entropy (slow upward), response length, and reward curves** as training health metrics.

## Practical Implications
- **Prompting inversion:** With reasoning models, avoid “think step-by-step” — it degrades instruction-following (arXiv:2505.11423). Instead give high-level constraints + desired output. Mitigations if needed: few-shot, self-reflection, self-selective/classifier-selective reasoning.
- **Cost/latency:** Significantly higher tokens + latency; mitigations: streaming, smaller reasoners (Claude 3.7 Sonnet), strategic module use. [[source-scaling-test-time-compute]] adds nuance: **parallel vs sequential** budgeting — sequential revisions better for easy (near-correct initial), parallel/beam better for medium-hard requiring exploration; hybrid allocation per difficulty maximizes ROI. Serving long traces is memory-bandwidth-bound decoding — **[[source-speculative-decoding]]** drafts γ tokens with a small model and verifies in parallel with the target, provably preserving the output distribution while cutting walltime ~2–3× (T5-small→XXL 3.4× at temp 0) when spare compute exists.
- **Tool calling caveat:** Parallel/multi-tool calling historically weak for R1/Qwen and still variable for o3 — needs explicit training for world-action agents; affects [[deep-agents]] designs.
- **Verifier investment:** Train PRMs via process labels (PRM800K) or Monte Carlo rollouts (Snell avoids 800K human cost due to distribution shift) — last-step aggregation + weighted voting often suffices; active learning by surfacing convincing wrong-answers yields 2.6× data efficiency (Lightman) — prioritize high-scoring failures for labeling.
- **Benchmarking discipline:** Evaluate via [[evaluation]]: report MMLU/HELM multi-metric profiles and difficulty-binned test-time curves, not just greedy accuracy; monitor ECE calibration (MMLU gap 24%, HELM shows instruction tuning hurts calibration) and HELM robustness/fairness trade-offs.

## Connections
- Specialization of [[thinking-models]] (test-time scaling, RLVR, hidden loops) with practitioner prompting guidance; Snell operationalizes thinking-models scaling laws with concrete proposer-verifier trade-offs.
- Powers [[ai-agents]]/[[deep-agents]] planning, agentic RAG, and verification (LLM-as-a-Judge) now formalized as **PRM-guided search** ([[source-lets-verify-step-by-step]]).
- Styled via [[context-engineering]] (structured outputs, few-shot) and billed under [[inference]] (prefill/decoding, KV cache, temperature).
- Evaluated by [[evaluation]] (MMLU breadth, HELM multi-metric) and calibrated via HELM metrics.

## Open Questions
- Diminishing returns of reasoning tokens for subjective/non-verifiable domains? Lightman's neutral labels and Snell's hardest-bin stagnation (L5: no method progresses) suggest limits where "correct step" ill-defined.
- How to auto-route complexity to thinking vs non-thinking paths without classifier overhead? Snell's predicted difficulty needs 2,048 samples + PRM scoring — substantial overhead; cheaper classifier or single-pass difficulty estimator needed.
- Does LLM performance reflect true planning or web-scale approximate retrieval (Kambhampati 2024 position in [[source-promptingguide-research-llm-reasoning]])?
- Can graph-based MCTS search ([[thoughtsculpt]]) or small-model-distilled rationales ([[guided-cot]]) match native reasoning at lower cost? Snell shows lookahead/MCTS underperforms at same generation budget due to rollout cost — need verifier regularization to avoid exploitation.
- Can PRM training extend beyond verifiable math to open-ended RAG/code where false positives low? Lightman's synthetic PRM_large outcome > final-answer check hints domain dependence.
- Do DAPO's Clip-Higher / Dynamic Sampling / Token-Level Loss hyperparameters transfer across model families and scales, or require per-architecture retuning ([[source-dapo]] tunes ε_high=0.28 empirically on Qwen2.5-32B only)?
- Does R1-Zero-style pure RL work without the cold-start SFT when readability/language consistency matter for production ([[source-deepseek-r1]] needed SFT to fix these)?

## Sources
- [[source-promptingguide-guides-reasoning-llms]]
- [[source-deep-dive-into-llms-like-chatgpt]]
- [[source-promptingguide-research-llm-reasoning]]
- [[source-promptingguide-research-thoughtsculpt]]
- [[source-promptingguide-research-guided-cot]]
- [[source-lets-verify-step-by-step]]
- [[source-scaling-test-time-compute]]
- [[source-deepseek-r1]]
- [[source-dapo]]
- [[source-speculative-decoding]]
- [[source-mmlu]]
- [[source-helm]]

## Synthesis

- [[post-training-lineage]] — why the verifier, not the algorithm, is the axis that matters

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
