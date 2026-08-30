---
type: concept
title: "Meta Prompting"
summary: Meta Prompting (Zhang et al., 2024) is a structure-oriented, syntax-focused technique that teaches an LLM the form of a solution rather than its content.
visibility: public
aliases:
  - Meta-Prompting
  - Structural Prompting
  - Categorical Prompting
  - wiki/meta-prompting
tags:
  - prompt-engineering
  - inference
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-techniques-meta-prompting]]"
related:
  - "[[prompt-engineering]]"
  - "[[in-context-learning]]"
  - "[[prompt-design-tips]]"
  - "[[thinking-models]]"
  - "[[automatic-prompt-engineer]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Meta Prompting (Zhang et al., 2024) is a structure-oriented, syntax-focused technique that teaches an LLM the form of a solution rather than its content.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li><li><a href="/prompt-engineering/concepts/prompt-design-tips">Prompt Design Tips</a></li><li><a href="/llm-fundamentals/concepts/thinking-models">Thinking Models</a></li><li><a href="/prompt-engineering/concepts/automatic-prompt-engineer">Automatic Prompt Engineer (APE)</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-meta-prompting">Prompt Engineering Guide — Meta Prompting</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Meta Prompting** (Zhang et al., 2024) is a structure-oriented, syntax-focused technique that teaches an LLM the *form* of a solution rather than its content. Instead of content-heavy few-shot exemplars, it supplies abstract, categorical templates (inspired by type theory) that scaffold how to decompose and format answers. Per [[source-promptingguide-techniques-meta-prompting]], this yields token-efficient, example-unbiased prompting that excels on complex reasoning, math (MATH benchmark), and coding when the model already possesses task knowledge.

## Key Ideas
- **Structure > content:** Emphasize pattern, syntax, and categorical organization over concrete instance details.
- **Abstract examples as frameworks:** One generalized template can replace multiple fully-worked demonstrations.
- **Five characteristics (Zhang et al.):** Structure-oriented, syntax-focused, abstract examples, versatile across domains, categorical/type-theoretic.
- **Zero-shot flavor:** Functions as a form of zero-shot prompting — minimizes example influence, enabling fairer cross-model comparison.

## How It Works
Contrast from guide’s figure (MATH benchmark):

**Few-shot (content-driven):**
```
Q: Solve 2x+3=7. A: x=2 (steps...)
Q: Solve 3y-1=5. A: y=2 (steps...)
Q: Solve new equation...
```

**Meta prompt (structure-driven):**
```
Task type: [Algebraic Equation]
Structure: Identify variables : [Vars] → Isolate : [Operation] → Format : [Solution Syntax]
Apply to given problem, preserving syntax.
Q: <new problem>
```

The meta prompt supplies the *type scaffold*; the LLM fills content from parametric knowledge. Pipeline: `Meta template (syntax+categories) + task → LLM → structured solution`.

## Practical Implications
- **Token efficiency:** Abstract template ≪ k exemplars → cheaper at scale and within limited context windows.
- **Fair evaluation:** Reduces cherry-picking bias when benchmarking models — same structure, not tuned examples.
- **Prerequisite:** Assumes LLM’s pre-training covers the task domain; like zero-shot, degrades on truly novel tasks where grounding examples are needed — fall back to few-shot then.
- **Authoring:** Design templates by naming types/steps (`[Given]`, `[Goal]`, `[Method]`, `[Output Format]`) rather than embedding full solutions.
- **Pairing:** Can be combined with [[automatic-prompt-engineer]] to *search* for optimal meta structures.

## Connections
- Within [[prompt-engineering]]: meta prompting is the abstract counterpart to [[prompt-design-tips]] specificity (which advocates concrete detail) — trade-off between bias and grounding.
- Contrasts with [[in-context-learning]] few-shot (content-driven) and with [[directional-stimulus-prompting]] (input-conditioned hints).
- Supports [[thinking-models]] reasoning scaffolds: meta templates explicitly encode the decomposition steps CoT should follow.
- Complements [[automatic-prompt-engineer]] — APE can optimize meta templates as part of search space.

## Open Questions
- How to formally derive type-theoretic templates so they are both general and precise enough to guide generation?
- What is the scaling law for meta prompting — do larger models benefit more from abstraction, or do small models still need concrete exemplars?
- Can meta prompting be composed with retrieval ([[in-context-learning]] exemplars on demand) for hybrid structure+content?

## Sources
- [[source-promptingguide-techniques-meta-prompting]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
