---
type: concept
title: "Active-Prompt"
summary: Active-Prompt (Diao et al., 2023) is a data-driven few-shot prompting technique that replaces a fixed, human-chosen chain-of-thought exemplar set with an uncertainty-based selection.
visibility: public
aliases:
  - Active Prompting
  - Active Prompt
  - wiki/active-prompt
tags:
  - prompt-engineering
  - inference
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-techniques-activeprompt]]"
related:
  - "[[prompt-engineering]]"
  - "[[in-context-learning]]"
  - "[[automatic-prompt-engineer]]"
  - "[[thinking-models]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Active-Prompt (Diao et al., 2023) is a data-driven few-shot prompting technique that replaces a fixed, human-chosen chain-of-thought exemplar set with an uncertainty-based selection.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li><li><a href="/prompt-engineering/concepts/automatic-prompt-engineer">Automatic Prompt Engineer (APE)</a></li><li><a href="/llm-fundamentals/concepts/thinking-models">Thinking Models</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-activeprompt">Prompt Engineering Guide — Active-Prompt</a></li></ul></nav>
</aside>

## Overview
**Active-Prompt** (Diao et al., 2023) is a data-driven few-shot prompting technique that replaces a fixed, human-chosen chain-of-thought exemplar set with an *uncertainty-based* selection. For each training question the model samples k answers, computes an uncertainty metric (e.g., disagreement/entropy), and humans annotate only the most uncertain questions with CoT reasoning. Those targeted exemplars then serve as the few-shot prompt, making [[in-context-learning]] task-adaptive and annotation-efficient.

## Key Ideas
- **Fixed exemplars are not optimal:** A static CoT set may miss the task regions where the model is weakest.
- **Uncertainty as acquisition function:** Borrowing from active learning, disagreement over k sampled outputs identifies high-value questions.
- **Targeted human annotation:** Budget is spent where reasoning help matters most, not random coverage.
- **Task-specific exemplars:** Selection adapts to each dataset’s difficulty distribution.

## How It Works
1. **Pool:** Set of unlabeled training questions.
2. **Sampling:** For each question, query LLM k times (with or without existing CoT prompts) → k answers.
3. **Uncertainty scoring:** Compute metric:
   - *Disagreement:* 1 − (max frequency / k)
   - *Entropy:* −Σ p(a) log p(a) over answer distribution
   - Variants include variance of log-probs.
4. **Ranking & selection:** Sort questions by uncertainty descending; top-n selected.
5. **Human CoT annotation:** Annotators write step-by-step reasoning for selected questions only.
6. **Inference:** New exemplars used as few-shot CoT prompt for test questions. Illustrated in [[source-promptingguide-techniques-activeprompt]] figure (query → k answers → score → select → annotate → infer).

## Practical Implications
- **Annotation efficiency:** When human CoT budget is limited, Active-Prompt yields higher accuracy per annotated example than random selection.
- **Requires training pool:** Needs unlabeled task questions + ability to sample k times (cost = k×|pool| calls).
- **Choice of k & metric:** Larger k improves estimate but costs more; disagreement is simple, entropy captures distribution shape.
- **Complements other selection:** Can layer with retrieval-based selection (e.g., KNN exemplars) — active chooses *what* to annotate, retrieval chooses *which* to show per query.

## Connections
- Optimizes the exemplar slot of [[prompt-engineering]] / [[in-context-learning]], whereas [[automatic-prompt-engineer]] optimizes the instruction slot.
- Builds on chain-of-thought from [[thinking-models]] — same reasoning elicitation, better-conditioned.
- Shares active-learning philosophy with RL exploration but without weight updates.
- Could be orchestrated via [[tool-use]] loops that auto-sample and score uncertainties.

## Open Questions
- Which uncertainty metric (disagreement vs entropy vs self-consistency margin) best correlates with exemplar utility across tasks?
- How does Active-Prompt interact with self-consistency decoding or adaptive few-shot retrieval at inference time?
- What is the sample-efficiency vs annotation-cost Pareto frontier compared to fully automatic methods like [[automatic-prompt-engineer]]?

## Sources
- [[source-promptingguide-techniques-activeprompt]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
