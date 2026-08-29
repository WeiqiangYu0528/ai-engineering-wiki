---
type: concept
title: "Graph Prompting (GraphPrompt)"
summary: Graph Prompting (GraphPrompt) (Liu et al., 2023) is the porting of the prompting paradigm from NLP to graph-structured data.
visibility: public
aliases:
  - GraphPrompt
  - GraphPrompts
  - Graph Prompt
  - wiki/graph-prompting
tags:
  - prompt-engineering
  - rag
created: 2026-08-24
updated: 2026-08-24
status: stub
sources:
  - "Prompt Engineering Guide — GraphPrompts"
related:
  - "[[prompt-engineering]]"
  - "[[in-context-learning]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Graph Prompting (GraphPrompt) (Liu et al., 2023) is the porting of the prompting paradigm from NLP to graph-structured data.</p>
<p class="kb-trust kb-status-stub"><a href="/trust">Stub - placeholder, not yet written</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/prompt-engineering">Prompt Engineering</a></li><li><a href="/prompt-engineering/concepts/in-context-learning">In-Context Learning</a></li></ul></nav>
</aside>

## Overview
**Graph Prompting (GraphPrompt)** (Liu et al., 2023) is the porting of the prompting paradigm from NLP to graph-structured data. As stub-defined in Prompt Engineering Guide — GraphPrompts, it is a framework that reformulates diverse graph downstream tasks (node classification, link prediction) to match a pre-training objective via learned prompts, improving few-shot transfer for Graph Neural Networks (GNNs). The guide itself contains only a definition; this page is a stub pending paper-level expansion.

> [!WARNING] Stub — Thin Source
> Prompt Engineering Guide — GraphPrompts contains only two sentences and “More coming soon!” No prompt template, figure, or results are given. Content below supplements from the cited Liu et al. (2023) paper for orientation but should be verified against primary source before citing as mature.

## Key Ideas
- **Prompting beyond text:** Prompt = task reformulation device, not necessarily a natural-language string — for graphs, a learnable prompt token/subgraph.
- **Unify pre-training and downstream:** Pre-train GNN on e.g., link prediction / contrastive objective; prompt downstream graphs so their tasks look like that pretext.
- **GNN analogue of NLP prompts:** Mirrors how textual prompts turn classification into language modeling; graph prompts turn node/graph tasks into similarity in learned prompt space.

## How It Works
*Per Liu et al. (2023) beyond the guide’s coverage:*

```
Graph ──► GNN encoder (pre-trained) ──► Embeddings
Prompt tokens (learnable) ──► fused ──► Task-adapted representation ──► Downstream head
```

- **Learnable prompt:** Small set of vectors/tokens appended to node features or subgraph structure.
- **Training:** Freeze GNN, tune prompts on few-shot downstream data to maximize task performance — parameter-efficient like Prompt Tuning for LLMs.
- **Alternative interpretation (LLM-side):** Serializing a graph as text (e.g., `Node A connects to B, C`) and prompting an LLM — distinct from GNN GraphPrompt but often conflated. Guide does not disambiguate.

## Practical Implications
- **When relevant:** Few-shot graph tasks where pre-training is large but labels scarce (e.g., molecular property prediction, citation networks).
- **Caveat:** Not directly an LLM prompting technique — requires GNN stack, unlike other pages in this batch. If your stack is LLM-only, consider LLM-side graph serialization + [[prompt-engineering]] instead.
- **Production:** Track whether you mean GNN GraphPrompt (Liu et al.) vs LLM Graph-of-Thought / graph-serialized prompting — name collision causes confusion.

## Connections
- Generalizes [[prompt-engineering]] principles to structured data; shares parameter-efficient ethos with Prefix/Prompt Tuning discussed in [[automatic-prompt-engineer]].
- Contrasts with [[in-context-learning]] (which conditions a frozen LLM via exemplars) — GraphPrompt tunes prompt *vectors*, not just context.
- If LLM-side interpretation intended, connects to [[react]]/[[tool-use]] where graph is fetched via tool and serialized into context.

## Open Questions
- Which interpretation does the Prompt Engineering Guide intend — GNN prompts (Liu et al.) or LLM graph serialization? Guide’s stub leaves this ambiguous.
- For LLM stacks, does explicit graph serialization + CoT outperform GNN embeddings with prompts?
- What is the analogue of chain-of-thought for graphs (e.g., Graph-of-Thought traversal)?

## Sources
- Prompt Engineering Guide — GraphPrompts

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `stub` — Placeholder page. See [[trust]] for methodology.
