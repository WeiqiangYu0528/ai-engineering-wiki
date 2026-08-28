---
type: source-summary
title: "Context Engineering Deep Dive: Building a Deep Research Agent — Prompt Engineering Guide"
summary: Deep implementation walkthrough of context engineering for a deep-research agent, contrasting a failing monolithic design (single agent handling task management, memory, search, reporting) with an improved orchestrator…
status: verified
visibility: public
author: "Elvis Saravia / DAIR.AI"
source-type: article
url: "https://www.promptingguide.ai/agents/context-engineering-deep-dive"
date-published: 2025-06-01
date-ingested: 2026-08-24
tags:
  - agents
  - prompt-engineering
  - rag
key-concepts:
  - "[[context-engineering]]"
  - "[[ai-agents]]"
  - "[[tool-use]]"
  - "[[deep-agents]]"
key-entities: []
verified-by: agent
verified-on: 2026-08-27
---

# Context Engineering Deep Dive: Building a Deep Research Agent — Prompt Engineering Guide

## Summary
Deep implementation walkthrough of context engineering for a deep-research agent, contrasting a failing monolithic design (single agent handling task management, memory, search, reporting) with an improved orchestrator + search-worker multi-agent architecture. Dissects a production system prompt (role, general instructions, date injection, tool descriptions, ordering flexibility), iteration process, missing metadata, sub-agent communication, context-length management, and error handling.

## Key Takeaways
1. **Monolithic anti-pattern:** Single agent with web search, sheet updates, and report generation causes context bloat, forgotten searches, missed status updates, unreliable behavior.
2. **Multi-agent fix:** Separate Deep Research Agent (planning/orchestration, Gemini 2.5 Pro / GPT-5) and Search Worker Agent (execution, Gemini 2.5 Flash / GPT-5-mini) gives separation of concerns, reliability, and cost-effective model selection.
3. **System prompt anatomy:** High-level role definition → GENERAL INSTRUCTIONS (3 searches + sheet updates + report) → date injection (`{{ $now.format('yyyy-MM-dd') }}`) → TOOL DESCRIPTIONS (delete/append_update/search worker) with explicit status values (`todo` → `done`) and ordering guidance (“be efficient” vs strict “MUST execute each”).
4. **Iteration is the work:** Hours spent tuning prompts, tool definitions, I/O specs, architecture; future improvements span search metadata (type, time period, domain, priority), date-range inference, and decomposition guidelines.

## Detailed Notes
- **Reality of context engineering:** Callout that it requires “significant iteration and careful design decisions… hours iterating.”
- **Original design problem:** Diagram `simple-dr-agent.png`; single agent overloaded → long context → forgotten operations.
- **Improved architecture benefits:** 3 enumerated: separation of concerns, improved reliability (focused responsibilities), model flexibility (different LLMs per agent). Notes provider alternatives (Gemini vs OpenAI families).
- **Full system prompt provided (markdown code block):**
  - Role: “You are a deep research agent who will help with planning and executing search tasks…”
  - General instructions: convert query → 3 search tasks → sheet + report
  - Date: `For context, today's date is: {{ $now.format('yyyy-MM-dd') }}`
  - Tools: `delete_task`, `append_update_task` (with status lifecycle), `Search Worker Agent` (query word-for-word)
  - Closing: “Use the tools in the order that makes the most sense to you but be efficient.”
- **Breakdown:**
  - High-level definition rationale
  - General instructions explicitness
  - Essential context: current date critical for “latest news” queries; n8n dynamic injection; without it agents search outdated info
- **Tool definitions:**
  - Dual locations: system prompt prose + technical tool spec; “biggest performance improvements often come from clearly explaining tool usage in the system prompt”
  - Status inconsistency example: without explicit allowed values agent uses “pending”/“to-do”/“completed”/“done” interchangeably → fix by enumerating `todo`/`done`.
  - Flexibility discussion: “be efficient” lets agent skip/combine searches; production strict variant provided: “You MUST execute… Do NOT skip any tasks.”
  - Guidance on when to use flexible (development) vs rigid (production).
- **Iteration process:** 6 steps: initial → test diverse queries → identify issues → add instructions → retest → repeat. Lists “What's still missing”: metadata augmentation, enhanced planning guidelines, date range spec (start_date/end_date inference).
- **Advanced considerations:**
  - Sub-agent communication: keep inputs minimal (just query text), return search results + error states + metadata.
  - Context length management: history accumulates → strategies: separate agents, memory tools, summarize outputs, clear lists between queries.
  - Error handling snippet: retry once, mark `failed` with reason, notify user, never silently proceed.
- **Conclusion:** Context engineering requires iteration time, architectural decisions, explicit instructions, continuous refinement, balance flexibility/control.

## Notable Quotes
> "The biggest performance improvements often come from clearly explaining tool usage in the system prompt, not just defining tool parameters."

> "Separating agent responsibilities improves reliability and enables cost-effective model selection for different subtasks."

> "Don't underestimate the effort required for context engineering. It's not a one-time task but an iterative process."

## Concepts Introduced or Referenced
- [[context-engineering]] — system prompt engineering, tool instruction, date injection
- [[ai-agents]] — deep research agent as case study
- [[tool-use]] / [[function-calling]] — tool definition dual-location principle
- [[deep-agents]] — orchestrator/worker pattern
- [[reasoning-llms]] — Gemini 2.5 Pro vs Flash selection

## Critical Assessment
**Strengths:** Most detailed prompt-engineering artifact in the collection; provides copy-pasteable system prompt; clearly explains date injection, status enum, and multi-agent trade-offs.
**Weaknesses:** n8n-specific syntax (`{{ $now... }}`); lacks formal eval results; metadata enhancements not fully implemented.
**Contradictions:** None; complements [[source-promptingguide-agents-context-engineering]] (higher-level) and [[source-promptingguide-guides-context-engineering-guide]] (broader definition).

## Sources
- Raw: [https://www.promptingguide.ai/agents/context-engineering-deep-dive](https://www.promptingguide.ai/agents/context-engineering-deep-dive)

---

**Source:** Context Engineering Deep Dive: Building a Deep Research Agent — Prompt Engineering Guide by Elvis Saravia / DAIR.AI — <https://www.promptingguide.ai/agents/context-engineering-deep-dive>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
