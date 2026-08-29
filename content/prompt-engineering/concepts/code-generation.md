---
type: concept
title: "Code Generation with LLMs"
summary: "Code Generation is prompting LLMs to synthesize executable code (Python, SQL) and supporting artifacts (schemas, test data, explanations) — illustrated by the ChatGPT gpt-3.5-turbo Playground guide using SYSTEM: You are…"
visibility: public
aliases:
  - Code Generation
  - Program Synthesis with LLMs
  - LLM Code Generation
  - wiki/code-generation
tags:
  - prompt-engineering
  - agents
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-applications-coding]]"
  - "[[source-promptingguide-applications-generating-textbooks]]"
related:
  - "[[applications-overview]]"
  - "[[synthetic-data]]"
  - "[[prompt-engineering]]"
  - "[[program-aided-language-models]]"
  - "[[tool-use]]"
  - "[[hallucination]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Code Generation is prompting LLMs to synthesize executable code (Python, SQL) and supporting artifacts (schemas, test data, explanations) — illustrated by the ChatGPT gpt-3.5-turbo Playground guide using SYSTEM: You are…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/applications-overview">LLM Applications Overview</a></li><li><a href="/llm-fundamentals/concepts/synthetic-data">Synthetic Data for Language Models</a></li><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/program-aided-language-models">Program-Aided Language Models (PAL)</a></li><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/eval-safety/concepts/hallucination">Hallucination</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-applications-coding">Generating Code — Prompt Engineering Guide (DAIR.AI) Applications</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-applications-generating-textbooks">Tackling Generated Datasets Diversity — Textbooks Are All You Need — Prompt Engineering Guide Applications</a></li></ul></nav>
</aside>

## Overview
**Code Generation** is prompting LLMs to synthesize executable code (Python, SQL) and supporting artifacts (schemas, test data, explanations) — illustrated by the ChatGPT `gpt-3.5-turbo` Playground guide using `SYSTEM: You are a helpful code assistant … Python. Don't explain, just generate the code block itself.` Recipes include basic `Hello name`, comment-driven JSON synthesis, prefix function completion (`def multiply(` → `a, b): return a*b+75`), end-to-end MySQL (`students/departments` schema description → `SELECT … INNER JOIN … WHERE DepartmentName='Computer Science'` → `CREATE TABLE` DDL → `INSERT` dummy rows), and explaining code under persona constraints, plus textbook-quality Phi-1 synthesis (1.3B model rivaling 10× larger on HumanEval via 1B textbook tokens).

## Key Ideas
- **System persona locks language/output:** Python-only system message enforces code-block discipline; `user` carries task. Leaky when switching domains (SQL explanation starts `Sorry, as a code assistant in Python…` but still answers).
- **Comment-as-spec:** Numbered block comments `""" 1. Create list of movies 2. Create ratings … 3. Combine to json of 10 … """` reliably produce working Python — though missing `import json` shows need for execution checking.
- **Completion / Copilot pattern:** Prefix prompting (`# function to multiply two numbers and add 75 … def multiply(`) → function body completion — same mechanism as GitHub Copilot.
- **End-to-end SQL workflow from prompts:** Describe schema → generate query → generate DDL → generate inserts (4 rows per table) → validate on `sqliteonline.com` (John Doe/Jane Doe for CS) → generate explanation. Each step feeds next as context.
- **Textbook synthesis for pretraining ([[source-promptingguide-applications-generating-textbooks]]):** `Write an extract from a CS textbook for a 1st-year bachelor … topic: Singular matrices … overview → example → 1-2 code snippets ≤10 rows` → `is_singular` NumPy function. Uses `topic` + `target audience` seeding for diversity; 1B tokens via GPT-3.5 → Phi-1 1.3B beats larger models on HumanEval.
- **Always test:** Generated code is mostly correct but systematically drops imports or foreign keys if not explicitly constrained.

## How It Works
```
SYSTEM: You are a helpful code assistant … Python …
   │
   ▼
USER: "Write code that asks the user for their name and say Hello"  →  Assistant: input() + f-string
USER: """ 1. Create list of movies … """                          →  Assistant: movies/ratings → json.dumps (→ check missing import)
USER: "# function to multiply …\ndef multiply("                   →  Assistant: completes a,b): result = a*b+75; return
USER: "Table departments, columns = … Create a MySQL query …"      →  Assistant: SELECT … INNER JOIN …
USER: "Create a valid database schema …"                           →  Assistant: CREATE TABLE … FOREIGN KEY
USER: "Given schema above, generate valid insert statements …"     →  Assistant: INSERT … (4 rows)
   │
   ▼
[Execute in Python/SQLite → fix imports/keys → iterate]
```
API equivalent: `openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=[system, user])` with temperature tuning.

## Practical Implications
- **Separate generation from verification:** Treat every code output as draft; execution in interpreter/DB is mandatory before trust — parallels [[program-aided-language-models]] grounding.
- **Manage persona scope:** For polyglot generation, avoid over-narrow system personas or spawn separate sessions with language-specific systems.
- **Use natural-to-code bridging:** Schema description in prompt replaces ORM boilerplate; combine with [[tool-use]] Code Interpreter for auto-fix loops.
- **CoT for code:** Phi-1 shows reasoning-rich textbook extracts (concept → natural-language solution → code) improve HumanEval more than raw code alone.

## Connections
- Applied track in [[applications-overview]]; feeds [[synthetic-data]] pretraining (Phi-1).
- Realized as minimal agent: LLM coder + Python/SQL runtime tool in [[tool-use]] / [[program-aided-language-models]].
- Contrasts [[prompt-engineering]] generic rules (front-load imperative verbs, anchor format) with code-specific system conditioning.
- Mitigates [[hallucination]] for computable tasks via execution.

## Open Questions
- What test-harness prompt (e.g., "also output imports and self-test asserts") minimizes post-generation fixes without over-constraining?
- How does code diversity seeding (audience/topic) transfer to non-Python languages and domain-specific libraries?

## Sources
- [[source-promptingguide-applications-coding]]
- [[source-promptingguide-applications-generating-textbooks]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
