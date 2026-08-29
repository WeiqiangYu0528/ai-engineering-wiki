---
type: source-summary
title: "LLM Reasoning — Survey Overview"
summary: Overview of LLM reasoning research curated by the Prompt Engineering Guide.
status: verified
visibility: public
author: "DAIR.AI via Sun et al. (2023), Qiao et al. (2023), Huang et al. (2023), Kambhampati (2024)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/llm-reasoning.en.mdx"
date-published: 2024-03-15
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - llm-fundamentals
  - agents
key-concepts:
  - "[[reasoning-llms]]"
  - "[[chain-of-thought]]"
  - "[[thinking-models]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-research-llm-reasoning
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Overview of LLM reasoning research curated by the Prompt Engineering Guide.</p>
<p class="kb-provenance">DAIR.AI via Sun et al. (2023), Qiao et al. (2023), Huang et al. (2023), Kambhampati (2024), 2024-03-15. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/llm-reasoning.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
Overview of LLM reasoning research curated by the Prompt Engineering Guide. Synthesizes Sun et al. (2023) foundation-model reasoning, Qiao et al. (2023) language-model prompting taxonomy, Huang et al. (2023) elicitation techniques, and Kambhampati (2024) position paper questioning whether LLMs truly reason or merely perform universal approximate retrieval at web scale.

## Key Takeaways
1. **Task breadth** — Reasoning spans mathematical, logical, causal, visual, and multimodal; foundation models increasingly applied to agent reasoning.
2. **Two-branch elicitation taxonomy (Qiao)** — Reasoning-enhanced strategy (prompt engineering, process optimization, external engines) vs knowledge-enhanced reasoning; single-stage strategies include [[chain-of-thought]] and [[active-prompt]].
3. **Technique spectrum (Huang)** — From fully supervised fine-tuning on explanation datasets to prompting methods (chain-of-thought, problem decomposition, in-context learning).
4. **Skeptical counterpoint (Kambhampati 2024)** — Concludes "nothing … gives me any compelling reason to believe that LLMs do reasoning/planning, as normally understood. What they do instead … is a form of universal approximate retrieval, which … can sometimes be mistaken for reasoning capabilities."
5. **Resource pointer** — Awesome LLM Reasoning GitHub curated list for ongoing tracking.

## Detailed Notes
### Reasoning with Foundation Models (Sun et al.)
- Overview of reasoning tasks across text and multimodal models including autonomous language agents. Figures map reasoning tasks and techniques for foundation models (alignment training, in-context learning).

### How Can Reasoning Be Elicited? (Qiao et al.)
- Two branches: reasoning-enhanced vs knowledge-enhanced. Reasoning strategies: prompt engineering, process optimization, external engines. Taxonomy figure plus mapping to CoT, Active-Prompt etc.

### Huang et al. Summary
- Techniques from supervised fine-tuning on explanations to prompting (CoT, decomposition, ICL). Figure summarizing techniques for GPT-3.

### Can LLMs Reason and Plan? (Kambhampati)
- Position paper argues current LLM successes are better explained by web-scale approximate retrieval than by planning as classically defined.

## Notable Quotes
> "To summarize, nothing that I have read, verified, or done gives me any compelling reason to believe that LLMs do reasoning/planning, as normally understood. What they do instead, armed with web-scale training, is a form of universal approximate retrieval, which, as I have argued, can sometimes be mistaken for reasoning capabilities." — Subbarao Kambhampati (2024)

## Concepts Introduced or Referenced
- [[reasoning-llms]] — contextualized as deliberative System-2 vs approximate-retrieval debate.
- [[chain-of-thought]] — core single-stage prompting elicitor.
- [[active-prompt]] — uncertainty-based exemplar selection for reasoning.
- [[thinking-models]] — native test-time compute vs prompt-elicited reasoning.
- [[self-consistency]] / [[tree-of-thoughts]] — process-optimization extensions implied.

## Critical Assessment
Concise survey-of-surveys; strength is breadth and inclusion of skeptical position rarely featured in guide techniques. Weakness: heavily figure-referenced without reproducing key findings numerically; Huang figure not summarized in prose. Complements [[source-promptingguide-guides-reasoning-llms]] (practitioner tips) with research framing. No contradictions — aligns with [[thinking-models]] cautious stance on interpreting CoT as reasoning.

---

**Source:** LLM Reasoning — Survey Overview by DAIR.AI via Sun et al. (2023), Qiao et al. (2023), Huang et al. (2023), Kambhampati (2024) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/llm-reasoning.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
