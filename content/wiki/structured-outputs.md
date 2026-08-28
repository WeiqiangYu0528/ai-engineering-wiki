---
type: concept
title: "Structured Outputs"
summary: Structured Outputs is OpenAI's JSON Schema-constrained generation feature that guarantees model responses adhere to a supplied schema (strict:true), ensuring no required key is omitted and no enum is hallucinated.
visibility: public
aliases:
  - "Structured Model Outputs"
  - "JSON Schema Mode"
  - "Strict Mode"
tags:
  - inference
  - prompt-engineering
  - agents
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-structured-outputs]]"
  - "[[source-openai-tools-and-agent-capabilities]]"
related:
  - "[[tool-use]]"
  - "[[function-calling]]"
  - "[[decoding-strategies]]"
  - "[[inference]]"
  - "[[prompt-engineering]]"
  - "[[model-context-protocol]]"
---

# Structured Outputs

## Overview
**Structured Outputs** is OpenAI's **JSON Schema-constrained generation** feature that guarantees model responses adhere to a supplied schema (`strict:true`), ensuring no required key is omitted and no enum is hallucinated. Introduced with `gpt-4o` and recommended via `gpt-5.6` in [[source-structured-outputs]] (`platform.claude.com/docs/en/build-with-claude/prompt-caching` successor for OpenAI: `developers.openai.com/api/docs/guides/structured-outputs`, LLM-friendly via `.md` suffix and `api/llms.txt` index), it supersedes **JSON mode** (`type:"json_object"` — valid JSON only) and is available in two wiring modes: **function calling** (model calls your tool) and **`text.format` direct answers** (model answer itself is structured).

## Key Ideas

### 1. Two Wirings — Tool vs Answer
- **Function calling:** `tools:[{name:"get_order", schema:{...}}]` — model *calls* your function; schema defines tool. Use when bridging model → app functionality (DB, UI actions).
- **`text.format: {type:"json_schema", strict:true, schema:{...}}`:** model *answer to user* is constrained (math tutoring `steps+final_answer`, extraction, UI). Guide focuses on Responses API `responses.parse` (Python `Pydantic`/`text_format=Model`, JS `Zod`/`zodTextFormat`, Go/Java/Ruby/curl raw `json_schema`).

### 2. Benefits vs Prompting & JSON Mode
- **Type-safety:** No validation/retry loops — constrained decoding (grammar masking → CFG) ensures 100% schema compliance at decode time (logits masked to valid tokens, see [[inference]] / [[tool-use]]).
- **Explicit refusals:** Safety refusals are programmatically detectable vs free-form.
- **Simpler prompting:** No strongly-worded formatting instructions needed. Table: Structured vs JSON mode — both valid JSON, only Structured adheres to schema (supported models `gpt-4o`/`gpt-4o-mini 2024-08-06+` and `gpt-5.6`; older use JSON mode).

### 3. SDK Helpers
- **Python:** `from pydantic import BaseModel; class CalendarEvent(BaseModel): name:str ...` → `client.responses.parse(..., text_format=CalendarEvent)` → `response.output_parsed`
- **JS:** `z.object({name:z.string()...})` → `zodTextFormat(CalendarEvent,"event")` → `output_parsed`
- Common: `required`, `additionalProperties:false`, `enum`, recursive `$ref "#"` (UI), nullable `["string","null"]` (moderation).

### 4. Four Canonical Patterns (7-Language Samples)
- **CalendarEvent:** `name/date/participants[]` from "Alice and Bob science fair Friday"
- **Chain-of-Thought Math:** `steps:[{explanation,output}]+final_answer` for `8x+7=-23` → 5 steps → `x = -15 / 4` (CoT via structured output, more reliable than free-form CoT)
- **ResearchPaperExtraction:** `title/authors[]/abstract/keywords[]` → quantum-algorithms example
- **UI Generation:** Recursive `UI {type enum [div,button,header,section,field,form], label, children: UI[], attributes: [{name,value}]}` via `$ref "#"` → User Profile Form with `post` action
- **Moderation:** `ContentCompliance {is_violating,bool, category enum [violence,sexual,self_harm] nullable, explanation_if_violating nullable}` — job interview not violating.

### 5. LLM-Friendly Distribution
Top banner notes **Markdown via `.md` suffix** and **index at `/api/llms.txt`** (`/api/llms-full.txt` single-file) — the prompt engineering guide's GitHub-raw pattern has an official OpenAI equivalent, enabling RAG traversal of all sub-guides (structured outputs, function calling, evals, etc.).

## How It Works
```
Schema definition (Pydantic/Zod/JSON Schema, strict:true, required, additionalProperties:false)
        │
        ▼
API call: responses.parse(model:"gpt-5.6",
  input:[system:"Extract..." + user:"..."],
  text:{format:{type:"json_schema", name:"event", schema:{...}, strict:true}})
        │
        ▼
Constrained decoding: CFG derived from schema masks logits → only schema-valid tokens sampled
        │
        ▼
Response: output_text (JSON string) + output_parsed (typed object, validated)
        │
        ▼
No retry/validation needed; explicit refusals detectable; UI can render fields distinctly
```
**Comparison to Tool Calling (same schema language, different wiring):**
```
Tool calling: input → model emits tool_call JSON (function) → client executes → observation → final answer
Structured Outputs: input → model emits structured answer JSON directly (no execution) → client renders
```

## Practical Implications
- **Reliability for Production:** Use Structured `strict:true` for any integration where downstream code expects typed fields (extraction, UI, CoT steps, moderation) — eliminates 15–30% JSON parse failures seen with prompting alone.
- **Choose wiring:** Need execution? Use function calling (`tools`); need formatted answer? Use `text.format`. Do not mix — guide's table clarifies.
- **Prompt simplification:** Replace "Respond ONLY with JSON, include all keys, use exactly enum values..." with schema — system prompt can stay focused on task instruction.
- **Cost/latency:** Same as JSON mode but with grammar-masking overhead negligible; enables `gpt-5.6` recommendation over older `gpt-4o-mini` snapshots.
- **Versioning:** Pin `strict:true` and `additionalProperties:false` explicitly; older models fall back to JSON mode — check supported models table.

## Connections
- Extends [[tool-use]]'s earlier mention of `strict:true` (now the non-tool counterpart) and [[function-calling]] (tool schema vs answer schema). The four patterns ground [[prompt-engineering]] (CoT via structured steps) and [[inference]] constrained decoding (grammar masking) alongside [[decoding-strategies]] (sampling under schema constraints).
- LLM-friendly distribution via `.md` + `llms.txt` parallels `prompt-caching.md`'s workspace/isolation and the Dair Guide's GitHub-raw pattern — establishing OpenAI's actionable RAG ingestion method (see [[source-structured-outputs]] header).
- Complements [[model-context-protocol]] (tool calling standard) by showing the alternative `text.format` path.

## Open Questions
- What schema complexity (depth, recursion, enum size) maximizes constraint benefit without hurting model creativity or increasing latency?
- How does Structured Outputs interact with thinking models (tool-use reasoning) where intermediate steps may also need schema validation?

## Sources
- [[source-structured-outputs]]
- [[source-openai-tools-and-agent-capabilities]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
