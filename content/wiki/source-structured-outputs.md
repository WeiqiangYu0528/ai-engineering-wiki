---
type: source-summary
title: "Structured model outputs — OpenAI Developers"
summary: The canonical OpenAI Developers guide for Structured Outputs — the feature that guarantees model responses adhere to a supplied JSON Schema (strict:true) so no required key is omitted or enum hallucinated.
status: draft
visibility: public
author: "OpenAI"
source-type: code-doc
url: "https://developers.openai.com/api/docs/guides/structured-outputs"
date-published: 2025-08-24
date-ingested: 2026-08-24
tags:
  - agents
  - llm-fundamentals
  - inference
key-concepts:
  - "[[structured-outputs]]"
  - "[[tool-use]]"
  - "[[prompt-engineering]]"
  - "[[decoding-strategies]]"
key-entities:
  - "[[openai]]"
---

# Structured model outputs — OpenAI Developers

## Summary
The **canonical OpenAI Developers guide** for **Structured Outputs** — the feature that guarantees model responses adhere to a supplied **JSON Schema** (`strict:true`) so no required key is omitted or enum hallucinated. Available via **LLM-friendly Markdown** at `.../structured-outputs.md` (with index at `.../api/llms.txt` and single-file export `/api/llms-full.txt` — 148k tokens), the guide covers the two API surfaces (**function calling** vs **`text.format: {type:"json_schema"}`** for direct response structuring), **supported models** (starting `gpt-4o`, recommend `gpt-5.6` for new projects; JSON mode for older `gpt-4-turbo`/`gpt-3.5`), **benefits** (reliable type-safety → no validation/retry, explicit safety refusals detectable programmatically, simpler prompting without strong formatting instructions), and **four detailed examples** with 7-language SDK samples (Python `Pydantic`/`BaseModel`, JS `Zod`/`zodTextFormat`, Go, Java, Ruby, curl): **CalendarEvent** extraction, **chain-of-thought math tutoring** (`steps:[{explanation,output}]+final_answer`), **ResearchPaperExtraction** (title/authors/abstract/keywords), **UI generation** via recursive `UI` schema (`type enum div/button/header… + label + children + attributes`, $ref `"#"`), and **moderation** (`ContentCompliance` with `is_violating`, `category enum`, `explanation_if_violating`). Includes the **Structured Outputs vs JSON mode** comparison table (both valid JSON, only Structured adheres to schema) and notes SDK parsing helpers (`responses.parse`, `output_parsed`) for Pydantic/Zod.

## Key Takeaways
1. **JSON Schema Guarantee > Prompting:** Structured Outputs (`text:{format:{type:"json_schema", name:"event", strict:true, schema:{...}}}`) is the evolution of **JSON mode** (`type:"json_object"`). JSON mode ensures valid JSON; Structured ensures *schema* adherence (required keys, enums, types) with deterministic validation — eliminating retry loops and enabling type-safe code generation.
2. **Two Surfaces — Choose by Wiring:** 
   - **Function calling:** when bridging model → app functionality (DB queries, UI actions) — model *calls* your function; schema defines tool.
   - **`text.format` Structured Outputs:** when structuring the *model's answer to the user* (tutor steps, extraction) — schema defines response. Guide focuses on the latter via **Responses API** (`responses.parse` / `responses.create`); full function-calling strict mode is in its own guide.
3. **Model Support & Recommendation:** Available on latest large models starting `gpt-4o`; for new projects start with **`gpt-5.6`** (latest). Older `gpt-4o-mini 2024-07-18`/`08-06` was first with `json_schema`; `gpt-4-turbo`/earlier should use JSON mode. All APIs support Structured (Responses, Chat Completions, Assistants, Fine-tuning, Batch).
4. **SDK Helpers Eliminate Boilerplate:** Python `from pydantic import BaseModel` + `client.responses.parse(..., text_format=CalendarEvent)` → `response.output_parsed`; JS `z.object({...})` + `zodTextFormat(CalendarEvent,"event")` → `output_parsed`; Go/Java/Ruby/curl show raw `json_schema` with `strict:true`, `additionalProperties:false`, required arrays. This replaces manual strongly-worded prompts for formatting.
5. **Four Canonical Patterns with Full Code:** 
   - *CalendarEvent* (simple extraction: name/date/participants)
   - *MathReasoning* (chain-of-thought: `steps:[{explanation,output}] + final_answer` → `"x = -15 / 4"` with 5 steps)
   - *ResearchPaperExtraction* (title/authors/abstract/keywords → example quantum-algorithms abstract with 6 keywords)
   - *UI Generation* (recursive `UI` with `enum [div,button,header,section,field,form]` + `children:[$ref "#"]` + `attributes:[{name,value}]` → User Profile Form with `post` action, submit button)
   - *Moderation* (ContentCompliance: `is_violating`, `category enum [violence,sexual,self_harm] nullable`, `explanation_if_violating`)
6. **Markdown LLM Version Exists:** Top banner notes **Markdown versions by appending `.md`** and **index at `/llms.txt`** (`/api/llms.txt` for API guides, `/api/llms-full.txt` single-file) — the answer to "does this page have llm version?" is **yes**, enabling traversal of all sub-guides (see `api/llms.txt` for guides, `api/reference/llms.txt` for endpoints).

