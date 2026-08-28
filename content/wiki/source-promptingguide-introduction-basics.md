---
type: source-summary
title: "Prompt Engineering Guide — Basics of Prompting"
summary: This opening chapter of the DAIR.AI Prompt Engineering Guide defines prompting and demonstrates how minimal changes in instruction phrasing dramatically alter LLM behavior.
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/basics.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - llm-fundamentals
key-concepts:
  - "[[prompt-engineering]]"
  - "[[in-context-learning]]"
  - "[[prompt-elements]]"
  - "[[role-prompting]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
---

# Prompt Engineering Guide — Basics of Prompting

## Summary
This opening chapter of the DAIR.AI Prompt Engineering Guide defines prompting and demonstrates how minimal changes in instruction phrasing dramatically alter LLM behavior. Using `gpt-3.5-turbo` and the OpenAI Playground, it contrasts naive completions (`"The sky is"` → `"blue."`) with instructed completions (`"Complete the sentence: The sky is"`), then introduces standard prompt formats (QA `Q:/A:`, instruction-only) and the distinction between **zero-shot** and **few-shot prompting**. The chapter frames few-shot exemplars as the mechanism enabling [[in-context-learning]] without weight updates.

## Key Takeaways
1. **Prompt quality scales with information:** Adding explicit instructions, context, inputs, or examples steers the model from generic continuation to task-specific output.
2. **Chat roles matter:** `gpt-3.5-turbo`/`gpt-4` support `system`/`user`/`assistant` roles; the `system` message sets global behavior while `user` carries the task and `assistant` can carry demonstrations.
3. **Zero-shot vs few-shot is a format choice:** Zero-shot sends only an instruction/question; few-shot prepends 2–5 `Input → Label` demonstrations, enabling the model to infer output format and task mapping.
4. **QA framing is a universal baseline:** `Q: <Question>? A: <Answer>` is the canonical dataset format, but any consistent delimiter (e.g., `// Positive`) works if applied uniformly.
5. **Few-shot enables in-context learning:** Even a handful of labeled examples (e.g., sentiment `Positive`/`Negative`) lets the model classify unseen inputs without fine-tuning.

## Detailed Notes

### Prompting an LLM — From Continuation to Instruction
- A prompt may contain instruction, question, context, inputs, or examples.
- Base behavior without instruction: `The sky is` → stochastic continuation (`blue.`). Highlight shows model as document completer before steering.
- Instructed variant: `Complete the sentence: The sky is` → `blue during the day and dark at night.` — demonstrates that prompt engineering is the design of effective instructions.
- Mentions OpenAI Playground screenshot and YouTube tutorial for `gpt-3.5-turbo` interaction.
- All examples default to `gpt-3.5-turbo` with `temperature=1, top_p=1` unless noted; transferable to similar-capability models.

### Chat Model Roles
- `system`: optional, sets overall assistant persona/behavior.
- `user`: carries the actionable prompt (used exclusively in guide for simplicity).
- `assistant`: model response channel; can also be pre-filled with desired-behavior examples to prime style.

### Prompt Formatting Fundamentals
- Simplest formats: `<Question>?` or `<Instruction>`.
- QA dataset standard:
  ```
  Q: <Question>?
  A:
  ```
- Zero-shot: direct prompt without demonstrations; works when task is well-represented in [[pretraining]] and instruction is clear.
- Modern instruction-tuned models can often drop the `Q:` prefix and still infer QA intent from sequence composition.

### Few-Shot Prompting
- Template:
  ```
  <Q>? <A>
  <Q>? <A>
  <Q>? <A>?
  ```
- QA variant with `Q:/A:` delimiters; delimiter choice is task-dependent.
- Classification example using `//` comment-style labels:
  ```
  This is awesome! // Positive
  This is bad! // Negative
  Wow that movie was rad! // Positive
  What a horrible show! // → Negative
  ```
- Few-shot = in-context learning: no gradient updates, model learns task from demonstrations via attention over context.

## Notable Quotes
> "You can achieve a lot with simple prompts, but the quality of results depends on how much information you provide it and how well-crafted the prompt is."

> "This approach of designing effective prompts to instruct the model to perform a desired task is what's referred to as **prompt engineering** in this guide."

> "Few-shot prompts enable in-context learning, which is the ability of language models to learn tasks given a few demonstrations."

## Concepts Introduced or Referenced
- [[prompt-engineering]] — Central definition: optimizing instructions to steer a frozen LLM.
- [[in-context-learning]] — Zero-shot/one-shot/few-shot conditioning; few-shot as inner-loop learning via context.
- [[prompt-elements]] — Previews instruction/context/input/output-indicator taxonomy detailed in next chapter.
- [[role-prompting]] — Preview of system/user/assistant role conditioning for behavior control.

## Critical Assessment
- **Strengths:** Exceptionally clear minimal examples that build intuition progression (bare continuation → instructed → QA → few-shot); grounds abstract terms in runnable OpenAI Playground snippets; correctly connects few-shot to in-context learning with terminology consistent with [[source-language-models-are-few-shot-learners]].
- **Weaknesses:** Uses `gpt-3.5-turbo` defaults (`T=1, top_p=1`) which are high-variance for demonstration; does not discuss variance or re-runs. Zero-shot definition is somewhat conflated with QA format rather than explicitly tying to instruction-tuning. No discussion of tokenization, cost, or context-window limits when adding few-shot exemplars.
- **Contradictions/Overlaps:** Aligns with [[prompt-engineering]] and [[in-context-learning]] pages; no contradictions. Adds the useful `Q:`/`A:` delimiter framing not yet documented in wiki.
- **Next steps:** Link to [[prompt-elements]] for full element taxonomy and [[llm-settings]] for how temperature/top_p interact with these prompts at inference.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/basics.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/basics.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/basics.en.mdx)

---

**Source:** Prompt Engineering Guide — Basics of Prompting by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/basics.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
