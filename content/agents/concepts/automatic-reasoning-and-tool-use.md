---
type: concept
title: "Automatic Reasoning and Tool-use (ART)"
summary: Automatic Reasoning and Tool-use (ART) (Paranjape et al. 2023 https://arxiv.org/abs/2303.09014) is the framework that automates interleaved Chain-of-Thought Prompting + Tool Use without hand-crafting task-specific…
visibility: public
aliases:
  - ART
  - Automatic Reasoning and Tool Use
  - wiki/automatic-reasoning-and-tool-use
tags:
  - agents
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-techniques-art]]"
  - "[[source-promptingguide-techniques-cot]]"
  - "[[source-promptingguide-techniques-rag]]"
related:
  - "[[tool-use]]"
  - "[[chain-of-thought]]"
  - "[[prompt-chaining]]"
  - "[[tree-of-thoughts]]"
  - "[[retrieval-augmented-generation]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Automatic Reasoning and Tool-use (ART) (Paranjape et al. 2023 https://arxiv.org/abs/2303.09014) is the framework that automates interleaved Chain-of-Thought Prompting + Tool Use without hand-crafting task-specific…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/agents/concepts/tool-use">Tool Use</a></li><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/prompt-engineering/concepts/prompt-chaining">Prompt Chaining</a></li><li><a href="/prompt-engineering/concepts/tree-of-thoughts">Tree of Thoughts (ToT)</a></li><li><a href="/rag/concepts/retrieval-augmented-generation">Retrieval Augmented Generation (RAG)</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/agents/sources/source-promptingguide-techniques-art">Prompt Engineering Guide — Automatic Reasoning and Tool-use (ART)</a></li><li><a href="/prompt-engineering/sources/source-promptingguide-techniques-cot">Prompt Engineering Guide — Chain-of-Thought Prompting</a></li><li><a href="/rag/sources/source-promptingguide-techniques-rag">Prompt Engineering Guide — Retrieval Augmented Generation (RAG)</a></li></ul></nav>
</aside>

## Overview
**Automatic Reasoning and Tool-use (ART)** (Paranjape et al. 2023 https://arxiv.org/abs/2303.09014) is the framework that **automates interleaved [[chain-of-thought]] + [[tool-use]]** without hand-crafting task-specific demonstrations or scripted tool orchestration. With a **frozen LLM and a task library of multi-step reasoning + tool-use exemplars**, ART **retrieves relevant demonstrations for each new task**, **pauses generation at tool-call boundaries, executes tools, and integrates their outputs** before resuming — yielding zero-shot generalization to unseen tasks and extensibility by simply editing the library. On BigBench and MMLU, ART substantially outperforms few-shot and Auto-CoT, and with human feedback exceeds hand-crafted CoT (figures `ART.png` / `ART2.png`).

## Key Ideas
- **Frozen LLM + task/tool libraries:** No weight updates. Maintain a library where each entry is a demonstration of reasoning interleaved with tool calls (e.g., search, code execution, arithmetic). At test time, select the most relevant demonstrations for the query task — analogous to few-shot demo selection but over a rich program-like corpus.
- **Pause-execute-resume loop:** Model emits a program-like reasoning trace that includes explicit tool invocation points; execution pauses, external tools run, outputs are concatenated into context, generation resumes — model learns decomposition and tool placement from retrieved demos rather than hard-coded scripts.
- **Zero-shot to unseen tasks:** Because selection is automatic, ART generalizes from library examples to decompose new tasks and place tools appropriately without per-task prompt engineering — described as "in a zero-shot fashion" from the library perspective (task itself is unseen, though demos are retrieved).
- **Human-in-the-loop extensibility:** Fix a reasoning mistake or add a new tool by editing the task/tool libraries — no retraining. Paranjape shows human feedback incorporation pushes ART beyond hand-crafted CoT ceilings.
- **Why prior approaches were brittle:** Earlier CoT+tools combos required manually writing per-task demos and scripting interleaving; ART removes that bottleneck with retrieval-based generalization.

## How It Works
```
New task: "Analyze this dataset and summarize …"
   │
   ├─ Retrieve: relevant demos from task library (reasoning + tool-use exemplars)
   │
   ▼
Frozen LLM conditioned on retrieved demos generates:
  Reasoning step 1 → [TOOL: code_interpreter: python …] → pause → execute → output appended
  Reasoning step 2 → [TOOL: web_search: query …] → pause → execute → output appended
  ...
  Final synthesis
   │
   ▼
Answer
Human can edit library → next retrieval automatically improved
```
1. Query encoder retrieves demonstrations most similar to new task.
2. LLM generates reasoning as a program; parser detects tool-call syntax and triggers execution.
3. Tool outputs (structured JSON, code stdout, search snippets) are inserted as tool observations per agent loop (cf. [[tool-use]]).
4. Loop continues until final answer; optional human review corrects traces and updates library.

## Practical Implications
- **First principles for autonomous agents:** ART is the conceptual bridge between prompting and agentic [[tool-use]] — demonstration retrieval anticipates modern agent frameworks where skills/tools are discovered via [[model-context-protocol]] and LLM decides placements.
- **Outperforms strong baselines:** BigBench + MMLU tables (`ART2.png`) show clear gains over few-shot and Auto-CoT, validating that library diversity + tool interleaving beats prompt-only scaling.
- **Operational gaps not covered in guide:** Tool-inventory design, retrieval scoring, secure sandboxing for arbitrary code, handling partial tool failures, latency from serial tool calls — all critical for production; modern `strict: true` constrained decoding and [[model-context-protocol]] address some.
- **Comparisons missing:** Guide does not contrast ART vs ReAct, OpenAI function calling, or DSPy — worth benchmarking in practice.

## Connections
- Extends [[chain-of-thought]] with executable tools; automates [[prompt-chaining]] where the LLM determines the chain links and placements rather than a human author.
- Realized via [[tool-use]] taxonomy (code interpreter, search, file ops) and standardized by [[model-context-protocol]] for discovery.
- Retrieval of demos mirrors [[retrieval-augmented-generation]] but over reasoning programs rather than factual documents; similar to [[generated-knowledge-prompting]]'s knowledge selection.
- Search over tool-augmented traces can be enhanced with [[self-consistency]] voting or [[tree-of-thoughts]] branching — natural hybrids.
- Contrasted with [[supervised-fine-tuning]]: ART emphasizes curation over training; complementary to [[thinking-models]] where tool-augmented deliberation is learned via RL.

## Open Questions
- How to curate and maintain a high-quality, diverse yet compact task library that scales to hundreds of tools without diluting retrieval?
- Can ART's retrieval be jointly optimized with LLM generation (like RAG retriever training) vs kept as nearest-neighbor?
- How to robustly handle tool execution failures and untrustworthy tool outputs within the pause-resume loop?

## Sources
- [[source-promptingguide-techniques-art]]
- [[source-promptingguide-techniques-cot]]
- [[source-promptingguide-techniques-rag]]
- Paranjape et al. 2023 ART https://arxiv.org/abs/2303.09014; BigBench & MMLU

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
