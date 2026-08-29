---
type: concept
title: "Prompt Function"
summary: "Prompt Function treats a GPT chat like a shell where a natural-language \"function\" is declared via a meta prompt (functionname: [Name] input: [Input] rule: [Instructions] → If you understand, answer ok.) and later…"
visibility: public
aliases:
  - Prompt Functions
  - Encapsulation Prompt
  - Reusable Prompt Function
  - wiki/prompt-function
tags:
  - prompt-engineering
  - agents
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-applications-pf]]"
related:
  - "[[applications-overview]]"
  - "[[prompt-chaining]]"
  - "[[function-calling]]"
  - "[[tool-use]]"
  - "[[prompt-engineering]]"
  - "[[program-aided-language-models]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Prompt Function treats a GPT chat like a shell where a natural-language "function" is declared via a meta prompt (functionname: [Name] input: [Input] rule: [Instructions] → If you understand, answer ok.) and later…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/applications-overview">LLM Applications Overview</a></li><li><a href="/prompt-engineering/concepts/prompt-chaining">Prompt Chaining</a></li><li><a href="/agents/concepts/function-calling">Function Calling</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/program-aided-language-models">Program-Aided Language Models (PAL)</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-applications-pf">Prompt Function — Prompt Engineering Guide (DAIR.AI) Applications</a></li></ul></nav>
</aside>

## Overview
**Prompt Function** treats a GPT chat like a shell where a natural-language "function" is declared via a **meta prompt** (`function_name: [Name] input: [Input] rule: [Instructions]` → `If you understand, answer ok.`) and later invoked as `function_name(input)` — the model acts as an interpreter producing rule-governed output. Demonstrated with `trans_word` (detect→translate→correct to English), `expand_word` (literary elaboration), `fix_english` (elegant improvement), chained as `fix_english(expand_word(trans_word("婆罗摩火山…")))`, and `pg(length, capitalized, lowercase, numbers, special)` password generator (`pg(10,1,5,2,1)` → `D5%t9Bgf`-like). Composing such functions yields no-code workflows stored in a note-app library or via ChatGPT-Next-Web / PromptAppGPT low-code hosts.

## Key Ideas
- **Meta prompt as declaration:**
  ```
  Hello, ChatGPT! … I will use a template: function_name: [Name] input: [Input] rule: [Instructions]
  Please provide the output for this function. The format is function_name(input) If you understand, just answer ok.
  ```
  After `ok`, any `name(args)` string triggers the stored rule.
- **Arity & composition:** Single-param functions chain (`f(g(h(x)))`); multi-param functions take ordered params (`pg(8,1,5,2,1)`) or named (`pg(length=10,…)`). Tip `DO NOT SAY THINGS ELSE OK, UNLESS YOU DONT UNDERSTAND` curbs verbosity.
- **Workflow = ordered functions:** Identify steps → encapsulate each → call sequentially or nested — "more structured and streamlined interaction."
- **Target user:** Non-programmers iterating a couple times before freezing into a library, vs [[function-calling]] / LangChain / marvin for developers. Complementary hosts: ChatGPT-Next-Web few-shot injection, PromptAppGPT prompt-template web apps.
- **Related projects survey:** GitHub Copilot, Microsoft AI, chatgpt-plugins, LangChain, marvin listed as parallel "program GPT" efforts but code-centric.

## How It Works
```
Meta prompt → LLM stores template → replies "ok"
     │
     ▼
User: function_name: [trans_word] input: ["text"] rule: [act as translator … detect, translate, correct …]
User: function_name: [expand_word] input: ["text"] rule: [make more literary, keep meaning …]
User: function_name: [fix_english]  input: ["text"] rule: [improve vocab with more natural and elegant …]
     │
     ▼
Invocation: trans_word('婆罗摩火山处于享有…印度尼西亚…') → Chinese→English translation+correction
            fix_english('Finally, you can run…')          → improved sentence
            fix_english(expand_word(trans_word('…')))     → nested pipeline
            pg(10,1,5,2,1)                                → password
```

## Practical Implications
- **Zero-code automation:** Non-devs can build reusable chains without JSON schemas or APIs — store definitions in notes for copy-paste reuse.
- **Fragility vs real tools:** Dispatch is purely natural-language pattern matching (no `strict:true`); wrong function selection or arg hallucination possible — for production prefer [[function-calling]] structured JSON + [[tool-use]] execution.
- **Iteration discipline:** Author advises 2–3 iterations before library-izing to stabilize `rule` prose.

## Connections
- Applied precursor to [[tool-use]] / [[function-calling]] (informal → formal tool dispatch) and to [[prompt-chaining]] (each function = chain link).
- Contrasts [[automatic-prompt-engineer]] (search-optimized prompts) — PF is hand-authored named abstraction.
- Hosted via [[applications-overview]] low-code track; tooling via [[ai-agents]] ecosystem (LangChain, marvin, ChatGPT-Next-Web).

## Open Questions
- Can prompt functions be compiler-targeted to real [[function-calling]] schemas via LLM transpilation, preserving usability while gaining validation?

## Sources
- [[source-promptingguide-applications-pf]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
