---
title: How this was built
---

# How this was built

Generated 2026-08-30.

This is a personal knowledge base about AI engineering, built on the [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f): a human curates sources, a language model reads them and maintains an interlinked wiki on top, and a schema file teaches any coding agent how to do that maintenance consistently.

## The two layers

Sources live in a private layer — papers, lecture decks, articles, documentation collected for personal study. They are never published. What you are reading is the layer above: summaries, concept pages, and entity pages that cite them.

279 pages are published here. 32 are held back, either because publishing them would reproduce a source rather than comment on it (leaked vendor prompts, textbook chapter summaries, slide-by-slide lecture transcriptions) or because their stored source turned out too thin to support their claims.

## Why the status badges

An LLM-written wiki is easy to produce and hard to trust, so the claims are checked mechanically against the stored sources and each page says how it did:

- Every figure — percentages, parameter counts, token counts, benchmark scores — is searched for in the cited source, allowing for notation differences.
- Every quoted passage is graded on how much of it appears verbatim. Pages whose quotes turned out to be paraphrase carry a visible correction notice.
- A page reaches `verified` only when both checks pass, and `mature` only after a human reads it.

The full method, results, and limitations are on the `trust` page. The tooling that produces all of it is part of the private repository.

## What to expect

Coverage is deep in some places and thin in others, following what the author was studying: transformer internals, training systems, post-training and RL, prompting and agents, retrieval, evaluation. It is a study artifact, not a reference work.
