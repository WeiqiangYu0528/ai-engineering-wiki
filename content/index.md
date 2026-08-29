---
type: moc
title: Start here
summary: The site's entry point — what this knowledge base covers, which reading path to begin with, how far its claims have been checked, and which subjects it leaves out.
visibility: public
status: draft
tags:
  - llm-fundamentals
created: 2026-08-29
updated: 2026-08-29
---

# Start here

A working knowledge base on AI engineering, kept the way an engineer keeps notes: one idea
per page, claims traced back to a stored source, and a label on every page saying how far
that page has actually been checked. 279 pages are published, across ten
domains.

## Pick a way in

These domains have an ordered reading path. Each entry says why it sits where it does, so
reading in order means meeting the ideas roughly in the order they were built.

- **LLM fundamentals** starts at [[tokenization]] — what a model actually consumes, then
  embeddings, attention, and the architecture assembled around them.
- **Prompt engineering** starts at [[prompt-engineering]] — where prompting stops and
  fine-tuning starts, then the techniques in the order they compose.
- **AI agents and tool use** starts at [[ai-agents]] — an LLM calling tools in a loop, and
  what becomes binding as the loop runs longer.
- **Fine-tuning and alignment** starts at [[alignment]] — the gap between the pretraining
  objective and yours, then each stage that answers it.
- **Evaluation and safety** starts at [[evaluation]] — measurement first, because every
  claim about a failure mode is a claim about a number somebody defined.

The synthesis pages argue something no single page says; [[post-training-lineage]] is the
one to read first. Browsing instead of reading? [[catalog]] is the full catalog of concepts,
entities and syntheses, and [[catalog-sources]] lists every source summarized.

## How far this has been checked

| Status | Published pages |
| --- | --- |
| `mature` | 0 |
| `verified` | 70 |
| `draft` | 208 |
| `stub` | 1 |

Human sign-off stands at 0 pages. `draft` means the prose is written and its
numbers have not been re-checked. `verified` means an agent checked every quantitative claim
against the stored source — an agent, not a reviewer. Read a `draft` page as a lead rather
than as a citation.

Two measurements are worth having before you lean on any figure here. 1,464 of
1,582 numbers quoted in the reading notes were located in the source they cite.
And of 595 quoted passages, 195 are paraphrase presented as
quotation — accurate in substance, not word for word. Both are being worked through, and
neither is finished.

## What this does not cover

Classical machine learning is absent: no trees, no feature engineering, no tabular
modelling. So is deep learning outside language models — vision, speech and generative
media appear only where a language model is part of the story. MLOps shows up as cost,
deployment and observability thinking rather than platform engineering, so there is no
Kubernetes here and no orchestration tutorial.

Coverage across the domains is lopsided, and the thin ones are worth naming: MLOps and
production, the open-source ecosystem, and multimodal work hold a page or two each.
Retrieval and inference are better than that and still well short of the paths above.

## The registers

[[open-questions]] collects every question the pages leave open, by domain. [[log]] is the
append-only record of what was ingested, checked and corrected, and when.

---

Also here: [Attribution and sources](/NOTICE) · [What has been checked](/trust)
