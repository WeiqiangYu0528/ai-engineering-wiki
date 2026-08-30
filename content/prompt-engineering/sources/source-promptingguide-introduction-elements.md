---
type: source-summary
title: "Prompt Engineering Guide — Elements of a Prompt"
summary: "This concise chapter formalizes the four building blocks that compose any prompt: Instruction, Context, Input Data, and Output Indicator."
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/elements.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - llm-fundamentals
key-concepts:
  - "[[prompt-elements]]"
  - "[[prompt-engineering]]"
  - "[[in-context-learning]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-introduction-elements
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This concise chapter formalizes the four building blocks that compose any prompt: Instruction, Context, Input Data, and Output Indicator.</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-01-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/elements.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
This concise chapter formalizes the four building blocks that compose any prompt: **Instruction**, **Context**, **Input Data**, and **Output Indicator**. It illustrates the taxonomy with a text-classification example (`Classify the text… / Text: … / Sentiment:`) and clarifies that prompts need not contain all four elements — composition depends on task complexity. Context is explicitly linked to few-shot exemplars that steer output style and label distribution.

## Key Takeaways
1. **Four canonical elements:** Every prompt can be decomposed into instruction (what to do), context (supporting information/exemplars), input data (the query), and output indicator (format cue).
2. **Minimal prompts are valid:** Not all elements are required; a single instruction + output indicator suffices for simple classification, while harder tasks benefit from added context.
3. **Classification pattern:** `Instruction → Input Data → Output Indicator` (`Sentiment:`) is the reusable skeleton for labeling tasks.
4. **Context as steering:** Few-shot examples, domain knowledge, or retrieved documents placed in the context slot shape the model's prior over next tokens without weight changes.
5. **Format dependence:** Choice of elements and delimiters should match the task; consistency matters more than any specific token.

## Detailed Notes

### The Four Elements
- **Instruction** — Specific task directive (`Classify the text into neutral, negative, or positive`).
- **Context** — External information or additional exemplars that guide the model toward better responses; may be few-shot demos, retrieved passages, or domain constraints.
- **Input Data** — The actual query instance (`Text: I think the food was okay.`).
- **Output Indicator** — Format/type cue (`Sentiment:`) that triggers the expected label or structure; often a colon-terminated field name.

### Worked Example
```
Classify the text into neutral, negative, or positive

Text: I think the food was okay.

Sentiment:
```
- Instruction = classification directive
- Input Data = `I think the food was okay.`
- Output Indicator = `Sentiment:`
- Context = absent in minimal form; could be inserted as additional labeled examples above the query.

### Composition Principles
- Flat wiki-style prompt engineering benefit: decomposition makes iteration explicit (tune one element at a time).
- Context insertion example: adding 3–5 labeled sentiments before query shifts model from `Neutral` (default) to `neutral` (desired casing) — connects to [[in-context-learning]].
- Statement "You do not need all four elements" reinforces atomic, task-dependent design.

## Notable Quotes
> "A prompt contains any of the following elements: Instruction, Context, Input Data, Output Indicator."

> "You do not need all the four elements for a prompt and the format depends on the task at hand."

## Concepts Introduced or Referenced
- [[prompt-elements]] — Primary contribution: four-element taxonomy with concrete mapping.
- [[prompt-engineering]] — Frames element composition as core skill within prompt engineering.
- [[in-context-learning]] — Context element realization via few-shot demonstrations.
- [[prompt-design-tips]] — Foreshadows iterative specificity and format control covered in tips chapter.

## Critical Assessment
- **Strengths:** Crisp taxonomy that is immediately actionable; single-example walk-through makes abstract labels concrete; video embed reinforces multimodal learning.
- **Weaknesses:** Very brief (single example); does not show a context-rich variant side-by-side, nor discuss system-role vs context distinction in chat models. Does not address element ordering effects or token-cost trade-offs.
- **Contradictions:** None with existing wiki. Complements [[prompt-engineering]] overview which previously lacked explicit element breakdown. Aligns with [[in-context-learning]] context-as-working-memory metaphor.
- **Gaps to fill:** Needs cross-reference to [[role-prompting]] (system instruction as special instruction element) and [[llm-settings]] (output indicator interacts with stop sequences).

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/elements.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/elements.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/elements.en.mdx)

---

**Source:** Prompt Engineering Guide — Elements of a Prompt by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/elements.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
