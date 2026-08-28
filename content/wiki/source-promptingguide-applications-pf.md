---
type: source-summary
title: "Prompt Function — Prompt Engineering Guide (DAIR.AI) Applications"
summary: Concept of the Prompt Function — treating a GPT chat session like a programmable shell where an encapsulated prompt becomes a named, reusable function functionname(input) → output.
status: draft
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/pf.en.mdx"
date-published: 2023-05-15
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - agents
key-concepts:
  - "[[prompt-function]]"
  - "[[applications-overview]]"
  - "[[prompt-chaining]]"
key-entities:
  - "[[openai]]"
---

# Prompt Function — Prompt Engineering Guide (DAIR.AI) Applications

## Summary
Concept of the **Prompt Function** — treating a GPT chat session like a programmable shell where an encapsulated prompt becomes a **named, reusable function** `function_name(input) → output`. Defines a `meta prompt` that teaches ChatGPT a `function_name / input / rule` template, then demonstrates: `trans_word` (translate→English+correct), `expand_word` (literary elaboration) `, fix_english` (improve vocabulary/style), plus chaining (`fix_english(expand_word(trans_word(...)))`) and a multi-param `pg(length,capitalized,lowercase,numbers,special)` password generator (`pg(10,1,5,2,1)`). Frames workflows as compositions of prompt functions, with notes on note-taking/library, ChatGPT-Next-Web / PromptAppGPT low-code hosts, and relation to programmatic GPT efforts (Copilot, LangChain, marvin).

## Key Takeaways
1. **Meta prompt as function declaration:**
   ```
   Hello, ChatGPT! I will use a template: function_name: [Name] input: [Input] rule: [Instructions]
   Please provide output for this function. … The format is function_name(input) If you understand, just answer ok.
   ```
   After `ok`, any `name(args)` invocation triggers rule-governed behavior.
2. **Single-param chain for language study:** `trans_word("婆罗摩火山…")` → `expand_word` → `fix_english` composable individually or nested; tip `DO NOT SAY THINGS ELSE…` reduces verbosity.
3. **Multi-param functions:** Formalizes arity (5 params for `pg`) and shows both named and positional call syntax.
4. **Workflow = function composition:** Ordered prompt functions automate multi-step processes without code.
5. **Tooling path for non-coders:** Note app as library, ChatGPT-Next-Web few-shot injection, PromptAppGPT low-code web apps — accessible alternative to Python-based orchestration.

## Detailed Notes
- **Structure:** Introduction (shell analogy) → Meta prompt block (tested on 3.5, better on 4) → Examples → English study assistant (3 function defs) → Multiple params function (pg spec + 2 call examples) → Thought (survey of GitHub Copilot, Microsoft AI, plugins, LangChain, marvin, ChatGPT-Next-Web, chatbox, PromptAppGPT, ChatGPT-Desktop).
- **Example trace:**
  - `trans_word('婆罗摩火山处于享有"千岛之国"美称的印度尼西亚…')`
  - `fix_english('Finally, you can run…')`
  - Nested: `fix_english(expand_word(trans_word('…')))`
- **pg rule:** `act as password generator … generate complex password … Do not include explanations … e.g., "D5%t9Bgf"`; demo `pg(length=10,capitalized=1,lowercase=5,numbers=2,special=1)`.
- **Design nuance:** Recommends iterating prompts a couple times before freezing into library.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 3 passages in this section could not be located in the stored source ([https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/pf.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/pf.en.mdx)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "When we draw a parallel between GPT's dialogue interface and a programming language's shell, the encapsulation prompt can be thought of as forming a function."
> "By encapsulating prompts into functions, you can create a series of functions to establish a workflow. Each function represents a specific step or task, and when combined in a particular order, they can automate complex processes."
> "If you don't want ChatGPT to output excessive information, you can simply add … DO NOT SAY THINGS ELSE OK, UNLESS YOU DONT UNDERSTAND THE FUNCTION"

## Concepts Introduced or Referenced
- [[prompt-function]] — Core: named reusable prompt with typed `rule`, composable via `f(g(x))`.
- [[applications-overview]] — Applied prompting pattern for non-developers.
- [[prompt-chaining]] — Implicitly a chain where each function output feeds next; explicit composition shown.
- [[prompt-engineering]] — Structured instruction encapsulation and iteration.
- [[ai-agents]] — Lightweight "function" precursor to tool-using agents (LangChain/marvin parallel).

## Critical Assessment
- **Strengths:** Elegant no-code abstraction for non-programmers; concrete multilingual and combinatorial examples; honest about iterating templates; surveys related projects without hype.
- **Weaknesses:** Relies on brittle natural-language "function dispatch" (no schema enforcement, hallucinated args) vs [[function-calling]] structured JSON; composition depth limited by context; translation example quality unverified.
- **Contradictions:** Informal dispatch contrasts with [[function-calling]] / [[tool-use]] strict schemas — flag as complementary low-code vs robust API paths; aligns with [[prompt-chaining]].
- **Gaps:** Needs eval of failure modes (wrong function selection) and comparison to [[automatic-prompt-engineer]].

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/pf.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/pf.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/pf.en.mdx)

---

**Source:** Prompt Function — Prompt Engineering Guide (DAIR.AI) Applications by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/pf.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
