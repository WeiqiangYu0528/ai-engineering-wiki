---
type: concept
title: "Prompts Hub"
summary: The Prompts Hub (pages/prompts in the Prompt Engineering Guide) is an indexed collection of 12 task-specific prompt families, each aggregating concrete runnable prompts.
visibility: public
aliases:
  - Prompt Collection
  - Prompt Engineering Hub
  - DAIR Prompts
  - wiki/prompts-hub
tags:
  - prompt-engineering
  - llm-fundamentals
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "Prompt Hub — Representative Prompts Collection"
related:
  - "[[prompt-engineering]]"
  - "[[prompt-elements]]"
  - "[[in-context-learning]]"
  - "[[chain-of-thought]]"
  - "[[retrieval-augmented-generation]]"
  - "[[few-shot-prompting]]"
  - "[[zero-shot-prompting]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">The Prompts Hub (pages/prompts in the Prompt Engineering Guide) is an indexed collection of 12 task-specific prompt families, each aggregating concrete runnable prompts.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/prompt-elements">Prompt Elements</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li><li><a href="/prompt-engineering/concepts/few-shot-prompting">Few-Shot Prompting</a></li><li><a href="/prompt-engineering/concepts/zero-shot-prompting">Zero-Shot Prompting</a></li></ul></nav>
</aside>

## Overview
The **Prompts Hub** (`pages/prompts` in the Prompt Engineering Guide) is an indexed collection of 12 task-specific prompt families, each aggregating concrete runnable prompts. Representative sampled hubs — Classification, Coding, Reasoning, Question-Answering, Text Summarization, Information Extraction (plus deep examples: Sentiment, Code-Snippet, Physical Reasoning) — illustrate the hub → deep-prompt hierarchy: index page enumerates prompts; each deep prompt provides background, prompt, template (`{input}` slot), and paired GPT-4 / Mixtral API snippets.

## Key Ideas
- **12 task families:** adversarial-prompting, classification, coding, creativity, evaluation, image-generation, information-extraction, mathematics, question-answering, reasoning, text-summarization, truthfulness.
- **Consistent deep-prompt structure:** Background → Prompt (example) → Prompt Template (`{input}`) → Code/API (GPT-4 `openai` SDK + Mixtral `fireworks` SDK Tabs) → Reference.
- **Exemplar templates:**
  - *Classification (Sentiment):* `Classify the text into neutral, negative, or positive\nText: {input}\nSentiment:` — zero-shot 3-way classifier; few-shot variant `sentiment-fewshot` parallels it.
  - *Coding (Code-Snippet):* `/*\nAsk the user for their name and say "Hello"\n*/` — comment-wrapped instruction leveraging code-model completion bias.
  - *Reasoning/QA/Extraction/Summarization:* Same slot-filling + API pattern, adapting instruction to domain.
- **Provider-parity snippets:** Every deep prompt ships runnable Python for both OpenAI and Fireworks, with provider-specific stop tokens and sampling defaults, enabling direct portability.

## How It Works
Browsing flow: `pages/prompts/<task>.en.mdx` (hub index, `<ContentFileNames>` component) → `pages/prompts/<task>/<subprompt>.en.mdx` (deep prompt). Copy the prompt template, fill `{input}`, and invoke via chat/completions API with task-appropriate decoding (low temperature for classification/coding, higher for creativity).

## Practical Implications
- **Fast prototyping:** Hub + template pattern reduces prompt authoring to slot-filling; start from the closest deep prompt and adapt.
- **Teaching ICL:** Zero-shot vs few-shot variants side-by-side make the hub a compact [[in-context-learning]] teaching set.
- **Cross-link to techniques:** Each hub task is a downstream application of core patterns ([[chain-of-thought]] for reasoning, [[retrieval-augmented-generation]] for QA, [[prompt-chaining]] for extraction/summarization).
- **Hubs are thin on purpose:** Real value is in deep prompts; expect no per-hub evaluation numbers — use the technique pages and benchmarks for quality guidance.

## Connections
- Instantiates [[prompt-engineering]] fundamentals: [[prompt-elements]] (instruction + input slot), [[in-context-learning]], [[prompt-optimization]] starting points.
- Classification/coding map to [[zero-shot-prompting]] / [[few-shot-prompting]]; reasoning maps to [[chain-of-thought]] / [[self-consistency]]; QA maps to [[retrieval-augmented-generation]] grounding.
- API snippets exercise [[llm-settings]] and [[decoding-strategies]] configuration.

## Open Questions
- Which hub prompts benefit most from upgrading zero-shot → few-shot vs technique swap (e.g., adding CoT to reasoning)?
- How to systematically benchmark the 12 task families against n-shot variants using the provided snippets?

## Sources
- Prompt Hub — Representative Prompts Collection

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