## Detailed Notes

### Header
- Banner: *For complete index, see llms.txt . Markdown versions by appending .md*.
- Intro: JSON ubiquitous; Structured Outputs via JSON Schema guarantees adherence.

### Getting a Structured Response (Section)
- 7-language samples for CalendarEvent extraction from "Alice and Bob are going to a science fair on Friday." — demonstrates `strict:true` and `additionalProperties:false`.

### Supported Models (Section)
- Starting with GPT-4o; recommend `gpt-5.6`; older use JSON mode.

### When to Use Function Calling vs text.format (Section)
- Function calling = connect model to tools/data (assistant → orders DB); `text.format` = structure answer to user (tutor UI). Quote: *If connecting to tools → function calling; if structuring output to user → structured text.format*. Remainder focuses on non-function Responses API; link to Function Calling guide for `strict` mode there.

### Structured Outputs vs JSON Mode (Section)
- Table 4 rows: Outputs valid JSON (Yes/Yes), Adheres to schema (Yes/No, see supported schemas), Compatible models, Enabling syntax. Recommends always using Structured when possible; notes `json_schema` support limited to `gpt-4o-mini`/`2024-08-06` and later for older snapshots.

### Examples (Sections with per-example code)
- **Chain of thought:** System "You are a helpful math tutor. Guide step by step" + user "how can I solve 8x + 7 = -23" → schema with `Step`/`MathReasoning` and 5-step response including `x = -15 / 4`.
- **Structured data extraction:** System "You are an expert at structured data extraction" + research paper text → schema title/authors/abstract/keywords → quantum-algorithms example response with 3 authors + 6 keywords (JSON shown).
- **UI Generation:** Recursive `UI` with enum + children + attributes → User Profile Form nested div/field/button hierarchy → JSON with `post` action.
- **Moderation:** ContentCompliance with `is_violating` boolean + nullable enum/category + explanation → job interview not violating example.

### Additional Sections (Truncated but in raw .md)
- Post-truncation includes supported schemas documentation, pricing, error handling, and links to helpers docs for Pydantic/Zod.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 5 passages in this section could not be located in the stored source ([https://developers.openai.com/api/docs/guides/structured-outputs](https://developers.openai.com/api/docs/guides/structured-outputs)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Structured Outputs is a feature that ensures the model will always generate responses that adhere to your supplied JSON Schema, so you don't need to worry about the model omitting a required key, or hallucinating an invalid enum value."

> "Some benefits of Structured Outputs include: Reliable type-safety, Explicit refusals, Simpler prompting"

> "Function calling is useful when you are building an application that bridges the models and functionality of your application. [...] Structured Outputs via response_format are more suitable when you want to indicate a structured schema for use when the model responds to the user"

> "We recommend always using Structured Outputs instead of JSON mode when possible."

> "Markdown versions of documentation pages are available by appending `.md` to the page URL."

## Concepts Introduced or Referenced
- [[structured-outputs]] — Core: JSON Schema `strict:true`, `additionalProperties:false`, `responses.parse` / `zodTextFormat` / `Pydantic`, 4 canonical patterns, model support matrix, vs JSON mode.
- [[tool-use]] — Contrast: function calling (`tools`) vs `text.format` (direct answer structuring); both use JSON Schema strict mode but serve different wiring (tool bridging vs answer formatting).
- [[prompt-engineering]] — Implication: no need for strongly worded formatting prompts when schema enforces; CoT via structured steps is more reliable than free-form.
- [[decoding-strategies]] — Implicit: Structured Outputs constrains decoding to schema-valid tokens (like grammar-guided generation).
- [[openai]] — Platform: Responses API, Chat Completions, Batch, Fine-tuning support; guides index via `api/llms.txt`.

## Critical Assessment
- **Strengths:** Most complete single-page reference for *answer-side* Structured Outputs: 7-language runnable samples, clear 4-pattern taxonomy (extraction, CoT, UI recursion, moderation), explicit vs-of JSON mode table, and model guidance (`gpt-5.6` recommendation). As the prequel to the project's Tool Calling guide, it cleanly separates the two JSON Schema surfaces. LLM-friendly by design (`.md` suffix + `llms.txt` index) — ideal for RAG ingestion vs promptingguide's GitHub-raw workaround.
- **Limitations:** Focuses on Responses API `text.format`; function-calling strict mode details deferred to separate guide (needs cross-link); no benchmark of structured vs JSON mode failure rates; pricing not detailed (deferred); supported schemas section truncated in fetch. UI recursive `$ref "#"` example is powerful but lacks discussion of depth limits or validation of `additionalProperties:false` necessity.
- **Wiki Integration:** Fills the implementation gap for [[tool-use]]'s prior mention of `strict:true` — now the *non-tool* counterpart. Should be cited from [[structured-outputs]] as primary source and from [[prompt-engineering]] as prompt-simplification lever. No contradictions; complements [[model-context-protocol]] (tool calling) by showing the alternative `text.format` path.

---

**Source:** Structured model outputs — OpenAI Developers by OpenAI — <https://developers.openai.com/api/docs/guides/structured-outputs>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
