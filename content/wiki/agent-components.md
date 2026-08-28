---
type: concept
title: "Agent Components"
summary: "Agent Components are the three fundamental subsystems that make AI Agents functional: planning (the brain), tool utilization, and memory systems."
visibility: public
aliases:
  - "Agent Architecture"
  - "Planning-Tools-Memory"
tags:
  - agents
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-agents-components]]"
  - "[[source-promptingguide-agents-introduction]]"
  - "[[source-promptingguide-agents-ai-workflows-vs-ai-agents]]"
  - "[[source-promptingguide-agents-context-engineering-deep-dive]]"
  - "[[source-promptingguide-agents-function-calling]]"
related:
  - "[[ai-agents]]"
  - "[[ai-workflows]]"
  - "[[deep-agents]]"
  - "[[tool-use]]"
  - "[[function-calling]]"
  - "[[context-engineering]]"
  - "[[thinking-models]]"
---

# Agent Components

## Overview
**Agent Components** are the three fundamental subsystems that make [[ai-agents]] functional: **planning** (the brain), **tool utilization**, and **memory systems**. Understanding each pillar and their synergy is prerequisite to building reliable agents, debugging failures, and evolving toward [[deep-agents]].

## Key Ideas
### 1. Planning — The Brain
Powered by LLMs, planning covers:
- Task decomposition via chain-of-thought
- Self-reflection on past actions and information
- Adaptive learning to improve future decisions
- Critical analysis of current progress
> Without robust planning, an agent cannot automate complex tasks — its primary purpose.

Strengths/limits: Current LLM planning “isn't perfect” but essential; improves markedly with [[reasoning-llms]] / [[thinking-models]] and explicit task plans (see [[deep-agents]]).

### 2. Tool Utilization
- Agents must understand *when and how* to use tools, not just have access.
- Exemplars: code interpreters/environments, web search/scraping, calculators, image generation; later extended to DBs, sheets, KBs via [[function-calling]] / [[model-context-protocol]].
- Selection & timing is a core LLM capability; tool definitions (name/description/params) are the sole guidance (see [[function-calling]]).

### 3. Memory Systems
- **Short-term (working) memory:** In-context buffer enabling [[in-context-learning]] and iteration continuity; sufficient for most tasks.
- **Long-term memory:** External vector stores / files / DBs enabling fast retrieval of historical information; less commonly implemented but “potentially crucial” — deepened in [[deep-agents]] as persistent storage and hybrid agentic+semantic search.
- Memory stores tool observations for iterative improvement.

## How It Works
```
[ Planning LLM ] ──prompts──▶ decomposes task into steps
       │
       ├── selects Tool (when/how) ──▶ [ Tool Execution ] ──▶ Observation
       │
       └── reads/writes [ Memory ] ◀── stores Observations for next iteration
```
- Loop: plan → act via tool → observe → reflect → update plan/memory.
- Failure modes (from deep dive): missing status updates, forgotten searches when one agent overloads — motivates multi-agent separation.

## Practical Implications
- **Evaluate per component:** Test planning on decomposition accuracy, tool selection precision, memory recall.
- **Tool definitions matter most:** Biggest gains come from clear system-prompt tool usage prose, not just JSON params (see [[context-engineering]] deep dive).
- **Memory choice is architectural:** Use working memory for single-session tasks; add external vector/file memory for long-horizon, cross-session, or cost-saving (cached subqueries) needs.

## Connections
- Instantiates [[ai-agents]] definition; contrasted against [[ai-workflows]] where orchestration replaces autonomous planning.
- Enriched by [[deep-agents]] (structured plans, orchestrator/sub-agents, persistent retrieval, verification) and [[context-engineering]] (prompt + tool description tuning).
- Executed via [[tool-use]] / [[function-calling]] primitives.
- Planning increasingly delegated to [[reasoning-llms]].

## Open Questions
- What memory topology (vector vs file vs DB vs hybrid agentic search) best balances recall, latency, and context bloat?
- How to formally model adaptive learning without fine-tuning?

## Sources
- [[source-promptingguide-agents-components]]
- [[source-promptingguide-agents-introduction]]
- [[source-promptingguide-agents-ai-workflows-vs-ai-agents]]
- [[source-promptingguide-agents-context-engineering-deep-dive]]
- [[source-promptingguide-agents-function-calling]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
