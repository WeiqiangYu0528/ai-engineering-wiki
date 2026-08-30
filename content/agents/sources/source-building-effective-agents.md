---
type: source-summary
title: "Building effective agents"
summary: "The December 19, 2024 Anthropic Engineering post (Erik S. & Barry Zhang) that synthesizes lessons from dozens of customer agent deployments into a practical hierarchy: augmented LLM → workflows (prompt chaining…"
status: draft
visibility: public
author: "Erik S. and Barry Zhang (Anthropic)"
source-type: article
url: "https://www.anthropic.com/engineering/building-effective-agents"
date-published: 2024-12-19
date-ingested: 2026-08-24
tags:
  - agents
  - llm-fundamentals
  - mlops
key-concepts:
  - "[[ai-agents]]"
  - "[[ai-workflows]]"
  - "[[tool-use]]"
  - "[[context-engineering]]"
key-entities:
  - "[[anthropic]]"
aliases:
  - wiki/source-building-effective-agents
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The December 19, 2024 Anthropic Engineering post (Erik S. &amp; Barry Zhang) that synthesizes lessons from dozens of customer agent deployments into a practical hierarchy: augmented LLM → workflows (prompt chaining…</p>
<p class="kb-provenance">Erik S. and Barry Zhang (Anthropic), 2024-12-19. <a href="https://www.anthropic.com/engineering/building-effective-agents">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
The **December 19, 2024 [[anthropic]] Engineering post** (Erik S. & Barry Zhang) that synthesizes lessons from dozens of customer agent deployments into a practical hierarchy: **augmented LLM → workflows (prompt chaining, routing, parallelization [sectioning/voting], orchestrator-workers, evaluator-optimizer) → autonomous agents**. It draws the core distinction **workflows** (LLMs/tools orchestrated via predefined code paths, predictable) vs **agents** (LLMs dynamically direct own processes/tool usage, flexible), advises **start with simplest solution, add complexity only when measured gain**, and warns that frameworks (Claude Agent SDK, Strands, Rivet, Vellum) simplify bootstrapping but obscure prompts and tempt over-engineering — prefer direct LLM APIs first. Details the **augmented LLM** building block (retrieval/tools/memory via MCP, tailoring interface per use case), **when to use each workflow** (chaining for decomposable fixed subtasks, routing for distinct categories, parallelization for speed/diversity, orchestrator-workers when subtasks unpredictable, evaluator-optimizer when refinement measurably helps + LLMs can self-critique), and **agents** for open-ended, unpredictable-step problems where **ground truth from environment** each step (tool/code execution) and **stopping conditions/human-in-the-loop checkpoints** are essential. Concludes with **three core principles** (simplicity, transparency via explicit planning steps, ACI via thorough tool documentation/testing) and two appendices: **Agents in practice** (customer support with tool-integrated chatbot + usage-based pricing, coding agents verifiable via SWE-bench tests) and **Prompt engineering your tools** (ACI as HCI: give model tokens to think before corner, keep format close to internet-natural, avoid overhead like diff line counts or JSON escaping, example-driven + poka-yoke, workbench testing, absolute filepaths fix for SWE-bench).

## Key Takeaways
1. **Agentic Systems Taxonomy:** All LLM+tool systems are *agentic systems*, but split into **Workflows** (predefined code paths) vs **Agents** (LLM dynamically directs). Workflows → predictability/consistency for well-defined tasks; Agents → flexibility/model-driven decisions at scale; single LLM calls with retrieval/in-context examples often suffice — don't default to agents.
2. **Building Block — Augmented LLM:** Retrieval, tools, memory enhanced LLM that can generate own search queries, select tools, retain info. Implementation via [[model-context-protocol]] singled out as easy, documented interface for tailoring augmentations per use case; all subsequent patterns assume this block.
3. **Five Workflow Patterns:**
   - **Prompt chaining:** sequence with gates → ideal for cleanly decomposable fixed subtasks (marketing copy → translate; outline → check criteria → document), latency for accuracy.
   - **Routing:** classify → specialized follow-up → separation of concerns; e.g., customer service (general/refund/tech) or easy→Haiku 4.5 vs hard→Sonnet 4.5 routing for cost/performance.
   - **Parallelization:** Sectioning (independent subtasks parallel e.g., guardrails screening vs core response, eval per aspect) vs Voting (same task multiple times e.g., code vulnerability review with multiple prompts, inappropriate content with thresholds) — for speed or diverse perspectives, each consideration separate call.
   - **Orchestrator-workers:** central LLM dynamically breaks down, delegates to workers, synthesizes — vs parallelization, subtasks not pre-defined but input-determined; e.g., coding multi-file changes, multi-source search gathering.
   - **Evaluator-optimizer:** generate → evaluate/feedback loop (literary translation nuance, complex search needing evaluator to decide further searches) — fit when human feedback would improve and LLM can self-critique.
4. **Agents — When & How:** Use for open-ended problems where steps unpredictable and fixed path can't be hardcoded; LLM operates many turns, needs trust, ground truth each step, human feedback checkpoints, max-iterations guard. Implementation is often *straightforward*: LLM using tools in loop — so **tool design/docs are critical**. Examples: SWE-bench coding agent (many file edits), computer-use (Claude operates computer), with high-level flow diagram.
5. **Framework Advice:** Claude Agent SDK, Strands, Rivet, Vellum ease low-level tasks but create abstraction layers obscuring prompts/responses and tempting complexity. Recommendation: start with LLM APIs directly (patterns in few lines + cookbook https://platform.claude.com/cookbook/patterns-agents-basic-workflows), understand underlying code if using framework.
6. **Three Principles for Agents:** 1) Maintain simplicity, 2) Prioritize transparency via explicit planning steps, 3) Carefully craft **agent-computer interface (ACI)** via thorough tool documentation/testing — note ACI effort should equal HCI effort.
7. **ACI Deep-Dive (Appendix 2):** Tool format matters more than prompt: diff vs full file rewrite, markdown vs JSON code (escaping/line counts) are cosmetic for SE but hard for LLM. Principles: give tokens to think, keep format internet-natural, avoid overhead. Test via workbench, change param names/descriptions like great docstrings, poka-yoke args. Real case: relative filepaths failed after `cd` — changed to absolute → flawless.

