---
type: source-summary
title: "Function Calling in AI Agents — Prompt Engineering Guide (DAIR.AI)"
summary: Practical explainer of function calling (tool calling) as the bridge between LLM reasoning and real-world action.
status: verified
visibility: public
author: "Elvis Saravia / DAIR.AI"
source-type: article
url: "https://www.promptingguide.ai/agents/function-calling"
date-published: 2025-05-10
date-ingested: 2026-08-24
tags:
  - agents
  - prompt-engineering
key-concepts:
  - "[[function-calling]]"
  - "[[tool-use]]"
  - "[[model-context-protocol]]"
  - "[[context-engineering]]"
key-entities: []
verified-by: agent
verified-on: 2026-08-27
---

# Function Calling in AI Agents — Prompt Engineering Guide (DAIR.AI)

## Summary
Practical explainer of function calling (tool calling) as the bridge between LLM reasoning and real-world action. Covers flow (context assembly → tool decision → execution → observation → response), critical role of tool definitions (name/description/parameters), the iterative agent loop (action/observation), debugging via intermediate steps in n8n, and best practices for robust tool design and error handling.

## Key Takeaways
1. **What function calling does:** Lets LLMs recognize when external data/action is needed (e.g., “weather in Paris?” → weather API) and emit structured calls with correct parameters, transforming text generators into world-interacting agents.
2. **Tool definitions are the only context:** Name, description (when to use), parameters (types/descriptions) dictate tool selection; descriptions must be specific, and tool schemas consume tokens every call.
3. **Agent loop:** Repeated cycles of Action → Environment Response → Observation → Decision, with full conversational context retained; multi-tool sequences accumulate knowledge.
4. **Debugging & best practices:** Use “Return Intermediate Steps” to inspect tools called, arguments, observations, token usage; write specific descriptions (“when to use”), duplicate guidance in system prompt, constrain parameters with enums/examples, return informative error messages for recovery.

## Detailed Notes
- **Motivating example:** Weather query illustrates need for real-time data beyond training cutoff.
- **Flow (6 steps) with diagram `function-calling-flow.png`:**
  1. User Query
  2. Context Assembly (system message + tool definitions + user message)
  3. Tool Decision (structured output indicating tool + params)
  4. Tool Execution (developer code runs function)
  5. Observation (tool result)
  6. Response Generation (observation fed back with history)
- **Tool definition example (Python JSON):** `get_current_weather` with `location` (string) and `unit` (enum celsius/fahrenheit, required location), description explicitly states “Use this when user asks about weather…”.
- **Token cost callout:** Tool definitions become part of context on every call → cost/latency impact → be concise but descriptive.
- **Agent loop elaboration:** Concrete trace for “Latest news from OpenAI”: thinks → `web_search(query="OpenAI latest news announcements")` → observation with articles → summary response. Notes multi-call accumulation.
- **Debugging section:** n8n’s intermediateSteps JSON example showing `web_search` then `update_task_status`; lists common bugs: incorrect tool selection, bad arguments, missing context, observation misinterpretation. Warns some platforms hide raw prompt context.
- **Best practices (4):**
  - Be specific (“Search the web for current information…” not “Search the web”)
  - Include usage context in system prompt (repetition helps): “Always prefer knowledge_base for company-specific questions before web_search.”
  - Define clear parameter constraints with enums and examples (temperature unit guidance)
  - Handle failures gracefully: `if not results: return "No results… Try broadening…"`
- **Closing:** Function calling is central to robust agents; links to DAIR Academy n8n course.

## Notable Quotes
> "This capability is what transforms a basic LLM from a text generator into a powerful agent that can interact with the real world."

> "Tool definitions are arguably the most critical component of function calling. They are the only way the LLM knows what tools are available and when to use them."

> "Tool definitions become part of the context on every LLM call. This means they consume tokens and affect cost and latency."

## Concepts Introduced or Referenced
- [[function-calling]] — core mechanism detailed
- [[tool-use]] — taxed/standardized equivalent; constrained decoding
- [[model-context-protocol]] — connection to MCP servers/KBs
- [[context-engineering]] — system prompt supplementation
- [[ai-agents]] — agent loop terminology

## Critical Assessment
**Strengths:** Clear separation of context assembly vs execution; copy-pasteable tool schema; actionable debugging workflow directly translatable to OpenAI/Anthropic APIs.
**Weaknesses:** n8n-centric debugging view; limited discussion of parallel tool calling or strict JSON schema enforcement (`strict:true`) covered elsewhere in wiki.
**Contradictions:** None; aligns perfectly with [[tool-use]] (“Structured Outputs & Schema Enforcement”) and [[model-context-protocol]] primitives.

## Sources
- Raw: [https://www.promptingguide.ai/agents/function-calling](https://www.promptingguide.ai/agents/function-calling)

---

**Source:** Function Calling in AI Agents — Prompt Engineering Guide (DAIR.AI) by Elvis Saravia / DAIR.AI — <https://www.promptingguide.ai/agents/function-calling>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
