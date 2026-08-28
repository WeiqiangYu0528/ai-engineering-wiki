---
type: concept
title: "Function Calling"
summary: Function Calling (or Tool Calling) is the core LLM capability enabling AI Agents to interact with external tools, APIs, and knowledge bases by emitting structured invocations (JSON with name + arguments) that developer…
visibility: public
aliases:
  - "Tool Calling"
  - "Tool Use"
  - "Function Calling in Agents"
tags:
  - agents
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-agents-function-calling]]"
  - "[[source-promptingguide-agents-context-engineering-deep-dive]]"
  - "[[source-promptingguide-agents-context-engineering]]"
  - "[[source-openai-tools-and-agent-capabilities]]"
related:
  - "[[tool-use]]"
  - "[[model-context-protocol]]"
  - "[[context-engineering]]"
  - "[[ai-agents]]"
  - "[[agent-components]]"
  - "[[reasoning-llms]]"
---

# Function Calling

## Overview
**Function Calling** (or **Tool Calling**) is the core LLM capability enabling [[ai-agents]] to interact with external tools, APIs, and knowledge bases by emitting structured invocations (JSON with name + arguments) that developer code executes, returning observations for grounded synthesis. It is the bridge between reasoning and real-world action.

## Key Ideas
- **Motivation:** For queries needing live data (“weather in Paris?”), LLMs lack training-cutoff coverage → recognize need, call weather API with `location: "Paris"`, then synthesize answer.
- **Tool definitions are the sole contract:** Each tool needs name, description (what/when to use), and parameters (types, descriptions, enums, required). The description drives selection — with many tools, specificity is critical. Definitions are injected into context on every call → token cost/latency.
- **Agent loop:** Action → Environment Response → Observation → Decision, retaining full history. Each observation adds knowledge for next step; multi-call sequences accumulate before final answer.
- **Debugging via intermediate steps:** In n8n, `Return Intermediate Steps` reveals tools called, exact args, observations, token usage — essential for diagnosing wrong tool, bad args, missing context, or observation mishandling. Warns some platforms hide raw context.
- **Design emphasis:** Biggest gains often come from prose tool usage guidance in system prompt (not just JSON params) — e.g., “Always prefer knowledge_base for company-specific questions before web_search” and explicit status enums (`todo`/`done`).

## How It Works
```
User: "Latest news from OpenAI"
  │
  ▼
[ Context Assembly: system message + tool definitions + user message ]
  │
  ▼
[ LLM Tool Decision: emits structured {tool: web_search, args: {query:"OpenAI latest news announcements"}} ]
  │
  ▼
[ Developer Execution: calls API / MCP server / sandbox ]
  │
  ▼
Observation: "[Search results...]"
  │
  ▼
[ LLM + History + Observation → decides next action or final response ]
```
- For multi-step tasks, loop repeats; each cycle’s context includes all prior actions/observations.

## Practical Implications
- **Best practices (4):**
  1. Be specific: “Search web for current info. Use when user asks about recent events…” not “Search the web.”
  2. Duplicate guidance in system prompt — repetition helps with multiple tools.
  3. Constrain params with enums + examples (`unit: celsius/fahrenheit`, hint “celsius for most countries…”).
  4. Return informative errors: `"No results… Try broadening search terms"` to let agent recover vs failing silently.
- **Cost/accuracy:** Keep tool descriptions concise but descriptive; include error-handling instructions (“retry once with rephrased query…”).
- **Interaction with reasoning:** Reasoning models (DeepSeek-R1, Qwen) may have weak parallel tool calling unless explicitly trained; o3 improved but still variable — affects agentic designs.

## Connections
- Canonical mechanism behind [[tool-use]] (structured outputs `strict:true`, constrained decoding, programmatic calling) and [[model-context-protocol]] (tool/resource/prompt primitives).
- Defines [[agent-components]] tool pillar; architected via [[context-engineering]] (system + tool layers).
- Used by [[deep-agents]] orchestrator/worker delegation and [[reasoning-llms]]-powered planners.

## Open Questions
- How to scale to 100+ tools without context bloat — progressive discovery vs programmatic code-mode?
- Can schema enforcement guarantee valid args while preserving selection accuracy?

## Sources
- [[source-promptingguide-agents-function-calling]]
- [[source-promptingguide-agents-context-engineering-deep-dive]]
- [[source-promptingguide-agents-context-engineering]]
- [[source-openai-tools-and-agent-capabilities]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
