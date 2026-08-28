---
type: concept
title: "Deep Agents"
summary: Deep Agents are a post-shallow-agents paradigm for long, multi-step problems (deep research, agentic coding, agentic RAG) that replaces a single ad-hoc context window with strategic planning, organized delegation…
visibility: public
aliases:
  - "Deep Research Agents"
  - "Orchestrator-Subagent Systems"
tags:
  - agents
  - prompt-engineering
  - rag
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-agents-deep-agents]]"
  - "[[source-promptingguide-agents-context-engineering-deep-dive]]"
  - "[[source-promptingguide-agents-context-engineering]]"
  - "[[source-promptingguide-guides-reasoning-llms]]"
related:
  - "[[ai-agents]]"
  - "[[agent-components]]"
  - "[[context-engineering]]"
  - "[[ai-workflows]]"
  - "[[tool-use]]"
  - "[[model-context-protocol]]"
  - "[[reasoning-llms]]"
  - "[[claude-code]]"
---

# Deep Agents

## Overview
**Deep Agents** are a post-shallow-agents paradigm for long, multi-step problems (deep research, agentic coding, agentic RAG) that replaces a single ad-hoc context window with *strategic planning, organized delegation, persistent memory, rigorous [[context-engineering]], and verification*. Popularized by DAIR.AI Academy, LangChain Labs, [[claude-code]] Agent SDK, and Philipp Schmid’s Agents 2.0.

## Key Ideas
### 1. Strategic Planning
Instead of in-the-moment reasoning, maintain a structured, updatable task plan — a “living to-do list” guiding long-term goals with retry/recovery. Demonstrated gains when planning is enabled before execution in Claude Code/Codex; critical for scientific discovery horizons; benefits from human-in-the-loop brainstorming.

### 2. Orchestrator & Sub-agent Architecture
- One big long-context agent is insufficient. Orchestrator delegates to specialized clean-context sub-agents: search, coder, KB retriever, analyst, verifier, writer — each with domain focus; orchestrator integrates outputs.
- Counters Cognition’s “Don’t Build Multi-Agents” argument; DAIR and [[claude-code]] show efficient context separation and cost-aware model selection (e.g., Gemini 2.5 Pro/GPT-5 planner orchestrates Gemini Flash/mini workers).

### 3. Context Retrieval & Agentic Search
- Beyond conversation history: external memory in files, notes, vectors, DBs — high-quality structured memory prevents context overload.
- Hybrid techniques: agentic search + semantic search, agent-chooses-strategy; recent works ReasoningBank (2509.25140) and Agentic Context Engineering (2510.04618) optimize memory building/retrieval.

### 4. Context Engineering
- Worst failure = underspecified instructions. Need explicit, detailed, intentional guidance on when to plan, when to delegate, file naming, human collaboration, structured outputs, prompt optimization, context compacting, and [[function-calling]]/tool definition refinement (see Anthropic writing-tools-for-agents).

### 5. Verification
- Verification of outputs via automated [[reasoning-llms]]-as-Judge or human is essential for reliability/production readiness, mitigating [[hallucination]], sycophancy, and [[prompt-injection]]. Systematic eval pipelines build good verifiers — undersold vs context engineering.

## How It Works
```
[ Orchestrator (planning LLM — e.g., Gemini 2.5 Pro) ]
    ├── maintains Task Plan (updatable, recoverable)
    ├── delegates → [ Search Sub-agent (Flash) ] → web/news/academic
    ├── delegates → [ KB Retriever ] → vector/file memory (agentic search)
    ├── delegates → [ Coder/Analyst ] → execution
    ├── delegates → [ Writer ] → draft
    └── delegates → [ Verifier (LLM-as-Judge / human) ] → feedback loop
All share persistent storage (files/notes/vectors) + layered context
```
- Deep research customer-support example (DAIR Academy): student course Q&A agentic RAG with planner → retrievers → analyst → writer → verifier.

## Practical Implications
- **Shift in building:** From tuning single prompts to architecting multi-agent collaboration with explicit context contracts and file conventions.
- **Cost/latency:** Orchestrator/worker separation enables model tiering and parallel sub-agent execution.
- **Foundation for proactive agents:** Deep agents framed as stepping stone to personalized proactive agents acting on user’s behalf.

## Connections
- Evolves [[ai-agents]] + [[agent-components]] (adds planning artifact, specialization, persistent memory).
- Reuses [[ai-workflows]] patterns inside orchestrator; formalizes via [[context-engineering]] and [[function-calling]].
- Relies on [[reasoning-llms]] for planning/eval and [[claude-code]] as reference implementation of sub-agents.
- Verification addresses [[hallucination]] and [[prompt-injection]] / [[adversarial-prompting]].

## Open Questions
- When do sub-agent coordination overheads outweigh single-context gains? How to define delegation boundaries formally?
- Can auto-memory (ReasoningBank-style) reliably distinguish useful vs stale context without human curation?

## Sources
- [[source-promptingguide-agents-deep-agents]]
- [[source-promptingguide-agents-context-engineering-deep-dive]]
- [[source-promptingguide-agents-context-engineering]]
- [[source-promptingguide-guides-reasoning-llms]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
