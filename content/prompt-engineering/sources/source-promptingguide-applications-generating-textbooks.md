---
type: source-summary
title: "Tackling Generated Datasets Diversity — Textbooks Are All You Need — Prompt Engineering Guide Applications"
summary: Follow-up to the RAG synthetic-data guide addressing diversity failures in bulk LLM generation and how to fix them via randomized entity seeding and iterative hierarchical generation.
status: draft
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating_textbooks.en.mdx"
date-published: 2023-09-20
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - fine-tuning
key-concepts:
  - "[[synthetic-data|Synthetic Data Generation]]"
  - "[[applications-overview]]"
  - "[[code-generation]]"
key-entities:
  - "[[openai]]"
aliases:
  - wiki/source-promptingguide-applications-generating-textbooks
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Follow-up to the RAG synthetic-data guide addressing diversity failures in bulk LLM generation and how to fix them via randomized entity seeding and iterative hierarchical generation.</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-09-20. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating_textbooks.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 7 figures on this page were not found in [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating_textbooks.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating_textbooks.en.mdx): `1.3B`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Follow-up to the RAG synthetic-data guide addressing **diversity failures in bulk LLM generation** and how to fix them via **randomized entity seeding and iterative hierarchical generation**. Covers the Eldan et al. (2023) TinyStories recipe (random verb/noun/adjective from 1500-word child vocab + random features: dialogue, twist, bad ending;  high-but-not-max temperature) and Gunasekar et al. (2023) `Textbooks Are All You Need` / Phi-1 recipe (textbook-like Python docs seeded by random topic + target audience; 1B tokens via GPT-3.5; 1.3B Phi-1 rivaling 10× larger models on HumanEval), with general 4-step synthesis workflow and cost estimate (~$4000 for 1B tokens).

## Key Takeaways
1. **Naïve high temperature ≠ diversity:** Even high temp yields repetitive corpora; solution is prompt-level randomness by sampling entities per generation.
2. **Eldan diversity seeding:** Pre-build vocabularies (1500 basic words → nouns/verbs/adjectives) and feature lists (dialogue, plot twists, bad endings, moral lessons); per sample inject random verb + noun + adjective + feature subset. Prompt:
   `Write a short story (3-5 paragraphs) which only uses very simple words that a 3 year old child would likely understand. The story should use the verb "{verb}", the noun "{thunder}" and the adjective "{ancient}". Features: {dialogue, bad ending}…` — produces varied stories even with overlapping words.
3. **Hierarchical / iterative refinement:** Generate intermediate artifacts (summary, required sentence, feature set) then feed them into the final prompt — e.g., `Summary: {LLM summary} Features: {features} Sentence: {required sentence} Words: {words} Story:` — enabling hundreds of thousands of varied samples.
4. **General 4-step workflow:** Identify variable entities → compile collections → random-sample per prompt + set temp > default but < max → train local model on generations; class label can be injected as an entity.
5. **Textbook seeding for pretraining:** Gunasekar et al. impose `topic` (e.g., Singular matrices) + `target audience` (1st-year bachelor → high-schooler → PhD phrasing varies) to generate 1B tokens of textbook extracts (overview → natural-language solution → ≤10-line Python function snippets). Fine-tuning Phi-1 (1.3B) on this + 6B filtered code reaches HumanEval performance rivaling 10× larger models. Cost: ~$2000 prompt + $2000 generation at $0.002/1k (ChatGPT).

## Detailed Notes
- **Structure:** Sequel note linking to `synthetic_rag`; two Screenshot assets (`textbooks_1.png` GAT sample, `textbooks_2.png` Phi-1 metrics); three major subsections: diversity via random words, iterative generation, Textbooks Are All You Need.
- **Story examples:** decorate/thunder/ancient + dialogue/bad-ending → Lily ancient house story; second example summary+sentence+words `disagree, network, beautiful` + `One day, she went to the park…` → compromise/broken sandcastle story with ants network.
- **Phi-1 prompt recreation attempt:**
  ```
  Write an extract from a Computer Science textbook for a 1st-year bachelor. The coding language is Python 3.6.
  This is an extract from the middle of the following topic: Singular matrices.
  The extract starts with a high-level overview … Then example … 1-2 code snippets, ≤10 rows, no text after. Keep concise (2 paragraphs at most). …
  ```
  Output demonstrates definition, 2×2 determinant rule, NumPy `is_singular` function.
- **Audience constraint insight:** Same topic phrased differently per audience (high-school vs CS undergrad vs PhD) injects stylistic diversity free of content drift.
- **CoT note:** Method stacks with [[chain-of-thought]] for reasoning-heavy pretraining; Alpaca/Vicuna cited as synthetic-data fine-tuning successes.
- **Pricing disclaimer:** Author-estimated; actual needs usually far <1B tokens for fine-tuning (vs pretraining).

## Notable Quotes
> "Language is not just a system of rules and symbols; it conveys and interprets meaning. The main challenge of using large language models to produce training data is ensuring dataset diversity."
> "Since we formulate the prompt randomly each time, and the model adheres to it precisely, the stories turn out to be incredibly varied. The narrative will be entirely different even if one or two words remain the same."
> "They argue that language models would be more effective if they were trained on materials that resemble the characteristics of a well-regarded 'textbook': clear, comprehensive, informative, and unbiased."
> "Keep in mind that fine-tuning on synthetic data becomes more valuable as the domain becomes more niche, especially if the language deviates from English."

## Concepts Introduced or Referenced
- [[synthetic-data|Synthetic Data Generation]] — Entity-seeded diversity, hierarchical generation, textbook-quality pretraining.
- [[code-generation]] — Phi-1 application: Python function synthesis evaluated on HumanEval.
- [[applications-overview]] — Applied synthetic-data use cases (TinyStories, Phi).
- [[in-context-learning]] — LLM follows random constraints zero-shot.
- [[chain-of-thought]] — Compatible reasoning augmentation for synthetic corpora.

## Critical Assessment
- **Strengths:** Bridges toy story generation to serious pretraining (Phi-1) with reproducible randomization recipe; quantifies diversity failure mode and costs; provides two complementary seeding axes (lexical entities + audience/topic) and a hierarchical pattern.
- **Weaknesses:** Gunasekar prompt not disclosed — recreation is inferred; diversity metrics not quantified; copyright/quality risk of textbook mimicry undiscussed; 1B-token cost outdated.
- **Contradictions:** None; extends [[source-promptingguide-applications-generating]] (manual counts) and [[source-promptingguide-applications-synthetic-rag]] (few-shot intent) with automation at scale.
- **Gaps:** Needs link to de-duplication, filtering, and eval of synthetic vs human data leakage.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating_textbooks.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating_textbooks.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating_textbooks.en.mdx)
- Cited: Eldan et al. 2023 TinyStories https://arxiv.org/abs/2305.07759; Gunasekar et al. 2023 Textbooks Are All You Need https://arxiv.org/abs/2306.11644; Chen et al. 2021 HumanEval https://arxiv.org/abs/2107.03374; Phi-1 story; Taori Alpaca 2023; Zheng Vicuna 2023

---

**Source:** Tackling Generated Datasets Diversity — Textbooks Are All You Need — Prompt Engineering Guide Applications by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/generating_textbooks.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
