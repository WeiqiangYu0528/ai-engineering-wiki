---
type: source-summary
title: "Effective Context Engineering for AI Agents"
summary: The September 29, 2025 Anthropic Engineering blog (Applied AI team) that establishes context engineering as the successor discipline to Prompt Engineering for building steerable, long-horizon AI Agents.
status: draft
visibility: public
author: "Prithvi Rajasekaran, Ethan Dixon, Carly Ryan, Jeremy Hadfield (Anthropic Applied AI) — with Rafi Ayub, Hannah Moran, Cal Rueb, Connor Jennings"
source-type: article
url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"
date-published: 2025-09-29
date-ingested: 2026-08-24
tags:
  - agents
  - llm-fundamentals
  - rag
  - inference
key-concepts:
  - "[[context-engineering]]"
  - "[[ai-agents]]"
  - "[[context-caching]]"
  - "[[inference]]"
  - "[[model-context-protocol]]"
key-entities:
  - "[[anthropic]]"
  - "[[claude-code]]"
aliases:
  - wiki/source-effective-context-engineering-for-ai-agents
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The September 29, 2025 Anthropic Engineering blog (Applied AI team) that establishes context engineering as the successor discipline to Prompt Engineering for building steerable, long-horizon AI Agents.</p>
<p class="kb-provenance">Prithvi Rajasekaran, Ethan Dixon, Carly Ryan, Jeremy Hadfield (Anthropic Applied AI) — with Rafi Ayub, Hannah Moran, Cal Rueb, Connor Jennings, 2025-09-29. <a href="https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary
The **September 29, 2025 [[anthropic]] Engineering blog** (Applied AI team) that establishes **context engineering** as the successor discipline to [[prompt-engineering]] for building steerable, long-horizon [[ai-agents]]. Defining **context as the set of tokens sampled from** and **engineering as optimizing utility against diminishing marginal returns**, the post introduces the mental model of **finite attention budget** and **context rot** (needle-in-a-haystack degradation as $n$ grows → $n^2$ pairwise attention strain and training distribution bias toward shorter sequences). It prescribes the guiding principle — **find the smallest set of high-signal tokens maximizing desired outcome** — then details the **anatomy of effective context** (system prompts at *right altitude*, minimal viable tool sets, canonical few-shot examples), **just-in-time (JIT) agentic retrieval** via lightweight identifiers (file paths, queries) vs pre-retrieval, **progressive disclosure** through metadata (naming, hierarchy, timestamps), and the **long-horizon triad**: **compaction** (high-fidelity summarization + tool-result clearing), **structured note-taking / agentic memory** (file-based NOTES.md, Claude Pokémon 1,234-step example, Sonnet 4.5 memory tool), and **sub-agent architectures** (main agent + specialists returning 1–2k summaries from 10k+ token explorations). All are illustrated via **[[claude-code]]** and the hybrid CLAUDE.md + glob/grep pattern.

## Key Takeaways
1. **Context > Prompt — Thinking in Context:** Prompt engineering (writing/organizing instructions, system prompts) handled one-shot classification/generation. For multi-turn, tool-loop agents (definition: *LLMs autonomously using tools in a loop* — Willison 2025), the *holistic* state that lands in the window each turn (system, tools/MCP, external data, message history) must be iteratively curated. Context engineering is *thinking in context*: what state will most likely yield desired behavior?
2. **Context is Finite — Attention Budget & Context Rot:** LLM attention is $n^2$ (every token attends to every other) and stretched thin as length grows; models also see shorter sequences more in training → specialized parameters scarce for long dependencies. TryChroma's **context rot** benchmarks show monotonic recall degradation; position-encoding interpolation helps but introduces degradation rather than cliff — a gradient. So treat context as finite with diminishing returns, akin to human working memory (Cowan 2010).
3. **Anatomy — Smallest High-Signal Set:** 
   - **System prompts:** *Right altitude* Goldilocks — between brittle if-else hardcoding and vague high-level guidance assuming shared context. Use distinct sections (`<background_information>`, `<instructions>`, `## Tool guidance`) with XML/Markdown (formatting less important as models improve), start minimal with best model, add clarifying examples per failure mode.
   - **Tools:** Contract with action space — must be self-contained, robust, clear, minimal overlap; descriptive params playing to model strengths. Anti-pattern: bloated sets where even human can't say which tool to use. Token efficiency matters: every tool definition token is billed.
   - **Examples:** Canonical diverse few-shots beat laundry-list edge cases — "pictures worth a thousand words."
