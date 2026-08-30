---
type: source-summary
title: "Prompt Engineering Guide — Generated Knowledge Prompting"
summary: This chapter introduces Generated Knowledge Prompting (Liu et al. 2022 — https://arxiv.org/pdf/2110.08387.pdf) as the two-stage technique where the LLM first generates task-relevant knowledge statements, then uses them…
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/knowledge.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - rag
key-concepts:
  - "[[generated-knowledge-prompting]]"
  - "[[retrieval-augmented-generation]]"
  - "[[hallucination]]"
  - "[[chain-of-thought]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-knowledge
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This chapter introduces Generated Knowledge Prompting (Liu et al. 2022 — https://arxiv.org/pdf/2110.08387.pdf) as the two-stage technique where the LLM first generates task-relevant knowledge statements, then uses them…</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-01-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/knowledge.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
This chapter introduces **Generated Knowledge Prompting** (Liu et al. 2022 — https://arxiv.org/pdf/2110.08387.pdf) as the two-stage technique where the LLM first generates task-relevant knowledge statements, then uses them as context to make the final prediction, specifically targeting commonsense reasoning failures. Using the golf misconception (`Part of golf is trying to get a higher point total than others. Yes or No?` → `Yes` wrong), it replicates the paper's few-shot knowledge-generation prompt (5 exemplar Input→Knowledge pairs: Greece/Mexico, glasses fog, fish intelligence, smoking risk, pebble size) and shows integrated QA with two sampled knowledges yielding divergent answers (confident `No` vs hesitant `Yes`).

## Key Takeaways
1. **Generate-then-predict:** Stage 1: prompt model to emit knowledge (`Knowledge: The objective of golf is to play … least number of strokes`); Stage 2: concatenate knowledge + question with `Explain and Answer:` to produce grounded response.
2. **Targets world-knowledge gaps:** Plain LLMs misanswer commonsense requiring factual grounding; generated knowledge injects in-context facts analogous to [[retrieval-augmented-generation]] but from parametric memory.
3. **Few-shot pattern for knowledge generation:** The knowledge generator itself is few-shot prompted with diverse Input→Knowledge exemplars establishing style, granularity, and citation-free factual tone.
4. **Confidence varies with knowledge quality:** Same question with `Knowledge 1` (least strokes wins) → high-confidence correct `No`; `Knowledge 2` (precision sport … fewest strokes) → low-confidence `Yes` despite correct premise — showing sensitivity to phrasing and need for verification.
5. **Simplified demo:** Author notes the process is simplified for illustration; full paper adds knowledge selection, ranking, and integration details before final answer aggregation.

## Detailed Notes
### Motivation
- LLMs struggle on commonsense requiring world knowledge; RAG addresses via retrieval, but can model generate its own knowledge first?
- Fig `gen-knowledge.png` from Liu et al. illustrates two-stage flow.

### Knowledge Generation Prompt (from paper)
```
Input: Greece is larger than mexico.
Knowledge: Greece is approximately 131,957 sq km, while Mexico is ~1,964,375...

Input: Glasses always fog up.
Knowledge: Condensation occurs on eyeglass lenses when water vapor ...

Input: A fish is capable of thinking.
Knowledge: Fish are more intelligent than they appear ...

Input: A common effect of smoking lots of cigarettes ...
Knowledge: Those who consistently averaged less than one cigarette ...

Input: A rock is the same size as a pebble.
Knowledge: A pebble is a clast of rock 4 to 64 mm (Udden-Wentworth) ...

Input: Part of golf is trying to get a higher point total than others.
Knowledge: →
```
- Model then completes two knowledges about golf lowest-score wins.

### Knowledge Integration & QA
```
Question: Part of golf is trying to get a higher point total than others. Yes or No?
Knowledge: The objective of golf is to play a set of holes in the least number of strokes...
Explain and Answer: → No, the objective ... least number ... not points. (very high confidence)
```
```
Question: (same)
Knowledge: Golf is a precision club-and-ball sport ... fewest number of strokes ...
Explain and Answer: → Yes, part of golf is trying to get higher ... lowest score wins ... (lower confidence, actually wrong)
```
- Demonstrates that knowledge quality and phrasing directly affect final answer correctness and calibration.

### Handling
- Author: "I simplified the process for demonstration purposes but there are a few more details to consider when arriving at the final answer. Check out the paper for more."

## Notable Quotes
> "can the model also be used to generate knowledge before making a prediction? That's what is attempted in the paper by Liu et al. 2022 — generate knowledge to be used as part of the prompt."
> "This type of mistake reveals the limitations of LLMs to perform tasks that require more knowledge about the world."
> "Some really interesting things happened with this example. In the first answer, the model was very confident but in the second not so much."

## Concepts Introduced or Referenced
- [[generated-knowledge-prompting]] — Two-stage generate-knowledge → integrate-and-answer method for commonsense reasoning.
- [[retrieval-augmented-generation]] — Closely related but retrieval-based counterpart; generated knowledge is parametric-memory alternative to RAG's non-parametric retrieval.
- [[hallucination]] — Golf `Yes` error exemplifies confabulation from missing grounding; knowledge injection as mitigation.
- [[chain-of-thought]] — Shares "intermediate generation before answer" structure, but knowledge prompt generates facts not reasoning chains.
- [[few-shot-prompting]] / [[in-context-learning]] — Knowledge generator itself few-shot conditioned; integration prompt uses QA + knowledge as context.
- [[prompt-elements]] — Knowledge slot acts as Context element per taxonomy.
- [[prompt-chaining]] — Implicitly a 2-step chain (generate → answer).

## Critical Assessment
- **Strengths:** Clearly motivates from RAG analogy, provides full replicable prompt (5 exemplars) and shows contrasting outputs that honestly expose brittleness; honest about simplification and defers to paper for ranking details.
- **Weaknesses:** Demo uses only one question (golf); second knowledge's derivation is truncated in guide (confidence claim but no calibration metric). Does not quantify benchmark lift vs RAG or baseline; does not address that generated knowledge can itself hallucinate (compounding error) and needs fact verification.
- **Contradictions:** None with [[retrieval-augmented-generation]] — but tension needs explicit note: RAG grounds in external truth, generated knowledge risks amplifying parametric hallucinations; comparison should be flagged.
- **Gaps:** Needs cross-link to [[self-consistency]] (sampling multiple knowledges + voting), [[tool-use]] (fact-check generated knowledge via search), and [[hallucination]] mitigation strategies (RAG as preferred when truth matters).

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/knowledge.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/knowledge.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/knowledge.en.mdx)
- Cited: Liu et al. 2022 Generated Knowledge Prompting https://arxiv.org/pdf/2110.08387.pdf

---

**Source:** Prompt Engineering Guide — Generated Knowledge Prompting by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/knowledge.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
