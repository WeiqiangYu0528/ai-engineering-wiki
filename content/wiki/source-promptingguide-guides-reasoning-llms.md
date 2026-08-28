---
type: source-summary
title: "Reasoning LLMs Guide — Prompt Engineering Guide (DAIR.AI) Guides"
summary: Comprehensive guide to large reasoning models (LRMs) — Gemini 2.5 Pro, Claude 3.7 Sonnet, o3, DeepSeek-R1 — covering definition (native chain-of-thought training), benchmark tracking (Chatbot Arena, General Reasoning…
status: draft
visibility: public
author: "Elvis Saravia / DAIR.AI"
source-type: article
url: "https://www.promptingguide.ai/guides/reasoning-llms"
date-published: 2025-05-15
date-ingested: 2026-08-24
tags:
  - agents
  - prompt-engineering
  - inference
key-concepts:
  - "[[reasoning-llms]]"
  - "[[thinking-models]]"
  - "[[deep-agents]]"
  - "[[context-engineering]]"
key-entities:
  - "[[openai]]"
  - "[[anthropic]]"
  - "[[google-research]]"
---

# Reasoning LLMs Guide — Prompt Engineering Guide (DAIR.AI) Guides

## Summary
Comprehensive guide to large reasoning models (LRMs) — Gemini 2.5 Pro, Claude 3.7 Sonnet, o3, DeepSeek-R1 — covering definition (native chain-of-thought training), benchmark tracking (Chatbot Arena, General Reasoning, Agent Leaderboard), design patterns (planning for agentic systems, agentic RAG, LLM-as-a-Judge, visual reasoning), usage/prompting tips (strategic reasoning, inference-time scaling, explicit instructions, avoid manual CoT, hybrid reasoning), and limitations (output quality, instruction-following degradation, over/underthinking, cost/latency, tool calling weakness).

## Key Takeaways
1. **Definition:** Reasoning LLMs (LRMs) explicitly trained for native thinking/CoT; example prompt provided to test o3/Gemini 2.5 Pro on sum of first 50 primes via code generation.
2. **Design patterns:**
   - *Planning for agentic systems:* reasoning model plans searches before orchestration (orchestrator-worker image)
   - *Agentic RAG:* retrieval agent with reasoning chain/tool for complex KB routing
   - *LLM-as-a-Judge:* evaluator-optimizer loop with reasoning evaluator giving feedback to meta-prompt
   - *Visual reasoning:* o3 multi-tool image reasoning (zoom/crop/rotate) + crossword demo
3. **Usage tips:** Use strategically for reasoning-heavy modules (separation of concerns); scale thinking time low→medium→high; be explicit but avoid manual CoT; structure I/O with delimiters/JSON/XML (prefer XML unless JSON required; Claude 4 output mirrors prompt structure); use few-shot when style matters; hybrid models: start non-thinking, enable low/medium/high progressively.
4. **Limitations:** Mixed-language/repeated/formatting issues; CoT can hurt instruction-following (arXiv:2505.11423 — mitigations: few-shot, self-reflection, self-selective/classifier-selective reasoning); over/underthinking if vague; high cost/latency (optimize accuracy first); poor parallel/multi-tool calling (esp. DeepSeek-R1/Qwen, improved o3).

## Detailed Notes
- **Structure:** Full ToC with anchors; embedded YouTube `AZhUhGsgz4s`; linked n8n agentic RAG template + demo video.
- **Top models section:** Links to WIP spreadsheet tracking features/strengths; benchmark sources listed.
- **General Usage Patterns (8 bullets):**
  - Strategic Reasoning: modularize app, apply reasoning only where needed.
  - Inference-time scaling: more thinking → better performance.
  - Thinking time options documented.
  - Be explicit (high-level constraints/output), avoid step-by-step CoT.
  - Structure inputs/outputs with examples; note Claude 4 markdown sensitivity.
  - Descriptive modifiers: “Add thoughtful details like hover states…” for code/gen.
  - Few-shot for style/format alignment.
- **Hybrid Reasoning:** 5-step ladder: standard → enable thinking low → medium → high → few-shot; image `hybrid_reasoning_models.JPG`; coding demo link.
- **Limitations (6 categories):**
  - Output quality: mitigation via clear instructions, avoid ambiguity.
  - Reasoning vs Instruction-Following: cites paper + 4 mitigations.
  - Over/Underthinking: fix via specificity or routing to reasoning tool.
  - Cost: track token inconsistencies.
  - Latency: streaming, smaller models (3.7 Sonnet) help.
  - Poor tool calling: R1/Qwen weak unless trained; o3 improved but parallel still issue — needs robust dynamic tool calling for world action.
- **References:** 12+ arXiv/links (Claude 4 best practices, DeepSeek-R1 paper, Illusion of Thinking, Pitfalls of Reasoning, etc.).
- **Next steps:** Courses: Prompt Engineering for Developers, Advanced AI Agents, Intro to AI Agents (ReAct), Intro to RAG.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 4 passages in this section could not be located in the stored source ([https://www.promptingguide.ai/guides/reasoning-llms](https://www.promptingguide.ai/guides/reasoning-llms)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Large reasoning models (LRMs) or simply, reasoning LLMs, are models explicitly trained to perform native thinking or chain-of-thought."

> "Use reasoning models for reasoning-heavy modules… not for every part of the application."

> "Avoid chain-of-thought (step-by-step) prompting in the instructions. The instructions should be simple and direct."

> "Try to optimize for accuracy first and then optimize for latency and cost."

## Concepts Introduced or Referenced
- [[reasoning-llms]] / [[thinking-models]] — native CoT, hybrid reasoning
- [[deep-agents]] — planning, agentic RAG, evaluator-optimizer
- [[context-engineering]] — structured outputs, few-shot
- [[tool-use]] — tool-calling weakness of reasoning models
- [[inference]] — test-time compute scaling

## Critical Assessment
**Strengths:** Most complete reasoning-model practitioner guide in corpus; balances patterns, prompting tricks, and honest limitations with citations; hybrid reasoning ladder is actionable.
**Weaknesses:** Heavy link-dependence (spreadsheet, videos); some benchmarks/links may rot; cost/latency mitigations qualitative.
**Contradictions:** Refines [[thinking-models]] (test-time scaling) with new nuance: avoid manual CoT with native reasoners — aligns with arXiv 2505.11423 finding instruction-following degradation.

## Sources
- Raw: [https://www.promptingguide.ai/guides/reasoning-llms](https://www.promptingguide.ai/guides/reasoning-llms)

---

**Source:** Reasoning LLMs Guide — Prompt Engineering Guide (DAIR.AI) Guides by Elvis Saravia / DAIR.AI — <https://www.promptingguide.ai/guides/reasoning-llms>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