## Detailed Notes

### Intro & When to Use (Sections)
- Simple composable patterns beat complex frameworks across dozens of teams.
- Find simplest solution, trade latency/cost for task performance when warranted; single LLM calls often enough.

### Building Blocks (Section)
- Diagram: augmented LLM with retrieval/tools/memory.

### Workflows (5 subsections with diagrams, when-to-use, examples each)
- Detailed as above with gate, classification, sectioning/voting, dynamic delegation, feedback loop.

### Agents (Section)
- Maturity: understanding complex inputs, reasoning/planning, reliable tool use, error recovery.
- Operation: human command → autonomous plan → environment ground truth each step → human feedback checkpoints → completion or max iterations.
- Toolset clarity expanded in Appendix 2.

### Summary & Acknowledgements
- Right system not most sophisticated; start simple → optimize via evaluation → add agentic only when simpler falls short.

### Appendix 1: Agents in Practice
- Customer support: chatbot + tools (customer data, knowledge base, refunds), conversation flow, measurable resolutions, usage-based pricing.
- Coding agents: verifiable via automated tests, iterative via test feedback, well-defined structured problem, objective quality measurement — SWE-bench Verified via PR description, but human review remains crucial.

### Appendix 2: Prompt engineering your tools (ACI)
- Tool = exact structure/definition; include example usage, edge cases, boundaries.
- SWE-bench optimization: tools > prompt time, forcing absolute filepaths, etc.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 5 of 8 passages in this section could not be located in the stored source ([https://www.anthropic.com/engineering/building-effective-agents](https://www.anthropic.com/engineering/building-effective-agents)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Consistently, the most successful implementations use simple, composable patterns rather than complex frameworks."

> "We categorize all these variations as agentic systems, but draw an important architectural distinction between workflows and agents: Workflows are systems where LLMs and tools are orchestrated through predefined code paths. Agents are systems where LLMs dynamically direct their own processes and tool usage."

> "When building applications with LLMs, we recommend finding the simplest solution possible, and only increasing complexity when needed."

> "These frameworks make it easy to get started by simplifying standard low-level tasks like calling LLMs, defining and parsing tools, and chaining calls together. However, they often create extra layers of abstraction that can obscure the underlying prompts and responses, making them harder to debug."

> "Agents begin their work with either a command from, or interactive discussion with, the human user. Once the task is clear, agents plan and operate independently, potentially returning to the human for further information or judgement."

> "During execution, it's crucial for the agents to gain 'ground truth' from the environment at each step (such as tool call results or code execution) to assess its progress."

> "Frameworks can help you get started quickly, but don't hesitate to reduce abstraction layers and build with basic components as you move to production."

> "One rule of thumb is to think about how much effort goes into human-computer interfaces (HCI), and plan to invest just as much effort in creating good agent-computer interfaces (ACI)."

## Concepts Introduced or Referenced
- [[ai-agents]] — Autonomous agents defined vs workflows; when to use, ground-truth loop, stopping conditions, human-in-the-loop, coding/computer-use examples.
- [[ai-workflows]] — Five workflows: prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer — with diagrams, when-to-use, examples, and composability.
- [[tool-use]] — Augmented LLM block, MCP as augmentation, ACI prompt engineering, poka-yoke tool design, thinking tokens before corner.
- [[context-engineering]] — Implicitly: system prompts, tool definitions, message history as context to be curated (links to ACI and transparency).
- [[model-context-protocol]] — Singled out as recommended augmentation interface for tool integration.

## Critical Assessment
- **Strengths:** First concise **Anthropic-authored operational taxonomy** for agentic systems, grounding abstract "agent" hype in concrete, composable workflow primitives with visual diagrams, when-to-use heuristics, and candid framework caveats (direct API > abstraction). The ACI appendix (prompt engineering your tools) is unusually actionable — file-format and line-count overhead analysis, absolute-filepath fix, workbench testing, poka-yoke — rarely found elsewhere. Appendices ground claims in real customer domains (support, coding) with verifiable success criteria.
- **Limitations:** Tooling landscape note admits December 2024 date is partially obsolete (Managed Agents now preferred); framework section lists SDKs without version pinning; workflow examples are largely synthetic/illustrative without quantitative ablation (e.g., no numbers for chaining vs single call); evaluation harness for choosing workflow vs agent is advised but not provided beyond "comprehensive evaluation."
- **Wiki Integration:** Directly completes [[ai-agents]]/[[ai-workflows]] missing operational detail — prior wiki had Anthropic's context-engineering triad (compaction/memory/sub-agents) but not the workflow taxonomy; this should be merged as the canonical Anthropic workflow definitions. No contradictions; complements [[source-effective-context-engineering-for-ai-agents]] (context scarcity) and [[source-context-engineering-for-agents-langchain]] (write/select/compress/isolate) by adding the *workflow* layer.

---

**Source:** Building effective agents by Erik S. and Barry Zhang (Anthropic) — <https://www.anthropic.com/engineering/building-effective-agents>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
