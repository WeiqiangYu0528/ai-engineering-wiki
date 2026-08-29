---
type: source-summary
title: "OpenAI Tools & Agent Capabilities Guide Suite"
summary: The complete 13-part documentation suite from OpenAI covering tools, function calling, and agent capabilities in the Responses API and OpenAI Agents SDK.
status: draft
visibility: public
author: "OpenAI Developer Platform Team"
source-type: code-doc
url: "https://developers.openai.com/api/docs/guides/tools"
date-published: 2026-08-22
date-ingested: 2026-08-23
tags:
  - agents
  - prompt-engineering
  - mlops
key-concepts:
  - "[[tool-use]]"
  - "[[model-context-protocol]]"
  - "[[prompt-engineering]]"
  - "[[hallucination]]"
key-entities:
  - "[[openai]]"
aliases:
  - wiki/source-openai-tools-and-agent-capabilities
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The complete 13-part documentation suite from OpenAI covering tools, function calling, and agent capabilities in the Responses API and OpenAI Agents SDK.</p>
<p class="kb-provenance">OpenAI Developer Platform Team, 2026-08-22. <a href="https://developers.openai.com/api/docs/guides/tools">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary
The complete 13-part documentation suite from [[openai]] covering tools, function calling, and agent capabilities in the Responses API and OpenAI Agents SDK. It details the complete taxonomy of AI tooling: hosted built-in tools (Code Interpreter, File Search, Web Search, Computer Use, Shell, Image Generation), custom client-side function calling with **Structured Outputs** (`strict: true`), remote **[[model-context-protocol]] (MCP)** connectors, **Agent Skills**, **Tool Search** (progressive discovery), and **Programmatic Tool Calling** (Code Mode).

## Key Takeaways
1. **The 4-Category Tool Taxonomy:**
   - **Hosted Built-in Tools:** Executed entirely inside OpenAI's secure cloud sandboxes (e.g. `web_search_preview`, `file_search`, `code_interpreter`, `computer_use_preview`, `image_generation`).
   - **Custom Function Calling:** Client-defined tools where the model outputs JSON arguments and the developer's client executes the logic locally.
   - **MCP Connectors:** Standardized external tools and resources connected via remote [[model-context-protocol]] servers.
   - **Agent Skills:** Reusable capability packages that can be dynamically attached to hosted agents.
2. **Structured Outputs (`strict: true`):**
   - Guarantees 100% schema compliance for function arguments via constrained decoding (Context-Free Grammar / CFG masking at inference time).
   - Eliminates missing fields, hallucinated keys, or malformed JSON payloads.
3. **Tool Search & Progressive Tool Discovery:**
   - Instead of injecting dozens of massive tool schemas into every request context (which bloats token costs and degrades attention), **Tool Search** namespaces tools into catalogs, dynamically retrieving only the relevant function definitions when needed.
4. **Programmatic Tool Calling (Code Mode):**
   - Allows agents to write and execute Python scripts that orchestrate multiple tool calls in a single execution step within a secure sandbox, collapsing multi-turn network roundtrips into single-turn executions.
5. **Computer Use & Local Shell:**
   - Enables agents to interact with graphical desktop interfaces (taking screenshots, moving mouse, clicking, typing) and execute bash commands in containerized or local shells with strict security approvals.

## Detailed Notes

### Comparison of Tool Paradigms
| Paradigm | Execution Location | Context Management | Schema Enforcement |
|---|---|---|---|
| **Hosted Tools** (Code Interpreter, Web Search) | OpenAI Sandbox | Managed by API | Internal |
| **Function Calling** | Developer Client | Full schema in prompt | `strict: true` (CFG decoding) |
| **Tool Search** | Dynamic Retrieval | Indexed catalog; loaded on-demand | Dynamic JSON Schema |
| **MCP Connectors** | Remote MCP Servers | Standard JSON-RPC | JSON Schema / MCP standard |
| **Programmatic Tool Calling** | Python Sandbox | Code API Surface | Typed Python signatures |

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 2 passages in this section could not be located in the stored source ([https://developers.openai.com/api/docs/guides/tools](https://developers.openai.com/api/docs/guides/tools)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Structured Outputs with strict mode guarantees that model-generated function arguments will exactly match the JSON schema you provide, removing the need for manual parsing retries." — OpenAI Developer Docs

> "Programmatic tool calling turns multi-step agent loops into executable Python programs, drastically reducing latency and token costs." — OpenAI Developer Docs

## Concepts Introduced or Referenced
- [[tool-use]] — Comprehensive taxonomy of hosted tools, function calling, and structured outputs.
- [[model-context-protocol]] — Remote tool integration standard supported natively by OpenAI.
- [[prompt-engineering]] — Context management via Tool Search and system instructions.
- [[hallucination]] — Grounding model responses with deterministic computation and live web search.

## Critical Assessment
- **State of the Art in Developer Experience:** Combines strict mathematical schema guarantees (`strict: true` CFG masks) with flexible agent abstractions (Agent Skills, Programmatic Tool Calling).
- **Security & Sandboxing:** Clear separation between untrusted orchestration and isolated sandbox execution prevents host machine compromise.

---

**Source:** OpenAI Tools & Agent Capabilities Guide Suite by OpenAI Developer Platform Team — <https://developers.openai.com/api/docs/guides/tools>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
