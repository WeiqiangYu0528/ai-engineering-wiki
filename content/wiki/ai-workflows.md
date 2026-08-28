---
type: concept
title: "AI Workflows"
summary: AI Workflows are agentic systems where LLMs and tools are orchestrated through predefined code paths with explicit control flow — the predictable counterpart to autonomous AI Agents — canonically codified by Anthropic…
visibility: public
aliases:
  - "Agentic Workflows"
  - "Prompt Chaining"
  - "Routing & Parallelization"
  - "Orchestrator-Workers"
tags:
  - agents
  - prompt-engineering
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-building-effective-agents]]"
  - "[[source-promptingguide-agents-ai-workflows-vs-ai-agents]]"
  - "[[source-promptingguide-agents-context-engineering]]"
  - "[[source-effective-context-engineering-for-ai-agents]]"
related:
  - "[[ai-agents]]"
  - "[[agent-components]]"
  - "[[deep-agents]]"
  - "[[context-engineering]]"
  - "[[tool-use]]"
  - "[[prompt-caching]]"
---

# AI Workflows

## Overview
**AI Workflows** are agentic systems where LLMs and tools are orchestrated through **predefined code paths** with explicit control flow — the predictable counterpart to autonomous [[ai-agents]] — canonically codified by [[anthropic]] in [[source-building-effective-agents]] (Dec 19, 2024). Born from the **augmented LLM** building block (LLM + retrieval/tools/memory via [[model-context-protocol]], tailoring interface per use case), workflows are the first rung beyond single LLM calls before escalating to full agents. They trade flexibility for reliability, making them preferred for well-defined, production-critical tasks and as scaffolding that routes to specialized agents.

## Key Ideas
- **Definition & characteristics:** Predefined steps, high predictability/control, well-defined boundaries, explicit orchestration logic. Decision-making is hard-coded, not LLM-driven. Workflows are *agentic systems* but not *agents* — the distinction Anthropic draws in [[source-building-effective-agents]]: workflows = predefined code paths, agents = LLM dynamically directs.
- **Five canonical patterns (Anthropic taxonomy + Dair Guide consolidation):**
  1. **Prompt chaining:** Sequential LLM calls where each output feeds the next with programmatic gates; e.g., marketing copy → translate, outline → criteria check → document (GPT-4.1-mini outline → grade/validation gate → If node → GPT-4o expand). Use: cleanly decomposable fixed subtasks, trading latency for accuracy.
  2. **Routing:** Classifier (LLM or traditional) directs input to specialized follow-up; e.g., customer service General/Refund/Technical or easy→Haiku 4.5 vs hard→Sonnet 4.5 for cost optimization. Use: distinct categories better handled separately where classification is accurate.
  3. **Parallelization:** Two variations — **Sectioning** (break into independent parallel subtasks: guardrails screening vs core response, eval per aspect) and **Voting** (same task multiple times: code vulnerability review with several prompts, inappropriate content with thresholds). Use: parallelizable for speed or diverse perspectives for confidence; better to handle each consideration separately for focus.
  4. **Orchestrator-workers:** Central LLM dynamically breaks down, delegates to worker LLMs, synthesizes results — vs parallelization, subtasks not pre-defined but input-determined (flexibility). Use: coding multi-file changes, multi-source search gathering.
  5. **Evaluator-optimizer:** Generator → evaluator feedback loop (literary translation nuance, complex search where evaluator decides further searches). Use: clear evaluation criteria where iterative refinement measurably helps and LLM can self-critique (human feedback would improve).
- **Building block prerequisite:** Augmented LLM (retrieval/tools/memory via [[model-context-protocol]]) is assumed for all patterns; tailoring capabilities and interface per use case is foundational.
- **When to use:** Clear/stable requirements, need explicit control, debuggability, cost management, production reliability. Hybrids combine both — workflows for structure, agents for flexible sub-tasks (e.g., workflow routes to deep research agent per request).
- **Framework caveat (Anthropic):** Frameworks (Claude Agent SDK, Strands, Rivet, Vellum) simplify bootstrapping but obscure prompts/responses and tempt over-engineering — prefer direct LLM APIs first (few lines + cookbook https://platform.claude.com/cookbook/patterns-agents-basic-workflows), understand underlying code if using.

## How It Works
```
Augmented LLM (LLM + retrieval/tools/memory via MCP) ──► Workflow patterns
  ├─[ Prompt Chaining ]──────► Step1 LLM → gate check → Step2 LLM → final
  ├─[ Routing ]──────────────► Classifier → Switch → Specialist Chain A/B/C (Haiku vs Sonnet)
  ├─[ Parallelization ]──────► Fork → LLM₁|LLM₂|LLM₃ → Join (Sectioning: guardrails vs core; Voting: multi-prompt code review)
  ├─[ Orchestrator-workers ]─► Central LLM → dynamic breakdown → Workers → Synthesize
  └─[ Evaluator-optimizer ]──► Generator → Evaluator feedback → loop until criteria met
         │
         ▼
   Agents (when not enough) → LLM dynamically directs own loop with ground-truth per step
```
- Built in n8n examples (GPT-4.1-mini/GPT-4o + If/Switch + Structured Output) or direct LLM API calls (Anthropic recommends few lines, not framework abstraction).
- Contrast with [[ai-agents]] task-planner: workflow’s sequence is code-defined; agent’s tool order is self-selected per context. Start simple, add complexity only when measured gain (Anthropic principle).

| Aspect | AI Workflows | AI Agents |
|--------|-------------|-----------|
| Control Flow | Predefined, explicit | Dynamic, autonomous |
| Decision Making | Hard-coded logic | LLM-driven reasoning |
| Tool Usage | Orchestrated by code | Self-selected |
| Adaptability | Fixed | Flexible |
| Complexity | Lower, predictable | Higher, capable |
| Use Cases | Well-defined tasks | Open-ended problems |

| Aspect | AI Workflows | AI Agents |
|--------|-------------|-----------|
| Control Flow | Predefined, explicit | Dynamic, autonomous |
| Decision Making | Hard-coded logic | LLM-driven reasoning |
| Tool Usage | Orchestrated by code | Self-selected |
| Adaptability | Fixed | Flexible |
| Complexity | Lower, predictable | Higher, capable |
| Use Cases | Well-defined tasks | Open-ended problems |

## Practical Implications
- **Best practices (workflows):** Clear step docs, error handling/fallback paths, validation gates between critical steps, per-step latency/success monitoring.
- **Choosing:** Favor workflows when task variability low and auditability matters; add agents only where adaptive reasoning justifies autonomy.
- **Cost/latency:** Routing saves by matching model strength to query class; parallelization cuts wall-clock time.

## Connections
- Complementary to [[ai-agents]] (autonomy pole) and [[deep-agents]] (orchestrator subsumes workflow patterns).
- Implemented via [[context-engineering]] (prompt chains are context orchestration) and [[tool-use]].
- Best-practice overlap with [[context-engineering]] observability and error-handling guidance.

## Open Questions
- How to auto-tune routing thresholds vs formal classifier evaluation?
- When does chaining latency outweigh quality gains vs single large-context call?

## Sources
- [[source-promptingguide-agents-ai-workflows-vs-ai-agents]]
- [[source-promptingguide-agents-context-engineering]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
