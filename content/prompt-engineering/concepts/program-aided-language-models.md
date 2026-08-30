---
type: concept
title: "Program-Aided Language Models (PAL)"
summary: Program-Aided Language Models (PAL) (Gao et al., 2022) prompts an LLM to generate programs — not free-form text — as intermediate reasoning steps, then offloads execution to a programmatic runtime (e.g., Python…
visibility: public
aliases:
  - PAL
  - Program-Aided Reasoning
  - Code-Aided Prompting
  - wiki/program-aided-language-models
tags:
  - prompt-engineering
  - agents
  - inference
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-techniques-pal]]"
related:
  - "[[tool-use]]"
  - "[[prompt-engineering]]"
  - "[[thinking-models]]"
  - "[[react]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Program-Aided Language Models (PAL) (Gao et al., 2022) prompts an LLM to generate programs — not free-form text — as intermediate reasoning steps, then offloads execution to a programmatic runtime (e.g., Python…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/llm-fundamentals/concepts/thinking-models">Thinking Models</a></li><li><a href="/prompt-engineering/concepts/react">ReAct (Reasoning + Acting)</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-pal">Prompt Engineering Guide — PAL: Program-Aided Language Models</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Program-Aided Language Models (PAL)** (Gao et al., 2022) prompts an LLM to generate *programs* — not free-form text — as intermediate reasoning steps, then offloads execution to a programmatic runtime (e.g., Python interpreter). The LLM handles decomposition and code synthesis; the interpreter handles deterministic computation. This eliminates arithmetic and symbolic errors that plague textual chain-of-thought while preserving its decomposability via code comments.

## Key Ideas
- **Code as chain-of-thought:** Reasoning expressed as commented Python (or other language) where comments are the thought and code is the action.
- **Execution grounds answer:** Interpreter, not LLM, computes final value — faithful by construction for computable tasks.
- **Minimal agent pattern:** LLM = planner/coder, runtime = tool — the simplest [[tool-use]] agent (code interpreter).
- **Exemplar-driven:** Few-shot prompts consist of `Q:` in comments + Python statements; model continues pattern.

## How It Works
Illustrated by the date-understanding example in [[source-promptingguide-techniques-pal]]:

**Few-shot prompt (abridged, 6 exemplars):**
```python
# Q: 2015 is coming in 36 hours. What is the date one week from today in MM/DD/YYYY?
# If 2015 is coming in 36 hours, then today is 36 hours before.
today = datetime(2015, 1, 1) - relativedelta(hours=36)
one_week_from_today = today + relativedelta(weeks=1)
one_week_from_today.strftime('%m/%d/%Y')
# Q: Today is 27 February 2023. I was born exactly 25 years ago. What is the date I was born in MM/DD/YYYY?
```

**Generation + execution:**
```python
# Model completes:
today = datetime(2023, 2, 27)
born = today - relativedelta(years=25)
born.strftime('%m/%d/%Y')
# Then:
exec(llm_output)  # → 02/27/1998
```

Pipeline: `Question + code exemplars → LLM code → sandboxed exec → answer`.

## Practical Implications
- **Use when precise computation matters:** GSM8K, math, date/time, table lookup, combinatorial counting — any task where `calc(x)` is more reliable than `generate(x)`.
- **Modern stack:** Replace `text-davinci-003` + `langchain.llms.OpenAI` with `gpt-4o` + `langchain-openai` + hosted Code Interpreter / [[model-context-protocol]] filesystem server; avoid raw `exec()` — sandbox, timeout, and dependency isolation required.
- **Error modes:** Syntax errors, missing imports, hallucinated APIs, or logic bugs in generated code; add retry with error feedback.
- **Not universal:** Poor fit for open-ended, commonsense, or subjective tasks where no clean program exists — use textual CoT or [[react]] instead.

## Connections
- Instantiates [[tool-use]] taxonomy’s Code Interpreter tool; generalizable to SQL, calculators, or domain DSLs.
- Extends [[thinking-models]] / chain-of-thought: same decomposition, different grounding (execution vs text).
- Precursor to [[react]] (which also interleaves code/action) and [[reflexion]] (which can reflect on failed executions).
- Exploits [[in-context-learning]]: Python exemplars teach the comment-then-code pattern in-context.
- Relies on [[prompt-engineering]] for exemplar curation and comment style.

## Open Questions
- When should a model choose PAL vs textual CoT automatically, and can a controller prompt learn that routing?
- How to verify generated programs against specifications (unit test generation) before returning an answer?
- What are the limits of natural-language-to-code translation for ambiguous or underspecified problems?

## Sources
- [[source-promptingguide-techniques-pal]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
