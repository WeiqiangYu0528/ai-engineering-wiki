---
type: source-summary
title: "Prompt Engineering Guide — General Tips for Designing Prompts"
summary: "This chapter codifies iterative, practical heuristics for crafting reliable prompts: start simple and decompose complex tasks, front-load explicit instructions with strong action verbs and ### separators, maximize…"
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/tips.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - llm-fundamentals
key-concepts:
  - "[[prompt-design-tips]]"
  - "[[prompt-engineering]]"
  - "[[prompt-elements]]"
  - "[[role-prompting]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-introduction-tips
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This chapter codifies iterative, practical heuristics for crafting reliable prompts: start simple and decompose complex tasks, front-load explicit instructions with strong action verbs and ### separators, maximize…</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-01-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/tips.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
This chapter codifies iterative, practical heuristics for crafting reliable prompts: start simple and decompose complex tasks, front-load explicit instructions with strong action verbs and `###` separators, maximize task-specific **specificity** (including desired output format and examples), avoid vague impreciseness, and frame directives positively ("say what to do" rather than "what not to do"). Two extended before/after pairs — place extraction from a Nature paragraph and a movie-recommendation chatbot that violates `DO NOT` constraints — make the principles concrete.

## Key Takeaways
1. **Iterative and decompositional:** Prompt design is experimental; begin with minimal prompts in a playground (OpenAI/Cohere), then incrementally add elements, and split large tasks into subtasks.
2. **Instruction design:** Use imperative verbs (`Write`, `Classify`, `Summarize`, `Translate`, `Order`), place instructions at the prompt start, and separate instruction vs context with a clear delimiter like `###`.
3. **Specificity with format anchors:** Detailed, relevant specifics plus explicit format cues (`Place: <comma_separated_list_of_places>`) outperform generic requests; examples in the prompt are the most reliable way to enforce a format.
4. **Avoid impreciseness:** Vague constraints ("Keep the explanation short, only a few sentences, and don't be too descriptive") underdetermine behavior; prefer precise quantification and audience ("Use 2-3 sentences to explain prompt engineering to a high school student").
5. **Positive framing:** LLMs often ignore negations (`DO NOT ASK FOR INTERESTS` still triggers the question); restate as affirmative duties ("The agent is responsible to recommend from top global trending movies… It should refrain… If none, respond 'Sorry…'").

## Detailed Notes

### Start Simple (Iterative Process)
- Prompting = experimentation; avoid premature complexity.
- Workflow: simple prompt → add elements/context stepwise → measure improvement.
- For multi-step goals, break into subtasks and build up; prevents over-engineering the prompt at outset.

### The Instruction
- Effective prompts use command verbs tailored to task: `Write`, `Classify`, `Summarize`, `Translate`, `Order`.
- Requires empirical search over keywords, contexts, and data; more specific/relevant context → better adherence.
- Placement heuristic: instructions first.
- Separator heuristic: `###` between instruction and context, e.g.:
  ```
  ### Instruction ###
  Translate the text below to Spanish:

  Text: "hello!"
  ```
  → `¡Hola!`

### Specificity
- Detail and descriptive format > clever token tricks; no magic keywords, but good format wins.
- Providing examples in prompt is highly effective for format enforcement.
- Length awareness: context window limits and cost constrain how much detail to include; only add relevant details.
- Worked extraction example:
  ```
  Extract the name of places in the following text.
  Desired format:
  Place: <comma_separated_list_of_places>
  Input: "… Champalimaud Centre for the Unknown in Lisbon …"
  ```
  → `Place: Champalimaud Centre for the Unknown, Lisbon`
  Source paragraph from Nature 2023.

### Avoid Impreciseness
- Directness ≈ effective communication.
- Imprecise: `Explain prompt engineering. Keep short, only a few sentences, and don't be too descriptive.` — leaves sentence count/style ambiguous.
- Precise: `Use 2-3 sentences to explain prompt engineering to a high school student.` — quantifies length and audience.

### To Do or Not to Do? (Positive Framing)
- Pitfall: `DO NOT ASK FOR INTERESTS. DO NOT ASK FOR PERSONAL INFORMATION.` → model still asks `What kind of movie would you like…?`
- Fix: affirmative specification:
  ```
  The following is an agent that recommends movies… The agent is responsible to recommend a movie from the top global trending movies. It should refrain from asking users for their preferences …
  If the agent doesn't have a movie to recommend, it should respond "Sorry, couldn't find a movie to recommend today.".
  ```
  → model returns fallback or trending list without probing.
- Pattern aligns with OpenAI "Best practices for prompt engineering" (cited).

## Notable Quotes
> "It is really an iterative process that requires a lot of experimentation to get optimal results."

> "It's more important to have a good format and descriptive prompt. In fact, providing examples in the prompt is very effective to get desired output in specific formats."

> "Another common tip when designing prompts is to avoid saying what not to do but say what to do instead."

## Concepts Introduced or Referenced
- [[prompt-design-tips]] — Primary synthesis: iterative design, placement, specificity, conciseness, positive framing.
- [[prompt-engineering]] — Overall discipline within which tips are applied.
- [[prompt-elements]] — Instruction, context, and output indicator concretized via templates and separators.
- [[role-prompting]] — Movie-agent case shows role/behavior instruction failure mode and fix (affirmative role definition).
- [[in-context-learning]] — Example-driven format enforcement as instance of few-shot steering.

## Critical Assessment
- **Strengths:** Highly practical, with minimal runnable pairs that contrast bad vs good phrasing; covers often-overlooked pragmatics (negation blindness, separator conventions) that matter in production. Explicitly cites OpenAI best practices, grounding advice beyond anecdote.
- **Weaknesses:** Heuristics are presented without ablation or quantitative evaluation; no discussion of when specificity hurts (over-constraining creativity) or of instruction hierarchy in chat models (`system` > `developer` > `user`). Place-extraction example assumes English; multilingual or nested entity cases not addressed.
- **Contradictions:** None with existing wiki. Reinforces [[prompt-engineering]] and [[in-context-learning]] while adding new separator/negation insights not previously documented.
- **Extensions:** Could link to [[llm-settings]] (temperature interacts with determinism expectations set by precise instructions) and to [[prompt-injection]] (positive framing as lightweight defense).

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/tips.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/tips.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/tips.en.mdx)

---

**Source:** Prompt Engineering Guide — General Tips for Designing Prompts by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/introduction/tips.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
