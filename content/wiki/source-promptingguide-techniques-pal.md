---
type: source-summary
title: "Prompt Engineering Guide — PAL: Program-Aided Language Models"
summary: "This chapter presents Gao et al. (2022) PAL: Program-Aided Language Models, which replaces free-form chain-of-thought text with executable programs as the intermediate reasoning step."
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.) — based on Gao et al. (2022)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/pal.en.mdx"
date-published: 2022-11-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - agents
  - inference
key-concepts:
  - "[[program-aided-language-models]]"
  - "[[tool-use]]"
  - "[[prompt-engineering]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
---

# Prompt Engineering Guide — PAL: Program-Aided Language Models

## Summary
This chapter presents Gao et al. (2022) *PAL: Program-Aided Language Models*, which replaces free-form chain-of-thought text with executable programs as the intermediate reasoning step. The LLM reads a natural-language problem and generates Python code (often with comments mirroring CoT); a Python interpreter then deterministically executes it to yield the answer. The guide walks through a runnable LangChain + `text-davinci-003` example for date understanding, showing few-shot prompts where each exemplar is a commented Python snippet using `datetime`/`relativedelta`, and demonstrates `exec()` of the model’s output to compute `02/27/1998`.

## Key Takeaways
1. **Programs > prose for precise reasoning:** Offloading arithmetic, date math, and symbolic manipulation to an interpreter eliminates calculation hallucinations that plague textual CoT.
2. **Prompt as code exemplars:** Few-shot prompts consist of `Q:` in comments plus Python statements; model continues the pattern for the new question.
3. **Interpreter as tool:** PAL is a minimal [[tool-use]] pattern — LLM = code generator, Python runtime = executor — precursor to modern code-interpreter agents.
4. **Domain gains:** Strong on GSM8K, math, and Big-Bench date-understanding where deterministic operations matter.
5. **Runnable demo:** Guide provides copy-pasteable LangChain setup (`OpenAI(model_name='text-davinci-003')`, `DATE_UNDERSTANDING_PROMPT` with 6 date exemplars, `exec(llm_out)`).

## Detailed Notes

### PAL vs Chain-of-Thought
- **CoT:** `Question → intermediate text reasoning → answer` (reasoning and computation both in LLM).
- **PAL:** `Question → program (reasoning as comments + code) → interpreter execution → answer`. Comments preserve decomposability; code ensures correctness.
- Figure PAL.png illustrates side-by-side: CoT emits sentences, PAL emits `today = datetime(...)` blocks.

### Date-Understanding Walkthrough
- **Imports:** `openai`, `datetime`, `dateutil.relativedelta`, `langchain.llms.OpenAI`, `dotenv`.
- **Setup:** `llm = OpenAI(model_name='text-davinci-003', temperature=0)` — deterministic generation.
- **Prompt (`DATE_UNDERSTANDING_PROMPT`):** 6 few-shot exemplars, each:
  ```python
  # Q: 2015 is coming in 36 hours. What is the date one week from today in MM/DD/YYYY?
  # If 2015 is coming in 36 hours, then today is 36 hours before.
  today = datetime(2015, 1, 1) - relativedelta(hours=36)
  one_week_from_today = today + relativedelta(weeks=1)
  one_week_from_today.strftime('%m/%d/%Y')
  ```
  Covers hour offsets, weekday offsets, delays, 24h later, birthday/relativedelta(years=...).
- **Query:** `Today is 27 February 2023. I was born exactly 25 years ago. What is the date I was born?` → model generates:
  ```python
  today = datetime(2023, 2, 27)
  born = today - relativedelta(years=25)
  born.strftime('%m/%d/%Y')
  ```
- **Execution:** `exec(llm_out); print(born)` → `02/27/1998`. Note `exec` usage carries security caveat.

### Library Context
- Source prompt file: `https://github.com/reasoning-machines/pal/blob/main/pal/prompt/date_understanding_prompt.py`
- LangChain circa 2023 `langchain.llms.OpenAI` (pre-`langchain-openai` split).

## Notable Quotes
> "It differs from chain-of-thought prompting in that instead of using free-form text to obtain solution it offloads the solution step to a programmatic runtime such as a Python interpreter."

> "The LLM reads natural language problems and generate programs as the intermediate reasoning steps."

## Concepts Introduced or Referenced
- [[program-aided-language-models]] — LLM-generated programs + interpreter execution for faithful reasoning.
- [[tool-use]] — Minimal tool pattern: code interpreter as external executor (precursor to [[model-context-protocol]] hosted tools).
- [[prompt-engineering]] — Few-shot code prompts as steering mechanism.
- [[thinking-models]] — Shares CoT motivation but fixes arithmetic via execution.
- [[in-context-learning]] — 6 Python exemplars teach the code-comment pattern in-context.

## Critical Assessment
- **Strengths:** Only chapter in this batch with a fully runnable end-to-end example; concretely shows why code beats text for date arithmetic; bridges prompting and agent tool use.
- **Weaknesses:** Uses deprecated `text-davinci-003` + old LangChain import (`langchain.llms`); `exec()` without sandbox warning is unsafe; one exemplar has a bug (`later` computed but `today.strftime` returned); no quantitative results (paper’s GSM8K lift omitted); limited to deterministic domains — no discussion of when not to use PAL (commonsense, open-ended).
- **Contradictions:** None, but clarifies that PAL is not pure prompting — it requires a runtime — unlike text-only techniques. Aligns with [[tool-use]] taxonomy (Code Interpreter).
- **Modernization:** Replace with `gpt-4o` + `langchain-openai` + sandboxed `CodeInterpreterTool`/`model_context_protocol` filesystem server.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/pal.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/pal.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/pal.en.mdx)
- Primary paper: Gao et al. (2022) — https://arxiv.org/abs/2211.10435
- Prompt source: https://github.com/reasoning-machines/pal

---

**Source:** Prompt Engineering Guide — PAL: Program-Aided Language Models by DAIR.AI (Elvis Saravia et al.) — based on Gao et al. (2022) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/pal.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
