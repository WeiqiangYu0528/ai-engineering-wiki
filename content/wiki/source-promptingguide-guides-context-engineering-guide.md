---
type: source-summary
title: "Context Engineering Guide — Prompt Engineering Guide (DAIR.AI)"
summary: Authoritative, essay-length definition of context engineering as the evolved, broader successor to prompt engineering — architecting full context window (instructions, dynamic elements, tools, RAG/memory, structured…
status: draft
visibility: public
author: "Elvis Saravia / DAIR.AI"
source-type: article
url: "https://www.promptingguide.ai/guides/context-engineering-guide"
date-published: 2025-06-15
date-ingested: 2026-08-24
tags:
  - agents
  - rag
  - prompt-engineering
key-concepts:
  - "[[context-engineering]]"
  - "[[ai-agents]]"
  - "[[prompt-engineering]]"
  - "[[tool-use]]"
key-entities: []
---

# Context Engineering Guide — Prompt Engineering Guide (DAIR.AI)

## Summary
Authoritative, essay-length definition of context engineering as the evolved, broader successor to prompt engineering — architecting full context window (instructions, dynamic elements, tools, RAG/memory, structured I/O, state/history). Walks through a concrete multi-agent deep-research n8n workflow (Search Planner → Search → Synthesis) dissecting system prompt, instructions, user input delimiters, structured inputs/outputs with JSON schema via output parser, tool/date injection, vector-store RAG caching, and historical state handling. Closes with advanced topics (compression, safety, eval) and resource links.

## Key Takeaways
1. **Rebrand with substance:** Prompt engineering not dead but superseded by context engineering — designing/optimizing all instructions and relevant context for LLMs/multimodal models to perform effectively, filtering noise and measuring effectiveness via eval pipelines.
2. **Comprehensive context scope:** Prompt chains, system prompt tuning, dynamic user/date inputs, knowledge search/prep (RAG), query augmentation, tool definitions, few-shot demos, delimiters/JSON schema, short-term (state/history) and long-term (vector store) memory.
3. **Concrete Search Planner system prompt:** Role (“expert research planner” + `<user_query>` delimiters + `{{ $now.toISO() }}`) + 6-field subtask spec (id/query/source_type/time_period/domain_focus/priority) + type hints + JSON example → auto schema + date-range inference (start_date/end_date ISO) → validated live output. Demonstrates why surface instructions fail without detailed schema.
4. **Three illustrative engineering wins:** Delimiters for clarity, date injection for temporal accuracy, RAG caching of prior subtasks for latency/cost savings, and state/history passing for iterative revision — all require explicit trade-off decisions and measurement.

## Detailed Notes
- **Framing:** Opens with myth “prompt engineering will be dead,” notes rebrand via Ankur Goyal, Walden Yan, Tobi Lutke, Karpathy; builds on Dex Horthy diagram overlapping prompt/RAG/tools/memory/state.
- **Broad definition quote:** “process of designing and optimizing instructions and relevant context … for LLMs and advanced AI models… encompasses text and multimodal.”
- **Bulleted scope (10 items):** Lists chains, instructions, dynamic elements, RAG, augmentation, tools, few-shot, structuring, short/long memory, etc.
- **Architecture:** n8n multi-agent workflow image `context-engineering-workflow.jpg`; focuses on Search Planner sub-agent.
- **System Prompt (full code block):** 6 required fields per subtask, `Create 2 subtasks`, type spec (`id: str … priority: int 1-5`), plus post-hoc `start_date`/`end_date` inference from `time_period` with ISO example. Notes n8n output parser auto-generates JSON schema from example.
- **Section breakdown:**
  - *Instructions:* High-level task line vs full context needed — “Many beginners would stop here.”
  - *User Input:* `<user_query> What's the latest dev news from OpenAI? </user_query>` with delimiter rationale.
  - *Structured I/O:* Detailed field list + hints/examples (priority 1-5 not 1-10); type block; JSON example with two subtasks (news vs web) + actual parsed output showing what model returned (including 1.2 priority drift as real artifact).
  - *Tools:* `{{ $now.toISO() }}` dynamic injection; date matters for “last week” queries; discusses retrieval tool for cached subtasks.
  - *RAG & Memory:* Vector store caching of subqueries to avoid regeneration — “every LLM call increases latency/cost; creative context engineering is the moat.”
  - *States & Historical Context:* For revision loops, need subtask state, revisions, past agent outputs — content passed depends on optimization target.
- **Advanced (WIP):** Compression, management, safety, evaluating context effectiveness over time; notes context dilution requires evaluation workflows.
- **Resources:** 6 links (Lance Martin, Karpathy, Phil Schmid, etc.) + HumanLayer 12-factor agents.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 4 passages in this section could not be located in the stored source ([https://www.promptingguide.ai/guides/context-engineering-guide](https://www.promptingguide.ai/guides/context-engineering-guide)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "A few years ago, many… claimed that prompt engineering would be dead by now. Obviously, they were very wrong, and in fact, prompt engineering is now even more important than ever."

> "Given the fast evolution of the AI field, I suggest a broader definition of context engineering: *the process of designing and optimizing instructions and relevant context for the LLMs…*"

> "Creative and novel context engineering is the moat!"

> "What you are trying to achieve … is optimizing the information you are providing in the context window … filtering out noisy information, which is a science on its own."

## Concepts Introduced or Referenced
- [[context-engineering]] — definitive guide (this page)
- [[prompt-engineering]] — evolution/rebrand narrative
- [[ai-agents]] / [[deep-agents]] — multi-agent research application
- [[tool-use]] — date tool, output parser
- [[retrieval-augmented-generation|RAG]] — vector-store caching of subtasks

## Critical Assessment
**Strengths:** Longest, most concrete resource in batch (289 lines); provides complete reusable system prompt and real parser output; honest about iteration count and eval necessity.
**Weaknesses:** n8n-specific JSON parser abstraction hides schema mechanics; advanced section explicitly WIP.
**Contradictions:** None; superset of [[source-promptingguide-agents-context-engineering]] and [[source-promptingguide-agents-context-engineering-deep-dive]]; aligns with [[prompt-engineering]] → context engineering shift narrative.

## Sources
- Raw: [https://www.promptingguide.ai/guides/context-engineering-guide](https://www.promptingguide.ai/guides/context-engineering-guide)

---

**Source:** Context Engineering Guide — Prompt Engineering Guide (DAIR.AI) by Elvis Saravia / DAIR.AI — <https://www.promptingguide.ai/guides/context-engineering-guide>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
