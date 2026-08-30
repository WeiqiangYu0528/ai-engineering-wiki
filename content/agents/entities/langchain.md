---
type: entity
title: "LangChain"
summary: LangChain is the open-source AI engineering platform (LangChain framework, LangGraph, LangSmith) for building, observing, and evaluating LLM agents.
status: draft
visibility: public
entity-type: organization
tags:
  - agents
  - llm-fundamentals
  - open-source
created: 2026-08-24
updated: 2026-08-24
url: "https://www.langchain.com"
related:
  - "[[context-engineering]]"
  - "[[ai-agents]]"
  - "[[retrieval-augmented-generation]]"
  - "[[tool-use]]"
aliases:
  - wiki/langchain
---

<aside class="kb-header kb-type-entity" aria-label="Page information">
<p class="kb-type">Entity</p>
<p class="kb-summary">LangChain is the open-source AI engineering platform (LangChain framework, LangGraph, LangSmith) for building, observing, and evaluating LLM agents.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/agents/concepts/context-engineering">Context Engineering</a></li><li><a href="/agents/concepts/ai-agents">AI Agents</a></li><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**LangChain** is the open-source AI engineering platform (LangChain framework, **LangGraph**, **LangSmith**) for building, observing, and evaluating LLM agents. Founded by Harrison Chase, it pioneered chain abstractions and now focuses on **agent infrastructure** — LangGraph as low-level orchestration for long-running agents and LangSmith as the tracing/evaluation platform enabling the **virtuous loop** (trace → evaluate → fix). Its July 2, 2025 blog *Context Engineering for Agents* in [[source-context-engineering-for-agents-langchain]] codified the **write / select / compress / isolate** operational taxonomy for context engineering.

## Key Facts
- **LangGraph:** Low-level graph-based orchestration where agents are nodes + state object + checkpointing. Provides:
  - *Write:* short-term scratchpad via checkpointed state, long-term via files/collections + LangMem
  - *Select:* per-node state fetch + embedding/graph retrieval (Bigtool for semantic tool selection, 3× gain), RAG tutorials (AST chunking + rerank for code)
  - *Compress:* summarization/trim utilities (`trim_messages`, recursive/hierarchical, tool-output post-processing, Provence pruner)
  - *Isolate:* state-schema field isolation, sandboxes (E2B, Pyodide), supervisor/swarm multi-agent (15× token cost but parallel)
- **LangSmith:** Tracing/observability (token-usage per agent) + agent evaluation tutorials — the measurement layer for context engineering.
- **Open-Source Agent Frameworks:** `langchain` (quick start), `langgraph` (low-level control), `deepagents` (long-running complex tasks), `dcode` (coding agent).
- **Conceptual Contributions:** OS analogy (LLM=CPU, context=RAM), four failure modes from Drew Breunig — **poisoning, distraction, confusion, clash** — and the 4-bucket taxonomy complementing Anthropic's attention-budget theory (both cite Karpathy's "delicate art" quote).

## Significance in AI Engineering
- Provides the **implementation mapping** for context engineering: every Anthropic principle (smallest high-signal set, JIT, compaction) maps to a LangGraph primitive (state, memory collections, trim nodes, sandbox), making the theory actionable.
- Popularized **RAG over tool descriptions** (3× tool selection accuracy) and **code RAG with rerank** as production patterns, and surfaced pitfalls like Willison's location-memory injection ("window no longer belongs to them").
- Establishes the **evaluate→fix loop**: LangSmith tracing identifies where to apply write/select/compress/isolate, then evaluates impact — the pragmatic counterpart to Anthropic's architectural scarcity argument.

## Related Concepts
- [[context-engineering]] — Central 4-bucket taxonomy (write/select/compress/isolate) vs Anthropic's attention-budget/right-altitude/triad
- [[ai-agents]] — Multi-agent separation of concerns (Swarm), E2B sandboxed CodeAgent, ambient agents
- [[retrieval-augmented-generation]] — RAG for knowledge and for tool descriptions
- [[context-caching]] — Trim/summarization as cache management; naive always-pulled files vs selective JIT
- [[tool-use]] — Tool overload, RAG over tools, sandboxed execution

## Sources
- [[source-context-engineering-for-agents-langchain]]
- [[source-promptingguide-agents-context-engineering]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
