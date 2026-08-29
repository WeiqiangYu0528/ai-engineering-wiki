---
type: source-summary
title: "Prompt Engineering Guide — Reflexion"
summary: "This chapter distills Shinn et al. (2023) Reflexion: Language Agents with Verbal Reinforcement Learning."
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.) — based on Shinn et al. (2023)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/reflexion.en.mdx"
date-published: 2023-03-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - agents
key-concepts:
  - "[[reflexion]]"
  - "[[react]]"
  - "[[tool-use]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-reflexion
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This chapter distills Shinn et al. (2023) Reflexion: Language Agents with Verbal Reinforcement Learning.</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.) — based on Shinn et al. (2023), 2023-03-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/reflexion.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
This chapter distills Shinn et al. (2023) *Reflexion: Language Agents with Verbal Reinforcement Learning*. Reflexion frames an LLM agent’s policy as memory + LLM parameters and adds linguistic feedback: an Actor (CoT/ReAct + memory) generates trajectories, an Evaluator scores them (LLM or heuristic reward), and a Self-Reflection LLM converts scalar/free-form feedback into verbal reinforcement cues stored in long-term memory for the next episode. The loop — define task → trajectory → evaluate → reflect → next trajectory — yields significant gains on AlfWorld (130/134 tasks with ReAct+Reflexion), HotPotQA reasoning, and HumanEval/MBPP/LeetCode Hard coding, without weight updates.

## Key Takeaways
1. **Verbal RL, not weight RL:** Reinforcement is *linguistic* — self-reflections as context — rather than gradient updates; lightweight and API-compatible.
2. **Three-model architecture:** Actor (CoT/ReAct + memory), Evaluator (reward/score), Self-Reflection (verbal cue generator that consumes reward + trajectory + persistent memory).
3. **Memory duality:** Short-term = current trajectory; long-term = persisted reflections (sliding window) reused to avoid repeating mistakes.
4. **Results hold across paradigms:** Leverages same Actor backbones (CoT for reasoning, ReAct for acting) but consistently beats them alone.
5. **When to use:** Trial-and-error tasks needing nuanced feedback and interpretability where traditional RL is too data/compute-heavy.

## Detailed Notes

### Framework (Figure reflexion.png)
- **Actor:** Generates text/actions from observations; trajectory = sequence of thoughts/actions/observations. Memory augments prompt. Instantiated as CoT (reasoning) or ReAct (acting).
- **Evaluator:** Scores trajectory; binary or graded; implemented as LLM-as-judge or rule/heuristic (e.g., AlfWorld success, unit-test pass rate).
- **Self-Reflection:** LLM that takes `(reward, trajectory, memory)` → verbal critique/suggestion (“I should have searched for X before answering”) stored in long-term memory.
- **Loop:** `Task → Actor trajectory (episode t) → Evaluator reward → Self-Reflection → Memory append → Actor trajectory (episode t+1)` until success or budget.

### Examples (Figure reflexion-examples.png)
- Shows how one failed AlfWorld episode’s reflection (“I forgot to check drawer”) corrects next episode; similar for QA (missed document) and coding (failed edge case → reflection → fix).

### Results
- **AlfWorld sequential decision-making:** ReAct+Reflexion solves 130/134 tasks (vs ReAct alone ~ lower); figure reflexion-alfworld.png shows steep sample-efficiency gain over baselines.
- **HotPotQA reasoning:** Reflexion+CoT > CoT and > CoT+episodic memory; adding episodic memory alone helps but reflection helps more (figure hotpotqa).
- **Programming (MBPP/HumanEval/LeetCode Hard, Rust+Python):** Reflexion generally best, achieving SOTA on some splits; table reflexion-programming.png summarizes (LLM evaluator + test-driven heuristics).
- **Interpretability:** Reflections are human-readable audit trail vs opaque scalar rewards.

### When to Use / Limitations (Guide’s own synthesis)
- **Best for:** Agent must learn from trial/error; traditional RL impractical (data/fine-tuning cost); nuanced feedback needed; explicit memory/interpretability valued.
- **Tasks:** AlfWorld navigation, HotPotQA multi-doc QA, HumanEval/MBPP code generation.
- **Limitations:**
  - Relies on model’s own evaluation/reflection capability — may be poor on hard tasks (mitigated as base models improve).
  - Long-term memory as sliding window — limited context; vector DB/SQL needed for complex tasks.
  - Code generation gated by test-suite quality — non-deterministic or hardware-dependent outputs hard to verify.

## Notable Quotes
> "Reflexion is a new paradigm for ‘verbal‘ reinforcement that parameterizes a policy as an agent’s memory encoding paired with a choice of LLM parameters."

> "Converts feedback (either free-form language or scalar) from the environment into linguistic feedback, also referred to as self-reflection, which is provided as context for an LLM agent in the next episode."

## Concepts Introduced or Referenced
- [[reflexion]] — Core framework: verbal reinforcement via Actor/Evaluator/Reflection loop.
- [[react]] — Direct extension: Reflexion’s Actor is often ReAct; adds reflection/memory on top of Thought-Act-Obs.
- [[tool-use]] — Achieves tool-augmented learning without fine-tuning.
- [[prompt-engineering]] — Reflection prompt design and memory curation as engineering task.
- [[thinking-models]] — Shares self-evolution lineage but at agent-loop level.

## Critical Assessment
- **Strengths:** Well-structured synthesis of a multi-model system; clearly delineates roles and memory tiers; honest limitation section; connects quantitative figures to conceptual loop; positions Reflexion as lightweight RL alternative.
- **Weaknesses:** Guide leans on paper figures without reproducing numbers in text; no pseudo-code for reflection prompt; no cost/latency analysis (multiple episodes × LLM calls expensive); evaluator design (LLM judge prompt) underexplained; sliding-window memory detail is cursory.
- **Contradictions:** None, but emphasizes that Reflexion does not require weight updates — contrasting with [[rlhf]]/[[supervised-fine-tuning]] while sharing RL vocabulary.
- **Extensions:** Implement persistent memory via embeddings (vector store) or [[model-context-protocol]] resources; pair with [[program-aided-language-models]] for code task evaluator.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/reflexion.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/reflexion.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/reflexion.en.mdx)
- Primary paper: Shinn et al. (2023) — https://arxiv.org/pdf/2303.11366.pdf
- Commentary: Ev Jang (2023) — https://evjang.com/2023/03/26/self-reflection.html

---

**Source:** Prompt Engineering Guide — Reflexion by DAIR.AI (Elvis Saravia et al.) — based on Shinn et al. (2023) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/reflexion.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
