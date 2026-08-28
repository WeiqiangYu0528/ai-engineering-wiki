---
type: concept
title: "Prompt Design Tips"
summary: "Prompt Design Tips are the iterative, empirical heuristics for building reliable LLM prompts distilled from the DAIR.AI Prompt Engineering Guide: start simple and decompose, front-load instructions with imperative verbs…"
visibility: public
aliases:
  - "Prompting Best Practices"
  - "Prompt Heuristics"
  - "Prompt Crafting Guidelines"
tags:
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-introduction-tips]]"
  - "[[source-promptingguide-introduction-elements]]"
  - "[[source-promptingguide-introduction-examples]]"
related:
  - "[[prompt-engineering]]"
  - "[[prompt-elements]]"
  - "[[role-prompting]]"
  - "[[in-context-learning]]"
---

# Prompt Design Tips

## Overview
**Prompt Design Tips** are the iterative, empirical heuristics for building reliable LLM prompts distilled from the DAIR.AI Prompt Engineering Guide: start simple and decompose, front-load instructions with imperative verbs and `###` separators, maximize task-specific specificity with explicit format cues, avoid vague impreciseness, and frame directives positively rather than via negations.

## Key Ideas
- **Iterative & decompositional workflow:** Prompt design is experimentation; begin with a minimal prompt in a playground (OpenAI/Cohere), add one [[prompt-elements]] element at a time, and break large tasks into subtasks before composing.
- **Instruction placement & delimiters:** Use strong imperative verbs (`Write`, `Classify`, `Summarize`, `Translate`, `Order`); place instructions at the prompt's start; separate instruction from context/input with a clear delimiter like `###` (e.g., `### Instruction ###`).
- **Specificity via format anchors:** Detailed, relevant specifics beat clever token tricks. Explicit desired format (`Place: <comma_separated_list_of_places>`, `Sentiment: neutral`) and embedded examples are the most reliable way to enforce output shape, respecting context-window cost.
- **Avoid impreciseness:** Vague quantifiers (`short`, `a few sentences`, `don't be too descriptive`) underdetermine behavior. Replace with precise quantification and audience: `Use 2-3 sentences to explain prompt engineering to a high school student.`
- **Positive framing ("say what to do"):** LLMs often ignore negations. `DO NOT ASK FOR INTERESTS` still elicits `What kind of movie would you like…?`; affirmative restatement — `The agent is responsible to recommend from top global trending movies. It should refrain… If none, respond "Sorry…"` — yields correct fallback behavior.

## How It Works
Illustrative before/after pairs from [[source-promptingguide-introduction-tips]]:

**1. Specificity / format:**
```
# Vague — not recommended
Extract places from: "… Champalimaud Centre for the Unknown in Lisbon …"

# Specific — desired format anchored
Extract the name of places in the following text.
Desired format:
Place: <comma_separated_list_of_places>
Input: "… Champalimaud Centre for the Unknown in Lisbon …"
→ Place: Champalimaud Centre for the Unknown, Lisbon
```

**2. Impreciseness:**
```
# Imprecise
Explain prompt engineering. Keep short, only a few sentences, and don't be too descriptive.
# Precise
Use 2-3 sentences to explain prompt engineering to a high school student.
```

**3. Negation blindness:**
```
# Before — fails
The following is an agent that recommends movies… DO NOT ASK FOR INTERESTS…
Customer: Please recommend a movie… Agent: Sure… What kind of movie would you like…?

# After — affirmative, succeeds
The following is an agent… The agent is responsible to recommend a movie from the top global trending movies.
It should refrain from asking… If the agent doesn't have a movie to recommend, it should respond "Sorry, couldn't find a movie to recommend today.".
→ Sorry, … here's a list of top global trending movies…
```

Each tip maps to a [[prompt-elements]] slot: instruction (verbs, placement, positive framing), output indicator (format anchor), context (examples that demonstrate specificity).

## Practical Implications
- **Playground-first development:** OpenAI Playground or Cohere console with low [[llm-settings]] temperature gives rapid feedback; log before/after variants.
- **Decomposition scales:** Splitting "summarize + extract + classify" into chained prompts is more debuggable than one mega-prompt.
- **Cost/length trade-off:** Specificity helps but each added detail consumes tokens; include only relevant constraints (relevant context principle).
- **Negation risk:** In agent [[role-prompting]] scenarios, never rely solely on `DO NOT`; always provide the affirmative fallback utterance verbatim.
- **Transferability:** These heuristics were validated on `gpt-3.5-turbo` but generalize across instruction-tuned models; still ablate per model version.

## Connections
- Applied methodology within [[prompt-engineering]]; turns the [[prompt-elements]] taxonomy into actionable rules.
- Specificity via examples exploits [[in-context-learning]] (one exemplar fixes `Neutral` → `neutral` casing).
- Role/agent framing failures link to [[role-prompting]] (system-role directives obey instruction hierarchy better than user-embedded `DO NOT`).
- Settings in [[llm-settings]] (low temperature) reinforce determinism promised by precise instructions; vague prompts remain brittle even at low temperature.
- Positive-framing guidance is a lightweight complement to [[prompt-injection]] defenses, though not a security boundary.

## Open Questions
- Can automated prompt optimizers (DSPy, OPRO) discover specificity/format combos that outperform these handcrafted heuristics, and at what token cost?
- How do instruction-hierarchy effects (`system` > `developer` > `user` > `tool` in modern chat APIs) modify the "place instructions at the beginning" heuristic?
- When does over-specificity hurt — e.g., constraining creativity or causing brittleness to paraphrase — and how to detect that threshold?

## Sources
- [[source-promptingguide-introduction-tips]]
- [[source-promptingguide-introduction-elements]]
- [[source-promptingguide-introduction-examples]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
