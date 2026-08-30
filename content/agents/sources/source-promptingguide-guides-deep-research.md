---
type: source-summary
title: "OpenAI Deep Research Guide — Prompt Engineering Guide (DAIR.AI) Guides"
summary: Guide to OpenAI Deep Research — an agentic reasoning system for multi-step internet research powered by a proprietary o3 variant (RL-trained to browse, plan, backtrack, adapt) with tools Python + web browsing…
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/guides/deep-research.en.mdx"
date-published: 2025-05-15
date-ingested: 2026-08-24
tags:
  - agents
  - rag
key-concepts:
  - "[[deep-research]]"
  - "[[ai-agents]]"
  - "[[retrieval-augmented-generation]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-guides-deep-research
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Guide to OpenAI Deep Research — an agentic reasoning system for multi-step internet research powered by a proprietary o3 variant (RL-trained to browse, plan, backtrack, adapt) with tools Python + web browsing…</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2025-05-15. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/guides/deep-research.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Guide to **OpenAI Deep Research** — an **agentic reasoning system** for multi-step internet research powered by a proprietary **o3** variant (RL-trained to browse, plan, backtrack, adapt) with tools **Python + web browsing**, file-upload, and plot generation (embed graphs/images + citations). Flow is **Search → Analyze → Synthesize → Report/Insights/Action Plan** over hundreds of sources (YouTube `wovjVUnYfic`, flow chart `deep_research_flowchart.JPG`). Covers **access/quotas** (Pro 250/mo, Plus/Team/Enterprise/Edu 25/mo, Free 5 lightweight via o4-mini; fallback to lightweight when capped; Apr 24 2025 update; limits image `deep_research_OAI_post.JPG`), **problem fit** (tasks taking humans many hours needing multi-source integration, deep analysis, multi-step planning, large-scale processing), **use-case taxonomy** (professional: market/competitive/policy/engineering; consumer: product research; academic: literature review/gap discovery/trends; knowledge work: complex QA, file augmentation, reports/docs, feasibility studies, synthesis), **decision rule** (use Deep Research for multi-faceted domain queries needing real-time browsing + reasoning; else o1-mini for reasoning sketches, GPT-4o for simple one-offs), **prompting tips** (clear specific plan, answer clarifications — model asks when uncertain, keyword-dense search terms, action verbs `compare/suggest/recommend/report`, explicit report/table format, upload PDFs for niche context, verify sources), **10 curated example reports** (GitHub repos, AI agent frameworks, AI-driven scientific discovery, OpenAI vs Gemini, AI education trends, etc. via `chatgpt.com/share/...` links), and **alternatives** (Gemini Deep Research, DIY via Flowise/LlamaIndex/crewAI/n8n/LangGraph; proprietary o3 variant not yet API-exposed; benchmark comparison to o3-mini-high on Humanity's Last Exam linked https://openai.com/index/introducing-deep-research/).

## Key Takeaways
1. **Model + training:** RL for browsing/reasoning/planning + execution + backtracking/reacting to live info; lightweight `o4-mini` variant for free tier.
2. **Access ladder:** Pro 250/mo vs Plus/Team/Enterprise/Edu 25/mo (was 10 → 25; Pro 120→250) vs Free 5 lightweight; auto-fallback to lightweight at cap.
3. **When to use:** Multi-faceted, domain-specific, real-time info + careful reasoning → Deep Research; single-step/bounded → o1-mini (decomposition) or GPT-4o.
4. **Prompting levers that matter:** Dense domain keywords (brands, technical terms), precise verbs for intent, explicit section/table layout (columns/headers), thorough clarification answers, and file uploads — each reduces search iterations.
5. **Operational caveat:** Always verify citations — model can still confuse authority vs speculation; embedding of graphs not fully functional yet.

## Detailed Notes
- **Structure:** Intro iframe → What is Deep Research? (definition + RL + tools) → Flow chart → How to Access → What Problems → Use Cases (5 buckets + 10 example links) → How to decide → Usage Tips (Prompting Tips 6 bullets + verify) → What to try Next? (Research/Business/Learning/Science/Content/Personal task lists) → How does it differ (alternatives + proprietary o3 note + benchmark pointer + word cloud `deep_research_word_cloud.JPG` via Claude artifact).
- **Use-case word cloud & flow artifacts:** Claude artifacts `4e4f5dec…` (flow) and `769190…` (cloud).
- **Example shares (10):** Analyze GitHub Repos (2025-05-08), Top AI Agent Frameworks, AI-Driven Scientific Discovery Across Disciplines, OpenAI vs Google Gemini, Trends in AI Education, YC Startup Ideas Research, DeepSeek-R1 Guide, CrewAI Study Plan, LLM Pricing Trends, Recent Papers on o1/DeepSeek-R1.
- **Decision table text:** "You can use raw o1-mini and GPT-4o for all other tasks. Use o1-mini if it's a task that can benefit from reasoning (breaking down complex tasks…) Use GPT-4o for all other one-off simple tasks."
- **Tip illustrations:** `deep_research_clarify.JPG` showing model's clarification question UI.

## Notable Quotes
> "Deep Research is OpenAI's new agent that can perform multi-step research on the internet for performing complex tasks like generating reports and competitor analysis. It is an agentic reasoning system that has access to tools such as Python and web browsing… completing tasks in minutes instead of hours."
> "The model was developed using reinforcement learning, training it to browse effectively, reason about complex information, and learn to plan and execute multi-step tasks to find the data it needs. It possesses the ability to backtrack, adapt its plan, and react to real-time information."
> "If the task requires multi-faceted, domain-specific queries requiring extensive research for real-time information and careful reasoning … use Deep Research. You can use the raw o1-mini and GPT-4o for all other tasks."
> "Check sources & verify information: Always check sources yourself. The model can still make mistakes and may struggle to tell authoritative information from speculation."

## Concepts Introduced or Referenced
- [[deep-research]] — Core: o3-powered search+analyze+synthesize agent with browsing/Python.
- [[ai-agents]] / [[deep-agents]] — Agentic workflow pattern; planning/backtracking.
- [[retrieval-augmented-generation]] — Web-scale retrieval + synthesis (many-source RAG).
- [[reasoning-llms]] — o3/o4-mini reasoning backbone; RL for tool use.
- [[tool-use]] / [[context-engineering]] — Uploaded file context + clarifying questions as context design.

## Critical Assessment
- **Strengths:** Clearest end-to-end Deep Research operations manual in corpus — pairs quotas/limits with concrete prompting recipes and 10 live report examples; links flow chart, quota image, and share artifacts for reproducibility.
- **Weaknesses:** Guide is product-versioned (Apr 2025 quotas); 10 share links may rot; no eval of citation accuracy; benchmark mention (Humanity's Last Exam) not numerically extracted; YouTube/flow artifacts external.
- **Contradictions:** None; extends [[reasoning-llms]] (o3 capabilities) and [[context-engineering]] (clarification + keyword design) with operational depth; complements [[retrieval-augmented-generation]].
- **Gaps:** Needs longitudinal accuracy/loop-efficiency metrics and link to eval-safety verification workflow.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/guides/deep-research.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/guides/deep-research.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/guides/deep-research.en.mdx)
- Cited: https://openai.com/index/introducing-deep-research/ ; YouTube wovjVUnYfic ; Claude artifacts 4e4f5dec… & 769190… ; share links listed above; Deep Research flow chart image; OAI post limits image

---

**Source:** OpenAI Deep Research Guide — Prompt Engineering Guide (DAIR.AI) Guides by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/guides/deep-research.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
