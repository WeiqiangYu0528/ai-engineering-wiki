---
type: source-summary
title: "Function Calling with LLMs — Prompt Engineering Guide (DAIR.AI) Applications"
summary: Application-focused primer on function calling as reliable LLM→tool/API bridging.
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/function_calling.en.mdx"
date-published: 2023-08-15
date-ingested: 2026-08-24
tags:
  - agents
  - prompt-engineering
key-concepts:
  - "[[function-calling]]"
  - "[[tool-use]]"
  - "[[applications-overview]]"
  - "[[context-engineering]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
---

# Function Calling with LLMs — Prompt Engineering Guide (DAIR.AI) Applications

## Summary
Application-focused primer on **function calling as reliable LLM→tool/API bridging**. Covers OpenAI fine-tuned JSON function calling (GPT-4/3.5 detect when to call, return `{name, arguments}`), multi-function per request, and four creation paths (conversational agents with external tools, data extraction/tagging, natural-language→API/DB query, conversational knowledge retrieval). Provides a full OpenAI Python walkthrough (define `tools=[{type:function,function:{name:get_current_weather,description,parameters:{location,unit: celsius|fahrenheit}}}]`, `get_completion()` wrapper, user `What is the weather like in London?` → `tool_calls=[{function:{name:get_current_weather, arguments:{"location":"London","unit":"celsius"}}}])`, then external API call + final synthesis), YouTube overview, notebook link (`pe-function-calling.ipynb`), open-source note ("coming soon"), and 8 references.

## Key Takeaways
1. **What it solves:** Knowledge-cutoff queries (`weather in London`) need live tools; function calling lets the model emit structured args for developer execution instead of hallucinating.
2. **Contract = JSON schema:** Array of `tools` with `type:function`, `name`, `description`, `parameters:{type:object,properties:{…},required:[…], enum:…}` — not execution, just arg extraction; supports multiple tools per turn.
3. **Minimal OpenAI loop:** `openai.chat.completions.create(model,messages,tools)` → `response.choices[0].message.tool_calls` → call real weather API → feed observation back for final answer.
4. **Use-case taxonomy (5):** Conversational agents (external APIs/KBs), natural language understanding (structured JSON/NER/sentiment/keywords), math (multi-step via custom functions), API integration (NL→API for QA/creative assistant), information extraction (news/references from articles).
5. **Open-source gap at publication:** Section promised "more notes on open-source LLMs coming soon."

## Detailed Notes
- **Header:** YouTube `p0I-hwZSWMs`; intro: "ability to reliably connect LLMs to external tools…"
- **Use-case bullets verbatim:** conversational agents (`get_current_weather(location:string, unit: 'celsius'|'fahrenheit')`), extracting people names from Wikipedia, NL→API/DB query, knowledge retrieval engines.
- **Code blocks:**
  ```python
  tools = [{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather…","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and state…"},"unit":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location"]}}}]
  def get_completion(messages, model="gpt-3.5-turbo-1106", … tools=None): return openai.chat.completions.create(…).choices[0].message
  messages=[{"role":"user","content":"What is the weather like in London?"}]
  response=get_completion(messages, tools=tools)  # → tool_calls with {"location":"London","unit":"celsius"}
  ```
- **Notebook card:** `pe-function-calling.ipynb`
- **References (8):** Fireworks function-calling release, LangChain benchmarking, Google function_calling docs, LangChain APIs, OpenAI docs/cookbook, minimaxir structured data, svpino math notebook.

## Notable Quotes
> "Function calling is the ability to reliably connect LLMs to external tools to enable effective tool usage and interaction with external APIs."
> "The functions that are being called by function calling will act as tools in your AI application and you can define more than one in a single request."
> "When you pass this function definition as part of the request, it doesn't actually executes a function, it just returns a JSON object containing the arguments needed to call the function."

## Concepts Introduced or Referenced
- [[function-calling]] — Canonical app pattern; JSON schema + tool-calls observation loop.
- [[tool-use]] — Achieved via hosted tools + client function calling; precursor to [[model-context-protocol]] and structured outputs (`strict:true`).
- [[applications-overview]] — Applied agent/tool use case.
- [[context-engineering]] — Tool definitions injected into context; observation appended for synthesis.

## Critical Assessment
- **Strengths:** Runnable, minimal code trace from schema → API call → arg extraction; clearly separates model-side JSON generation from developer-side execution; taxonomy maps directly to product archetypes.
- **Weaknesses:** No parallel function calling, `tool_choice`, or error-handling discussion; open-source section empty; YouTube-heavy narrative; no strict schema (`strict:true`) or MCP context.
- **Contradictions:** None; aligns with [[source-promptingguide-agents-function-calling]] (deeper agent loop + debugging) and [[tool-use]] taxonomy — this page is the app-centric counterpart.
- **Gaps:** Needs link to [[tool-use]] constrained decoding and [[model-context-protocol]] for standardized connectors.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/function_calling.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/function_calling.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/function_calling.en.mdx)
- Notebook: https://github.com/dair-ai/Prompt-Engineering-Guide/blob/main/notebooks/pe-function-calling.ipynb
- References cited above

---

**Source:** Function Calling with LLMs — Prompt Engineering Guide (DAIR.AI) Applications by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/function_calling.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
