---
type: source-summary
title: "Llama 3 — Prompt Engineering Guide (DAIR.AI) Models"
summary: Model brief on Meta Llama 3 (8B + 70B pre-trained & instruction-tuned; 400B preview).
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.) / Meta AI"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/llama-3.en.mdx"
date-published: 2024-04-15
date-ingested: 2026-08-24
tags:
  - open-source
  - llm-fundamentals
key-concepts:
  - "[[llm-models-overview]]"
  - "[[pretraining]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-models-llama-3
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Model brief on Meta Llama 3 (8B + 70B pre-trained &amp; instruction-tuned; 400B preview).</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.) / Meta AI, 2024-04-15. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/llama-3.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
Model brief on **Meta Llama 3 (8B + 70B pre-trained & instruction-tuned; 400B preview)**. Notes standard **decoder-only transformer**, **128K vocab**, **8K context**, **Grouped Query Attention (GQA)**, **>15T pretraining tokens**, post-training stack **SFT + rejection sampling + PPO + DPO**, and **license card**. Benchmark deltas: 8B Instruct > Gemma 7B / Mistral 7B Instruct; 70B > Gemini Pro 1.5 / Claude 3 Sonnet (falls slightly behind on MATH vs Gemini Pro 1.5); pretrained also > on AGIEval/MMLU/Big-Bench Hard. 400B checkpoint (Apr 15 2024) teases multimodal/multilingual/longer-context roadmap, with three performance screenshots and YouTube `h2aEmciRd6U` deep review.

## Key Takeaways
1. **Architecture at a glance:** Decoder-only + 128K tokenizer + GQA + 8K seq → efficient 15T-token pretraining + RLHF-style alignment (SFT/RS/PPO/DPO).
2. **Positioning:** 8B is the open 7B-class leader; 70B is frontier-adjacent (beats Gemini Pro 1.5 / Sonnet), 400B aims at GPT-4 class.
3. **Training scale shift:** 15T tokens reflects Chinchilla-style overtraining vs earlier Llama-2, enabling strong instruct performance.
4. **Roadmap:** Multimodal, multilingual, longer context — not yet shipped at page date.

## Detailed Notes
- **Structure:** Header `Bleed`; Llama 3 Architecture Details (6 bullets), Performance (instruct vs Gemma/Mistral; 70B vs Gemini/Claude; MATH footnote), Llama 3 400B (results image + multimodal note), Extended Review iframe.
- **Images:** `llama-instruct-performance.png`, `llama3-pretrained-results.png`, `llama-400b.png` (all sourced ai.meta.com/blog/meta-llama-3).
- **Links:** https://llama.meta.com/llama3/ ; https://github.com/meta-llama/llama3/blob/main/MODEL_CARD.md.

## Notable Quotes
> "It uses a standard decoder-only transformer."
> "It is pretrained on over 15T tokens."
> "Llama 3 8B (instruction-tuned) outperforms Gemma 7B and Mistral 7B Instruct. Llama 3 70 broadly outperforms Gemini Pro 1.5 and Claude 3 Sonnet and falls a bit behind on the MATH benchmark when compared to Gemini Pro 1.5."

## Concepts Introduced or Referenced
- [[llm-models-overview]] — Llama 3 family entry; bridges to open-source ecosystem.
- [[pretraining]] / [[scaling-laws]] — Scale (15T tokens) + GQA efficiency reflecting Chinchilla lessons.
- [[rlhf]] / [[direct-preference-optimization]] — PPO + DPO post-training mix.
- [[tokenization]] — 128K vocab vs 32K prior.

## Critical Assessment
- **Strengths:** Concise architecture + benchmark snapshot with sources; clearly positions vs 7B peers and closed models.
- **Weaknesses:** Benchmark images not transcribed numerically; no prompt-engineering guidance specific to Llama 3; 400B results preliminary.
- **Contradictions:** None; complements [[source-promptingguide-models-llama]] (LLaMA 1/2 context) and [[source-promptingguide-models-collection]].

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/llama-3.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/llama-3.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/llama-3.en.mdx)
- Cited: https://llama.meta.com/llama3/ ; https://ai.meta.com/blog/meta-llama-3/ ; MODEL_CARD.md ; YouTube h2aEmciRd6U

---

**Source:** Llama 3 — Prompt Engineering Guide (DAIR.AI) Models by DAIR.AI (Elvis Saravia et al.) / Meta AI — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/llama-3.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
