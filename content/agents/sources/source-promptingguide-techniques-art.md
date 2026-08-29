---
type: source-summary
title: "Prompt Engineering Guide — Automatic Reasoning and Tool-use (ART)"
summary: This brief chapter introduces Automatic Reasoning and Tool-use (ART) (Paranjape et al. 2023 https://arxiv.org/abs/2303.09014) as the framework that couples Chain-of-Thought Prompting with interleaved tool calls without…
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/art.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - agents
  - prompt-engineering
key-concepts:
  - "[[automatic-reasoning-and-tool-use]]"
  - "[[tool-use]]"
  - "[[chain-of-thought]]"
  - "[[prompt-chaining]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-art
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This brief chapter introduces Automatic Reasoning and Tool-use (ART) (Paranjape et al. 2023 https://arxiv.org/abs/2303.09014) as the framework that couples Chain-of-Thought Prompting with interleaved tool calls without…</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-01-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/art.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
This brief chapter introduces **Automatic Reasoning and Tool-use (ART)** (Paranjape et al. 2023 https://arxiv.org/abs/2303.09014) as the framework that couples [[chain-of-thought]] with interleaved tool calls without hand-crafted per-task demonstrations or scripted tool interleaving. Using a frozen LLM and a task library of multi-step reasoning + tool-use exemplars, ART selects relevant demonstrations for a new task, pauses generation when a tool is invoked, integrates the tool's output, and resumes generation — enabling zero-shot generalization to unseen tasks and extensibility via library edits. It reports substantial gains over few-shot prompting and Auto-CoT on BigBench and MMLU, exceeding hand-crafted CoT when human feedback is incorporated (figures `ART.png` / `ART2.png`).

## Key Takeaways
1. **Frozen LLM + task library:** Keep LLM weights frozen; maintain a library of demonstrations showing reasoning + tool use across tasks; at test time retrieve the most relevant demonstrations for the query task.
2. **Interleaved execution:** Generation pauses at tool-call boundaries; external tool executes; its output is concatenated back into context before resuming — model learns to decompose tasks and place tool calls from demonstrations.
3. **Zero-shot to new tasks:** Because selection is automatic, ART generalizes from library demos to decompose unseen tasks and choose appropriate tools without per-task prompt engineering.
4. **Extensible by editing:** Humans can fix reasoning mistakes or add new tools by simply updating the task/tool libraries — no model retraining.
5. **Empirical strength:** Outperforms few-shot prompting and Auto-CoT on BigBench/MMLU unseen tasks; with human feedback incorporation exceeds hand-crafted CoT prompts.

## Detailed Notes
### Problem It Solves
- Prior CoT+tools approaches require hand-crafting task-specific demonstrations and carefully scripted interleaving of generations with tool use — labor intensive and brittle.
- ART proposes automatic generation of intermediate reasoning as a program, driven by demonstration retrieval.

### How ART Works (Two Steps)
1. Given a new task, select demonstrations of multi-step reasoning and tool use from a task library (relevance-based retrieval).
2. At test time, pause generation whenever external tools are called, integrate their output before resuming generation.
- Illustrated in `ART.png` (framework diagram) and `ART2.png` (BigBench/MMLU performance table) from Paranjape et al.

### Properties Emphasized
- Model generalizes from demonstrations to decompose new tasks and use tools in appropriate places "in a zero-shot fashion."
- Extensibility: fix mistakes or add tools via library updates.

### Performance
- Table ART2 shows ART substantially improving over few-shot and Auto-CoT on BigBench and MMLU; human-feedback variant surpasses hand-crafted CoT.
- FileTree component and Screenshot elements frame the chapter.

## Notable Quotes
> "Combining CoT prompting and tools in an interleaved manner has shown to be a strong and robust approach to address many tasks with LLMs. These approaches typically require hand-crafting task-specific demonstrations and carefully scripted interleaving of model generations with tool use."
> "ART works as follows: given a new task, it selects demonstrations of multi-step reasoning and tool use from a task library; at test time, it pauses generation whenever external tools are called, and integrates their output before resuming generation"
> "ART encourages the model to generalize from demonstrations to decompose a new task and use tools in appropriate places, in a zero-shot fashion."

## Concepts Introduced or Referenced
- [[automatic-reasoning-and-tool-use]] — Library-based automatic CoT+tool demonstration selection with paused execution.
- [[tool-use]] / [[model-context-protocol]] — Execution substrate: function calling, code interpreter, search — tools whose outputs are interleaved.
- [[chain-of-thought]] — Reasoning backbone that ART interleaves with tools (ART ≈ CoT × tools, automated).
- [[prompt-chaining]] — ART is effectively automated chaining where LLM determines chain steps and tool placements rather than hard-coding.
- [[few-shot-prompting]] / [[in-context-learning]] — Retrieved library demos condition the frozen LLM per usual ICL mechanics.
- [[supervised-fine-tuning]] — Contrasted: ART needs no weight updates, only library curation.
- [[thinking-models]] — Shares test-time interleaving idea; trained reasoning models now learn similar tool-augmented deliberation.

## Critical Assessment
- **Strengths:** Crisply identifies the hand-crafting bottleneck in prior tool+CoT work and shows a clean library-retrieval solution with clear extensibility story; performance table provides concrete benchmarking on respected suites (BigBench/MMLU); conceptually bridges prompting and agent tool-use.
- **Weaknesses:** Guide chapter is the shortest (55 lines); omits details of retrieval scoring, tool inventory, or how pause/resume is implemented (formatting of tool calls). No discussion of tool-failure handling, latency from serial tool calls, or security of arbitrary tool execution. Does not compare to ReAct or function-calling baselines.
- **Contradictions:** None with [[tool-use]] or [[prompt-chaining]] — ART is presented as their automation, consistent. Should note that modern function-calling with `strict: true` schemas may subsume ART's program-like generation.
- **Gaps:** Needs links to [[tool-use]] taxonomy (hosted vs client-side), [[model-context-protocol]] for standardized tool discovery, and [[self-consistency]] / [[tree-of-thoughts]] for sampling over tool-augmented traces.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/art.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/art.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/art.en.mdx)
- Cited: Paranjape et al. 2023 https://arxiv.org/abs/2303.09014; BigBench & MMLU benchmarks

---

**Source:** Prompt Engineering Guide — Automatic Reasoning and Tool-use (ART) by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/art.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
