---
type: source-summary
title: "Prompt Engineering Guide — Retrieval Augmented Generation (RAG)"
summary: This chapter introduces Retrieval Augmented Generation (RAG) as the architecture that couples an information-retrieval component over external knowledge sources (e.g., Wikipedia) with a text generator to serve…
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/rag.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - rag
  - prompt-engineering
key-concepts:
  - "[[retrieval-augmented-generation]]"
  - "[[hallucination]]"
  - "[[generated-knowledge-prompting]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-rag
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This chapter introduces Retrieval Augmented Generation (RAG) as the architecture that couples an information-retrieval component over external knowledge sources (e.g., Wikipedia) with a text generator to serve…</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-01-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/rag.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
This chapter introduces **Retrieval Augmented Generation (RAG)** as the architecture that couples an information-retrieval component over external knowledge sources (e.g., Wikipedia) with a text generator to serve knowledge-intensive tasks where static parametric memory fails or hallucinates. It summarizes Lewis et al. 2021's fine-tuning recipe (seq2seq parametric memory + dense Wikipedia vector index + neural retriever), explains the concatenation flow (query → retrieve supporting docs → concat with prompt → generate), and notes adaptive benefits when facts evolve, with strong results on Natural Questions, WebQuestions, CuratedTrec, MS-MARCO, Jeopardy, and FEVER, plus modern popularity when combined with ChatGPT and an open notebook for ML-paper-title generation.

## Key Takeaways
1. **Two memories:** Parametric (seq2seq LM weights) + non-parametric (dense vector index of Wikipedia accessed via pretrained retriever); knowledge can be updated by reindexing without retraining.
2. **Flow:** Input → retriever retrieves relevant docs → docs concatenated as context with original prompt → generator produces final output — bypassing the knowledge cutoff.
3. **Why it matters:** Addresses hallucination and factual inconsistency on knowledge-intensive tasks where fine-tuning alone is insufficient; enables access to evolving facts.
4. **Lewis 2021 recipe:** General-purpose fine-tuning recipe using pretrained seq2seq as parametric memory and dense Wikipedia index as non-parametric memory (figure `rag.png`).
5. **Proven and practical:** Strong on Natural Questions / WebQuestions / CuratedTrec / MS-MARCO / Jeopardy / FEVER; more factual, specific, diverse outputs; modern retriever approaches now combined with ChatGPT; notebook `pe-rag.ipynb` shows RAG for generating concise ML paper titles with open-source LLMs.

## Detailed Notes
### Motivation
- General-purpose LMs fine-tuned for sentiment/NER don't need extra background; complex knowledge-intensive tasks do — hallucination risk rises when answer requires external facts.
- RAG enables factual consistency, improved reliability, and bypasses "LLM parametric knowledge is static" limitation.
- Meta AI blog https://ai.facebook.com/blog/retrieval-augmented-generation-streamlining-the-creation-of-intelligent-natural-language-processing-models/ as origin narrative.

### Architecture (Lewis et al. 2021)
- Image `rag.png` from Lewis et al. https://arxiv.org/pdf/2005.11401.pdf
- Components:
  - Parametric memory: pretrained seq2seq model (e.g., BART).
  - Non-parametric memory: dense vector index of Wikipedia + neural pretrained retriever.
  - Fusion: retrieve top-k docs given source (Wikipedia), concatenate as context, feed to generator.
- Advantage: internal knowledge modified efficiently via index update; no full retraining.

### Results and Scope
- Benchmarks: Natural Questions https://ai.google.com/research/NaturalQuestions, WebQuestions https://paperswithcode.com/dataset/webquestions, CuratedTrec; generation benchmarks MS-MARCO, Jeopardy → more factual/specific/diverse; FEVER fact verification improved.
- Trend: retriever + ChatGPT combination became popular to improve factual consistency.

### Use Case — Generating Friendly ML Paper Titles
- Cards UI linking to notebook https://github.com/dair-ai/Prompt-Engineering-Guide/blob/main/notebooks/pe-rag.ipynb showcasing open-source LLM RAG pipeline for title generation (chunking → embedding → retrieval → generation).

### References
- Lewis et al. 2020 RAG https://arxiv.org/abs/2312.10997 survey (Dec 2023) and Meta blog (Sep 2020) cited.

## Notable Quotes
> "For more complex and knowledge-intensive tasks, it's possible to build a language model-based system that accesses external knowledge sources to complete tasks. This enables more factual consistency, improves reliability of the generated responses, and helps to mitigate the problem of 'hallucination'."
> "RAG can be fine-tuned and its internal knowledge can be modified in an efficient manner and without needing retraining of the entire model."
> "This is very useful as LLMs's parametric knowledge is static. RAG allows language models to bypass retraining, enabling access to the latest information for generating reliable outputs via retrieval-based generation."

## Concepts Introduced or Referenced
- [[retrieval-augmented-generation]] — Core: retrieval + concatenation + generation; Wikipedia index + seq2seq recipe.
- [[hallucination]] — Primary failure RAG mitigates — grounding via retrieved context reduces confabulation.
- [[generated-knowledge-prompting]] — Parametric alternative where model generates knowledge itself rather than retrieving it externally.
- [[prompt-chaining]] — RAG often implemented as chain: retrieve → compose prompt → generate.
- [[tool-use]] — Retriever as a tool; modern RAG = LLM + retrieval tool via [[model-context-protocol]].
- [[in-context-learning]] — Retrieved docs occupy context window as high-fidelity working memory vs fuzzy parametric weights (cf. [[pretraining]]).
- [[prompt-elements]] — Retrieved docs fill the Context element.

## Critical Assessment
- **Strengths:** Clearest articulation of parametric vs non-parametric memory trade-off in the guide; efficient-update property (reindex without retrain) highlighted as key production advantage; grounds claims in 6 benchmarks and provides runnable notebook bridge to open-source practice.
- **Weaknesses:** Very high-level; does not detail chunking, embedding model choice, top-k, reranking, or hybrid search — all critical for production RAG. Lewis 2021 description omits training signal for retriever vs generator joint fine-tuning. No discussion of retriever failure modes (irrelevant docs → still hallucinate) or evaluation beyond list of datasets.
- **Contradictions:** None with [[hallucination]] or [[generated-knowledge-prompting]]; but should note tension: generated knowledge hallucinates more, RAG grounds more — preference depends on availability of trustworthy corpus.
- **Gaps:** Needs links to vector DB, chunking, hybrid search, reranking (missing from wiki RAG cluster — flag for future pages), and to [[prompt-elements]] delimiters for retrieved context injection.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/rag.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/rag.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/rag.en.mdx)
- Cited: Lewis et al. 2020/2021 RAG https://arxiv.org/pdf/2005.11401.pdf; Meta AI blog Sep 2020; RAG Survey Dec 2023 https://arxiv.org/abs/2312.10997; Natural Questions; WebQuestions; Notebook pe-rag.ipynb

---

**Source:** Prompt Engineering Guide — Retrieval Augmented Generation (RAG) by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/rag.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
