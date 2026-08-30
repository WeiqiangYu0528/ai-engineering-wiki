---
type: concept
title: "Generated Knowledge Prompting"
summary: Generated Knowledge Prompting (Liu et al. 2022 https://arxiv.org/pdf/2110.08387.pdf) is a two-stage prompt chaining technique where the LLM first generates task-relevant knowledge statements itself, then integrates them…
visibility: public
aliases:
  - Generate Knowledge Prompting
  - Knowledge Generation Prompting
  - Liu Generated Knowledge
  - wiki/generated-knowledge-prompting
tags:
  - prompt-engineering
  - rag
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-techniques-knowledge]]"
  - "[[source-promptingguide-techniques-rag]]"
related:
  - "[[retrieval-augmented-generation]]"
  - "[[chain-of-thought]]"
  - "[[prompt-chaining]]"
  - "[[hallucination]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Generated Knowledge Prompting (Liu et al. 2022 https://arxiv.org/pdf/2110.08387.pdf) is a two-stage prompt chaining technique where the LLM first generates task-relevant knowledge statements itself, then integrates them…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/prompt-engineering/concepts/prompt-chaining">Prompt Chaining</a></li><li><a href="/eval-safety/concepts/hallucination">Hallucination</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-knowledge">Prompt Engineering Guide — Generated Knowledge Prompting</a></li><li><a href="/rag/sources/source-promptingguide-techniques-rag">Prompt Engineering Guide — Retrieval Augmented Generation (RAG)</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
**Generated Knowledge Prompting** (Liu et al. 2022 https://arxiv.org/pdf/2110.08387.pdf) is a **two-stage prompt chaining** technique where the LLM **first generates task-relevant knowledge statements** itself, then integrates them as context to answer the original question — targeting commonsense reasoning failures where the model's parametric knowledge is under-activated. The DAIR Guide's golf example (`Part of golf is trying to get a higher point total than others. Yes or No?` → naive `Yes` wrong) shows few-shot knowledge generation (5 Input→Knowledge exemplars: Greece/Mexico, glasses fog, fish intelligence, smoking risk, pebble size) producing `Knowledge 1: The objective … least number of strokes` → confident correct `No` vs `Knowledge 2` → hesitant wrong `Yes`.

## Key Ideas
- **Generate-then-integrate pipeline:**
  1) Knowledge generation prompt: `Input: … Knowledge:` few-shot template generates knowledge statements about the query.
  2) Integration prompt: `Question: … Knowledge: <generated> Explain and Answer:` steers model to ground its reasoning in the generated knowledge before the final label.
- **Analogy to RAG, source differs:** [[retrieval-augmented-generation]] retrieves external documents non-parametrically; generated knowledge sources from **parametric memory** — no external index, but same pattern of context injection to reduce [[hallucination]].
- **Few-shot steering of the generator:** The generator itself is conditioned with diverse exemplar Input→Knowledge pairs establishing factual, granular tone — behavior is controlled via [[few-shot-prompting]].
- **Brittleness exposed:** Same golf question with two differently worded knowledges yields divergent confidence/correctness — proving generation quality and phrasing directly affect the final answer and calibration.
- **Needs selection/ranking in full paper:** The guide notes simplification; full Liu framework ranks multiple generated knowledges before integration.

## How It Works
```
Stage 1 — Generate knowledge:
Input: Greece is larger than mexico.
Knowledge: Greece is ~131,957 sq km, Mexico ~1,964,375 ... → (few-shot exemplars)
Input: Part of golf is trying to get a higher point total ...
Knowledge: → "The objective of golf is to play 18 holes in least strokes…"

Stage 2 — Integrate:
Question: Part of golf is trying to get higher ... Yes or No?
Knowledge: <generated statement>
Explain and Answer: → model reasons over knowledge + question → final label
```
1. Few-shot knowledge prompt encodes the Input→Knowledge mapping into context.
2. Model autoregressively generates knowledge completion(s) (can sample multiple like [[self-consistency]]).
3. Knowledge concatenated with QA prompt as Context element per [[prompt-elements]]; model now reasons with facts in working memory rather than relying solely on latent weights.

## Practical Implications
- **Useful when no retriever/index exists:** Provides grounding without building vector DB — trade external corpus for in-model knowledge activation; fast to prototype.
- **Risk amplification:** Generated knowledge can itself be hallucinated, compounding error (vs RAG which cites external source). Should verify with retrieval or [[tool-use]] web search when factuality matters.
- **Cost is 2× calls:** Generate + answer doubles latency and tokens; can batch multiple knowledge samples and vote for robustness.
- **Commonsense vs factual tasks:** Works best where knowledge is already in parametric memory but under-retrieved; for evolving or niche facts, [[retrieval-augmented-generation]] is preferred.

## Connections
- Closely related to [[retrieval-augmented-generation]] — same context-injection pattern, different knowledge source (parametric vs non-parametric).
- Two-step instance of [[prompt-chaining]] (generate → integrate); also overlaps [[chain-of-thought]]'s "intermediate generation before answer" structure, but generates **facts** not reasoning steps.
- Foundation for compound systems: sample multiple knowledges + [[self-consistency]] vote, or filter via external verifier/tool.
- Contrasted with [[hallucination]] mitigation taxonomy: generation alone may worsen it without external grounding.
- Format via [[prompt-elements]] Context element; delivered via [[prompt-chaining]] pipeline.

## Open Questions
- Can we reliably detect and filter hallucinated generated knowledge without an external retriever?
- How many knowledge samples are needed and how to aggregate conflicting knowledges?
- When should a system prefer generated knowledge vs retrieval vs hybrid (generate then verify against retrieved)?

## Sources
- [[source-promptingguide-techniques-knowledge]]
- [[source-promptingguide-techniques-rag]]
- Liu et al. 2022 Generated Knowledge Prompting https://arxiv.org/pdf/2110.08387.pdf

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
