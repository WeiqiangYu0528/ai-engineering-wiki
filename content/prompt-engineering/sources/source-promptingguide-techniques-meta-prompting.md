---
type: source-summary
title: "Prompt Engineering Guide — Meta Prompting"
summary: This chapter introduces Zhang et al. (2024) Meta Prompting — a structure-oriented, syntax-focused technique that prioritizes the form and pattern of tasks over specific content details.
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.) — based on Zhang et al. (2024)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/meta-prompting.en.mdx"
date-published: 2024-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - inference
key-concepts:
  - "[[meta-prompting]]"
  - "[[prompt-engineering]]"
  - "[[in-context-learning]]"
key-entities: []
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-meta-prompting
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This chapter introduces Zhang et al. (2024) Meta Prompting — a structure-oriented, syntax-focused technique that prioritizes the form and pattern of tasks over specific content details.</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.) — based on Zhang et al. (2024), 2024-01-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/meta-prompting.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
This chapter introduces Zhang et al. (2024) *Meta Prompting* — a structure-oriented, syntax-focused technique that prioritizes the *form* and *pattern* of tasks over specific content details. Using abstract, categorical examples grounded in type theory, a meta prompt provides a syntactic template for solutions rather than content-laden few-shot demonstrations. The guide contrasts this with few-shot prompting via a MATH benchmark figure, lists advantages (token efficiency, fairer comparison, zero-shot efficacy), and notes applications in complex reasoning, math, and coding where LLMs already possess task knowledge.

## Key Takeaways
1. **Structure over content:** Meta prompts teach the *shape* of a solution (syntax, type categories, steps) not the facts.
2. **Five characteristics:** Structure-oriented, syntax-focused, abstract examples as frameworks, versatile across domains, categorical (type-theory inspired).
3. **Token-efficient zero-shot:** Achieves extensive improvement without detailed few-shot exemplars — fewer tokens, less example bias, fairer model comparison.
4. **Few-shot vs meta:** Few-shot is content-driven (concrete input-output pairs); meta is pattern-driven (abstract scaffolds). Figure meta-prompting.png shows side-by-side MATH solutions.
5. **Assumption:** LLM must already have innate task knowledge; effectiveness drops on truly novel tasks where content grounding is needed.

## Detailed Notes

### Definition (Zhang et al. 2024)
- **Meta Prompting:** Emphasizes structural and syntactical aspects rather than content details; draws from type theory to categorize and arrange prompt components logically.
- **Example of abstraction:** Instead of 3 concrete algebra examples, give one abstract template: “Given problem of type [Equation], decompose into [Variables] → apply [Operation] → format as [Expression]”.

### Key Characteristics (Guide’s Enumeration)
1. **Structure-oriented:** Prioritizes format/pattern over content.
2. **Syntax-focused:** Syntax as guiding template for expected response.
3. **Abstract examples:** Generalized frameworks, not specific instances.
4. **Versatile:** Applicable across domains (math, coding, theory).
5. **Categorical approach:** Type-theoretic categorization of prompt parts.

### Advantages over Few-Shot (Fig. MATH)
- **Token efficiency:** Abstract template << multiple fully-worked exemplars.
- **Fair comparison:** Minimizes influence of cherry-picked examples when benchmarking models.
- **Zero-shot efficacy:** Can be seen as zero-shot prompting with structural hint; reduces example leakage.
- Figure shows meta prompt yields structured step-by-step vs few-shot’s instance mimicry.

### Applications & Caveats
- **Good for:** Complex reasoning, mathematical problem-solving, coding challenges, theoretical queries — where reasoning structure is key and LLM has parametric knowledge.
- **Caveat:** Assumes LLM’s pretraining covers task; like zero-shot, may degrade on unique/novel tasks lacking in-context content grounding.

## Notable Quotes
> "Meta Prompting is an advanced prompting technique that focuses on the structural and syntactical aspects of tasks and problems rather than their specific content details."

> "Meta prompting and few-shot prompting are different in that meta prompting focuses on a more structure-oriented approach as opposed to a content-driven approach."

## Concepts Introduced or Referenced
- [[meta-prompting]] — Structure/syntax-oriented abstract prompting.
- [[prompt-engineering]] — Broad discipline; meta prompting is an advanced sub-technique.
- [[in-context-learning]] — Contrasted as content-driven few-shot vs structure-driven meta; both operate within context window.
- [[thinking-models]] — Shares emphasis on reasoning structure; meta prompting provides the scaffold.

## Critical Assessment
- **Strengths:** Clearly articulates the structure/content dichotomy and provides memorable characteristics; honest about assumption (needs parametric knowledge) and token-efficiency benefit; figure grounds contrast for MATH.
- **Weaknesses:** No concrete meta-prompt text reproduced (figure not transcribed); no quantitative MATH gain vs few-shot; “type theory” invoked but not explained; guide does not show how to author abstract examples in practice.
- **Contradictions:** None; complements [[automatic-prompt-engineer]] (which searches content prompts) and [[prompt-design-tips]] (specificity) — meta prompting trades specificity for abstraction.
- **Next steps:** Add verbatim meta-prompt example and few-shot counterpart from Zhang et al. paper for reproducibility; quantify token savings.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/meta-prompting.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/meta-prompting.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/meta-prompting.en.mdx)
- Primary paper: Zhang et al. (2024) — https://arxiv.org/abs/2311.11482

---

**Source:** Prompt Engineering Guide — Meta Prompting by DAIR.AI (Elvis Saravia et al.) — based on Zhang et al. (2024) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/meta-prompting.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
