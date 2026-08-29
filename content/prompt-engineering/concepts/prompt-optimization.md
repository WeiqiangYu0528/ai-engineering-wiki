---
type: concept
title: "Prompt Optimization"
summary: Prompt Optimization is the practice of systematically improving prompt quality to maximize LLM performance via clarity, structure, decomposition, and advanced techniques (few-shot, chain-of-thought, ReAct).
visibility: public
aliases:
  - Optimizing Prompts
  - Crafting Effective Prompts
  - wiki/prompt-optimization
tags:
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-guides-optimizing-prompts]]"
  - "[[source-promptingguide-guides-context-engineering-guide]]"
  - "[[source-promptingguide-agents-context-engineering]]"
related:
  - "[[prompt-engineering]]"
  - "[[context-engineering]]"
  - "[[prompt-elements]]"
  - "[[prompt-design-tips]]"
  - "[[in-context-learning]]"
  - "[[tool-use]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Prompt Optimization is the practice of systematically improving prompt quality to maximize LLM performance via clarity, structure, decomposition, and advanced techniques (few-shot, chain-of-thought, ReAct).</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/agents/concepts/context-engineering">Context Engineering</a></li><li><a href="/prompt-engineering/concepts/prompt-elements">Prompt Elements</a></li><li><a href="/prompt-engineering/concepts/prompt-design-tips">Prompt Design Tips</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-guides-optimizing-prompts">Crafting Effective Prompts for LLMs — Prompt Engineering Guide (DAIR.AI) Guides</a></li><li><a href="/agents/sources/source-promptingguide-guides-context-engineering-guide">Context Engineering Guide — Prompt Engineering Guide (DAIR.AI)</a></li><li><a href="/agents/sources/source-promptingguide-agents-context-engineering">Why Context Engineering? — Prompt Engineering Guide (DAIR.AI)</a></li></ul></nav>
</aside>

## Overview
**Prompt Optimization** is the practice of systematically improving prompt quality to maximize LLM performance via clarity, structure, decomposition, and advanced techniques (few-shot, chain-of-thought, ReAct). It is the tactical core of [[prompt-engineering]] and foundational layer of [[context-engineering]].

## Key Ideas
- **Four foundational levers:**
  1. *Specificity & Clarity:* Unambiguous desired outcome like human instructions.
  2. *Structured Inputs/Outputs:* JSON/XML for inputs and explicit output format (list/paragraph/code) to improve relevance.
  3. *Delimiters:* Special characters segregating elements for clarity.
  4. *Task Decomposition:* Break monolithic multi-task prompts into simpler subtasks for focused, accurate composition.
- **Three advanced techniques:**
  - *Few-shot:* Exemplars demonstrating pattern (see [[in-context-learning]]).
  - *Chain-of-Thought:* “Think step-by-step” for logical deduction; note that with native [[reasoning-llms]] this can *hurt* — prefer explicit constraints there.
  - *ReAct (Reason+Act):* Entwines reasoning, planning, and [[tool-use]] for sophisticated apps.
- **Evolution:** Foundational optimization now subsumed by [[context-engineering]] (system prompts, RAG, tool definitions, memory, eval).

## How It Works
```
Monolithic vague prompt
  │
  ▼ split via decomposition + delimiters + structured schema
Per-subtask prompts with exemplars (few-shot) / stepwise reasoning (CoT) / tool loop (ReAct)
  │
  ▼
Higher accuracy, more relevant, grounded outputs
```

## Practical Implications
- **Start simple, then advance:** Apply specificity/structure first before adding CoT/ReAct; measure via evals.
- **Format matters:** Claude 4 and similar models mirror prompt structure — Markdown prompts lean to Markdown outputs; XML often preferred for generated content.
- **Trade-offs:** Decomposition adds latency/cost but improves quality; choose per task.

## Connections
- Subset of [[prompt-engineering]] (with [[prompt-elements]], [[prompt-design-tips]], [[role-prompting]], [[llm-settings]]).
- Feeds [[context-engineering]] layered architecture and [[deep-agents]] sub-agent instructions.
- Enables [[ai-workflows]] (prompt chaining) and [[tool-use]] via ReAct.

## Open Questions
- How to auto-optimize prompts at scale (e.g., DSPy, APE) while preserving interpretability?
- When does few-shot exemplar count hit diminishing returns vs context bloat?

## Sources
- [[source-promptingguide-guides-optimizing-prompts]]
- [[source-promptingguide-guides-context-engineering-guide]]
- [[source-promptingguide-agents-context-engineering]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