4. **JIT vs Pre-Retrieval — Progressive Disclosure:** Traditional embedding pre-retrieval surfaces context up front; **JIT** maintains lightweight refs and loads via tools at runtime (Claude Code writes targeted queries, uses `head`/`tail` without loading full objects — like human file systems/bookmarks). Metadata provides cheap signals (file `test_utils.py` in `tests/` vs `src/core_logic/`, folder hierarchy, timestamps). Agents discover layer-by-layer, keeping working memory small + notes. Hybrid suits less-dynamic domains (legal/finance): **CLAUDE.md naively in context + glob/grep JIT** bypasses stale indexing/syntax trees. Advice: *do the simplest thing that works*; autonomy boundary depends on task and model smarts.
5. **Long-Horizon Triad (Context Window > Task Tokens):** For tasks spanning tens of minutes to hours ( migrations, research), larger windows alone won't solve pollution/relevance:
   - **Compaction:** Near limit, summarize-and-reinit with high-fidelity compression (preserve decisions/bugs/details, discard redundant outputs) + **5 most recent files** (Claude Code pattern). Recommendation: tune on complex traces for max recall then precision; lightest form is **tool-result clearing** (now Claude Developer Platform feature).
   - **Structured note-taking / Agentic Memory:** File-based notes outside window (to-do list, NOTES.md, memory tool in Sonnet 4.5 beta) persisted and re-read after resets. Pokemon example: 1,234 steps, 8 levels → maps/strategies maintained across thousands of steps and dungeon resets.
   - **Sub-Agent Architectures:** Specialists with clean windows explore extensively (10k+ tokens) and return 1–2k condensed summaries. Separation of concerns isolates search context; lead synthesizes (see https://www.anthropic.com/engineering/multi-agent-research-system — substantial improvement on research). Choice: compaction (conversational flow), note-taking (milestones), multi-agent (parallel research).
6. **Claude Code as Reference Implementation:** Hybrid context (CLAUDE.md upfront + tools), memory tool, sub-agent research system, and context-management feature exemplify all principles.

## Detailed Notes

### Context Engineering vs Prompt Engineering (Section)
- Prompt engineering = discrete prompt-writing for optimal outcomes (see Anthropic docs `prompt-engineering/overview`); Context engineering = curating *optimal token set during inference* from evolving universe of possible info. Figure: discrete task vs iterative curation each pass to model.
- When prompt engineering dominated: one-shot tasks. When context dominates now: multi-turn agents where message history compounds.

### Why Important (Section)
- Needle-in-a-haystack / context rot citation; human working memory analogy; $n^2$ scalability; training data bias; interpolation mitigations.

### Anatomy (Section)
- Right altitude figure (brittle if-else vs vague); XML/Markdown sectioning; minimal yet sufficient; start with best model; add examples per failure mode; tools as well-designed codebase functions; tool examples vs laundry lists.

### Retrieval & Agentic Search (Section)
- Definition convergence: agents = LLMs using tools in loop; field converging post Building Effective Agents.
- JIT: file paths/queries/links → tools at runtime; Claude Code DB analysis example; metadata signals; progressive disclosure loop; hybrid CLAUDE.md + grep/glob; domain advice.

### Long-Horizon (Section)
- Waiting for larger windows won't help — all windows face pollution concerns at least where strongest performance desired. Forerunning paper: compaction, note-taking, multi-agent.
- Compaction details: Claude Code summarization, 5 recent files, recall→precision tuning, clearing tool calls.
- Note-taking details: NOTES.md, Pokemon, Sonnet 4.5 memory tool, Cookbook https://platform.claude.com/cookbook/tool-use-memory-cookbook
- Sub-agents: 1–2k summary from 10k+ exploration, orchestrator/worker, model selection (Gemini 2.5 Pro vs Flash), improvement claim.

### Conclusion & Acknowledgements
- Guiding principle repeated: smallest high-signal set.
- Written by Applied AI team with contributions and thanks.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 7 of 10 passages in this section could not be located in the stored source ([https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Context engineering is the natural progression of prompt engineering."

> "Building with language models is becoming less about finding the right words and phrases for your prompts, and more about answering the broader question of 'what configuration of context is most likely to generate our model's desired behavior?'"

> "Effectively wrangling LLMs often requires *thinking in context* — considering the holistic state available to the LLM at any given time and what potential behaviors that state might yield."

> "Context, therefore, must be treated as a finite resource with diminishing marginal returns."

> "We have an 'attention budget' that they draw on when parsing large volumes of context. Every new token introduced depletes this budget."

> "Good context engineering means finding the *smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome.*"

> "The right altitude is the Goldilocks zone between [...] hardcoding complex, brittle logic [...] and [...] vague, high-level guidance."

> "Agents built with the 'just in time' approach maintain lightweight identifiers and use these references to dynamically load data into context at runtime using tools."

> "This self-managed context window keeps the agent focused on relevant subsets rather than drowning in exhaustive but potentially irrelevant information."

> "Context engineering is the art and science of curating what will go into the limited context window from that constantly evolving universe of possible information." — Karpathy

## Concepts Introduced or Referenced
- [[context-engineering]] — Central definition: attention budget, right altitude, layered architecture, JIT vs hybrid, long-horizon triad (compaction, memory, sub-agents) — the post's thesis.
- [[ai-agents]] — Definition (LLMs autonomously using tools in a loop), evolution from workflows, agentic search and tool-loop autonomy scaling with model capability.
- [[context-caching]] — Relation: pre-retrieval vs JIT; CLAUDE.md upfront is naive caching; contrasted with Gemini/Anthropic caching primitives.
- [[inference]] — Underlying $n^2$ scalability, KV-cache, prefix caching for compaction; attention budget as serving constraint.
- [[model-context-protocol]] — Mentioned as part of context state alongside tools.
- [[claude-code]] — Reference agent implementing hybrid JIT, compaction (5 files + history summary), memory tool, sub-agent research system, Pokémon demo.

## Critical Assessment
- **Strengths:** First definitive **Anthropic-authored** context-engineering mental model consolidating scattered prior posts (Writing Tools for Agents, Building Effective Agents, Multi-Agent Research System) into a single lifecycle view. Introduces crisp concepts — *attention budget, context rot, right altitude, smallest high-signal set, progressive disclosure* — with concrete Claude Code and Pokémon illustrations and actionable product hooks (memory tool, context-management feature, Cookbook). Grounds claims in architecture ($n^2$) and cognitive science (working memory) rather than pure heuristics. Explicitly addresses the prompting→context handover and hybrid pragmatic advice ("simplest thing that works").
- **Limitations:** No quantitative benchmarks for compaction vs note-taking vs sub-agent trade-offs (claims "substantial improvement" but cites internal research system without numbers); context-rot citation is to TryChroma blog, not peer-reviewed; tool-design best practices duplicate https://www.anthropic.com/engineering/writing-tools-for-agents without new taxonomy; product tie-ins (Sonnet 4.5 memory tool, Developer Platform) may date quickly. Compared to PromptingGuide's systematic prompt-chain formalism, this piece is more philosophical/principled than recipe-driven.
- **Contradictions:** Complements rather than contradicts existing wiki. Prior [[context-engineering]] (Dair Guide-derived) emphasized failure-driven iteration, layered System/Task/Tool/Memory and date injection; Anthropic refines with *attention-budget* scarcity, *right altitude*, *JIT* progressive disclosure, and *compaction/memory/sub-agent triad* as long-horizon solutions — both should be merged, with Anthropic's model providing the overarching scarcity principle and Claude Code as canonical example.

---

**Source:** Effective Context Engineering for AI Agents by Prithvi Rajasekaran, Ethan Dixon, Carly Ryan, Jeremy Hadfield (Anthropic Applied AI) — with Rafi Ayub, Hannah Moran, Cal Rueb, Connor Jennings — <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
