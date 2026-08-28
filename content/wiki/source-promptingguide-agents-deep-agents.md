---
type: source-summary
title: "Deep Agents — Prompt Engineering Guide (DAIR.AI)"
summary: Manifesto-style overview of the emerging “Deep Agents” era replacing shallow single-context agents for long, multi-step problems (deep research, agentic coding).
status: verified
visibility: public
author: "Elvis Saravia / DAIR.AI"
source-type: article
url: "https://www.promptingguide.ai/agents/deep-agents"
date-published: 2025-07-10
date-ingested: 2026-08-24
tags:
  - agents
  - prompt-engineering
  - rag
key-concepts:
  - "[[deep-agents]]"
  - "[[ai-agents]]"
  - "[[context-engineering]]"
  - "[[ai-workflows]]"
key-entities:
  - "[[anthropic]]"
  - "[[claude-code]]"
verified-by: agent
verified-on: 2026-08-27
---

# Deep Agents — Prompt Engineering Guide (DAIR.AI)

## Summary
Manifesto-style overview of the emerging “Deep Agents” era replacing shallow single-context agents for long, multi-step problems (deep research, agentic coding). Synthesizes DAIR Academy, LangChain Labs, Claude Code Agent SDK, and Philipp Schmid’s Agents 2.0 to define five pillars: strategic planning, orchestrator & sub-agent architecture, context retrieval/agentic search, rigorous context engineering, and verification (LLM-as-a-Judge/human). Illustrated via a DAIR Academy customer-support deep agent (RAG system for course Q&A).

## Key Takeaways
1. **Shallow agents break:** Single-context agents fail on long-horizon tasks; Deep Agents plan, remember, and delegate intelligently.
2. **Planning:** Maintain structured, updatable task plans (“living to-do list”) rather than ad-hoc reasoning; enables retry/recovery — demonstrated via Claude Code/Codex planning mode and brainstorming workflows.
3. **Orchestrator & sub-agents:** One big context is insufficient; orchestrator delegates to specialized clean-context sub-agents (search, coder, KB retriever, analyst, verifier, writer), integrating outputs — more reliable than monolithic multi-agent skepticism.
4. **Persistent context retrieval:** External memory (files, notes, vectors, DBs) beyond conversation history; hybrid memory (agentic search + semantic search) letting agent choose strategy — refs ReasoningBank and Agentic Context Engineering papers.
5. **Verification as pillar:** Verify outputs via automated LLM-as-a-Judge or human to combat hallucination, sycophancy, and prompt injection; systematic eval pipelines make agents production-ready.

## Detailed Notes
- **Context:** “Most agents today are shallow. … That’s changing fast!” — positions Deep Agents as current inflection.
- **Planning section:** Image `cs-planning.png`; structured plans enable long-horizon scientific discovery; notes human-in-the-loop advantage.
- **Orchestrator architecture:** Image `cs-subagents.png`; lists sub-agent types; argues against Cognition’s “Don’t Build Multi-Agents” in favor of orchestrator pattern; notes sub-agents enable efficient context separation (parallels [[claude-code]] subagents).
- **Context retrieval:** Image `cs-persistent-storage.png`; storage beyond history prevents context overload; highlights structured memory quality; cites arXiv: ReasoningBank (2509.25140) and Agentic Context Engineering (2510.04618); hybrid memory techniques.
- **Context engineering:** Warns “worst thing… underspecified instructions”; reframes prompt → context engineering — explicit when to plan, use sub-agent, name files, collaborate, plus structured outputs, compacting, eval, and tool definition optimization (Anthropic writing-tools-for-agents).
- **Verification:** Image `cs-verification-agent.png`; verification often overlooked vs context engineering; mitigates generation flaws despite powerful LLMs; automated vs human; systematic evaluation.
- **Final words:** Deep agents as building block for personalized proactive agents; teases future post.
- **Figures:** All describe agentic RAG customer-support system for Academy final project.

## Notable Quotes
> "We’re entering the era of 'Deep Agents', systems that strategically plan, remember, and delegate intelligently for solving very complex problems."

> "One big agent (typically with a very long context) is no longer enough."

> "High-quality structured memory is a thing of beauty."

> "The worst things you can do when interacting with these types of agents is underspecified instructions/prompts."

## Concepts Introduced or Referenced
- [[deep-agents]] — central new paradigm (this page)
- [[ai-agents]] — shallow vs deep contrast
- [[context-engineering]] — explicit, detailed, intentional instructions
- [[ai-workflows]] — orchestrator/worker vs monolithic
- [[tool-use]] / [[model-context-protocol]] — sub-agent tooling
- [[hallucination]] / [[prompt-injection]] — verification targets
- [[claude-code]] — reference implementation

## Critical Assessment
**Strengths:** Timely synthesis of industry consensus (LangChain, Anthropic, Schmid); memorable five-pillar framework; strong opinion with citations and course link.
**Weaknesses:** Brief (77 lines), image-dependent without inline data; some claims (e.g., hybrid memory superiority) cite preprints without empirical comparison.
**Contradictions:** None with existing wiki; aligns with [[source-promptingguide-agents-context-engineering-deep-dive]] multi-agent fix and [[claude-code]] subagent pattern. Challenges “monolithic is enough” view explicitly.

## Sources
- Raw: [https://www.promptingguide.ai/agents/deep-agents](https://www.promptingguide.ai/agents/deep-agents)

---

**Source:** Deep Agents — Prompt Engineering Guide (DAIR.AI) by Elvis Saravia / DAIR.AI — <https://www.promptingguide.ai/agents/deep-agents>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
