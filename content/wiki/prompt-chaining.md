---
type: concept
title: "Prompt Chaining"
summary: Prompt Chaining decomposes a complex task into subtasks executed as a sequence of LLM prompts where each prompt's output is transformed and fed as input to the next, improving reliability, transparency, controllability…
visibility: public
aliases:
  - "Chaining"
  - "Sequential Prompting"
  - "LLM Chaining"
tags:
  - prompt-engineering
  - agents
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-promptingguide-techniques-prompt-chaining]]"
  - "[[source-promptingguide-techniques-rag]]"
  - "[[source-promptingguide-techniques-knowledge]]"
related:
  - "[[automatic-reasoning-and-tool-use]]"
  - "[[retrieval-augmented-generation]]"
  - "[[chain-of-thought]]"
  - "[[tool-use]]"
  - "[[tree-of-thoughts]]"
---

# Prompt Chaining

## Overview
**Prompt Chaining** decomposes a complex task into **subtasks** executed as a **sequence of LLM prompts** where each prompt's output is transformed and fed as input to the next, improving reliability, transparency, controllability, and debuggability over a monolithic prompt. The DAIR Guide's canonical Document QA trace on the Wikipedia prompt-engineering article using `gpt-4-1106-preview` chains: **Prompt 1** extracts relevant quotes into `<quotes>` tags (delimited `####{{document}}####`, emits `No relevant quotes found!` fallback) → **Prompt 2** synthesizes quotes + document into a friendly accurate answer enumerating 12 techniques (CoT through prompt injection).

## Key Ideas
- **Pattern: split → prompt → transform → prompt:** Identify subtasks, prompt LLM per subtask, and apply lightweight transforms (filtering, delimiter insertion, citation stripping) before the next call; final output emerges from the chain rather than a single long prompt.
- **Extract-then-synthesize Document QA:** Handles large documents exceeding single-pass fidelity:
  - Prompt 1 template: `You are a helpful assistant… extract quotes relevant to question from document, delimited by ####. Output <quotes></quotes>. Respond "No relevant quotes found!" if none. ####{{document}}####` (+ question in user role; screenshot `prompt-chaining-1.png`)
  - Output 1: 12 technique bullets with citations `[27]…[67]` (CoT, generated knowledge, least-to-most, self-consistency, complexity-based, self-refine, tree-of-thought, maieutic, directional-stimulus, textual inversion, gradient search, prompt injection).
  - Prompt 2 template: `Given quotes (<quotes>) and original document (####), compose an answer … accurate, friendly, helpful tone.`
  - Output 2: numbered 1–12 list with friendly framing sentence.
- **Operational benefits beyond accuracy:** Per-stage outputs are inspectable (transparency), independently improvable, and permit targeted retry without rerunning the whole pipeline.
- **Reference lineage:** Adapted from Anthropic Claude docs https://docs.anthropic.com/claude/docs/prompt-chaining; exercise: add a citation-stripping step (`[27]`) as a third chain link.

## How It Works
```
Task: "What prompting techniques are mentioned in this long document?"
  │
  ├─ Prompt 1 (extraction): {{document}} → <quotes>12 techniques</quotes>
  │        ↓ (optional transform: dedupe citations, filter)
  └─ Prompt 2 (synthesis): {{document}} + <quotes> → final answer
           ↓ (optional Prompt 3: citation cleanup)
      Final user-facing response
```
1. Choose delimiters per [[prompt-design-tips]] (`####` for doc, `<quotes>` for structured output) to avoid confusion between instruction and data.
2. Run Prompt 1; parse `<quotes>`; validate non-empty or branch on fallback.
3. Compose Prompt 2 with both original document and extracted quotes as Context (per [[prompt-elements]]).
4. Optionally chain further transforms (e.g., citation removal) — chain length scales with task complexity.

## Practical Implications
- **Primary pattern for agentic workflows:** Conversational assistants, personalization, and RAG all reduce to chains where some steps are retrieval or [[tool-use]] tool calls (see [[automatic-reasoning-and-tool-use]] which automates chain construction).
- **Cost duplication:** `{{document}}` appears in both prompts → 2× input tokens; long-context models (`gpt-4-1106-preview`, Claude) required — monitor [[inference]] cost/latency and KV-cache pressure; consider summarization or vector retrieval to shrink context.
- **Error propagation:** Extraction miss → synthesis hallucination; add verification loops, `No relevant quotes found!` guard, and per-step evals.
- **Alternatives when retrieval suffices:** For very large corpora, vector retrieval + single synthesis ([[retrieval-augmented-generation]]) is more efficient than LLM-based extraction; chaining is best when subtasks require distinct reasoning styles or tone shifts.
- **Formatting contract:** XML-like tags (`<quotes>`) provide robust parsing vs fragile natural language.

## Connections
- Generalizes [[chain-of-thought]]'s single-prompt reasoning into **multi-call** decomposition; each chain link may itself use CoT internally.
- Automatable via [[automatic-reasoning-and-tool-use]] (ART) which retrieves library demos to let the frozen LLM decide decomposition and tool placements zero-shot.
- Subsumes [[retrieval-augmented-generation]] when first link is retrieval (LLM extraction or vector search) and second is grounded generation; overlaps [[generated-knowledge-prompting]] which is itself a 2-link chain.
- Often interleaves [[tool-use]] / [[model-context-protocol]] tools between links; search strategy variants lead toward [[tree-of-thoughts]] branching over chains.
- Relies on [[prompt-elements]] delimiting and [[prompt-design-tips]] separator guidance; realized as an inference pattern during [[inference]].

## Open Questions
- How to optimally decide chain granularity (few long prompts vs many short) for latency/quality frontier?
- Can chains be dynamically re-planned at runtime (like ReAct) vs statically authored?
- What failure-recovery patterns (retry with different strategy, human-in-the-loop) most improve chain robustness?

## Sources
- [[source-promptingguide-techniques-prompt-chaining]]
- [[source-promptingguide-techniques-rag]]
- [[source-promptingguide-techniques-knowledge]]
- Anthropic Prompt Chaining https://docs.anthropic.com/claude/docs/prompt-chaining

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
