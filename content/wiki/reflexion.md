---
type: concept
title: "Reflexion"
summary: Reflexion (Shinn et al., 2023) is a verbal reinforcement framework that enables LLM agents to learn from trial and error without weight updates.
visibility: public
aliases:
  - "Reflexion Framework"
  - "Verbal Reinforcement Learning"
  - "Self-Reflection Agents"
tags:
  - prompt-engineering
  - agents
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-techniques-reflexion]]"
related:
  - "[[react]]"
  - "[[tool-use]]"
  - "[[thinking-models]]"
  - "[[model-context-protocol]]"
---

# Reflexion

## Overview
**Reflexion** (Shinn et al., 2023) is a *verbal reinforcement* framework that enables LLM agents to learn from trial and error without weight updates. It wraps an Actor (typically [[react]] or chain-of-thought) with an Evaluator that scores trajectories and a Self-Reflection model that converts scalar/free-form feedback into linguistic cues stored in long-term memory. As detailed in [[source-promptingguide-techniques-reflexion]], the loop — task → trajectory → evaluate → reflect → next trajectory — significantly improves AlfWorld (130/134 tasks), HotPotQA, and HumanEval/MBPP coding by letting agents explicitly remember and avoid past mistakes.

## Key Ideas
- **Policy = memory + LLM:** Following Shinn et al., a policy is parameterized by persistent memory contents plus LLM parameters; learning = appending better reflections to memory.
- **Three roles:** Actor (generates thoughts/actions + short-term trajectory), Evaluator (reward/score via heuristics or LLM-as-judge), Self-Reflection (LLM that produces verbal critique from reward+trajectory+memory).
- **Verbal > scalar:** Natural-language feedback is more nuanced and actionable than a single reward number.
- **No fine-tuning:** All improvement comes from in-context memory growth, compatible with frozen APIs and lightweight compared to traditional RL.

## How It Works
```
Task ──► Actor (CoT/ReAct + memory) ──► Trajectory (short-term memory)
                │                              │
                │                              ▼
                │                        Evaluator ──► Reward (heuristic / LLM score)
                │                              │
                │                              ▼
                └──── Self-Reflection ◄────────┘  (reward+trajectory+memory → verbal cue)
                              │
                              ▼
                        Long-term memory append
                              │
                              ▼
                        Next episode Actor (memory-augmented)
```

- **Memory tiers:** Short-term = current episode trajectory; Long-term = persisted reflections (sliding window in paper; extensible to vector DB).
- **Actor instantiation:** Decision tasks use ReAct traces; reasoning uses CoT; both benefit.
- **Examples (guide figure):** Failed drawer search → reflection “I should have checked the cabinet first” fixes next AlfWorld episode; QA miss → “I need to retrieve both documents before answering” corrects HotPotQA; coding test failure → reflection patches edge case.

## Practical Implications
- **When to use:** Tasks where agents must iterate (multi-step navigation, multi-doc QA, program repair) and where traditional RL is too expensive or data-hungry — choose Reflexion for interpretable, sample-efficient improvement.
- **Evaluator design is critical:** For AlfWorld binary success heuristics; for QA coding, unit-test pass rates or LLM judges — quality of reward shapes reflection quality.
- **Memory engineering:** Sliding window caps context; for long-horizon tasks move to embeddings/SQL via [[model-context-protocol]] resources or vector stores.
- **Cost:** Each episode = Actor + Evaluator + Reflection calls; batch reflections or limit episodes to control budget.
- **Limitations:** Depends on model’s self-evaluation/reflection competence (improves with stronger LLMs); test-suite quality gates code gains; non-deterministic tasks hard to reward.

## Connections
- Extends [[react]]: Reflexion = ReAct loop + reflection + persistent memory (guide frames it as ReAct extension).
- Complements [[program-aided-language-models]]: PAL can be the Actor for coding tasks, Reflexion the repair loop.
- Shares [[thinking-models]] motivation (better reasoning) but at the *agent-episode* level rather than within a single trace.
- Realizable with [[tool-use]] / [[model-context-protocol]] harnesses where memory is a tool/resource.

## Open Questions
- How far can verbal reinforcement scale before context limits demand external memory (vector retrieval vs summary)?
- Can reflections be distilled into fine-tuning data to internalize improvements beyond in-context memory?
- How to make evaluators more reliable for open-ended tasks without ground-truth oracles?

## Sources
- [[source-promptingguide-techniques-reflexion]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
