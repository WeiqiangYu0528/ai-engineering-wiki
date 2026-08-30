---
type: source-summary
title: "LLM Collection — Prompt Engineering Guide (DAIR.AI) Models"
summary: Encyclopedic catalog of ~50+ notable/foundational LLMs (Sep 2023 cutoff) with release date, size (B), checkpoints (HF links), and description.
status: draft
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/collection.en.mdx"
date-published: 2023-10-01
date-ingested: 2026-08-24
tags:
  - open-source
  - llm-fundamentals
key-concepts:
  - "[[llm-models-overview]]"
key-entities:
  - "[[openai]]"
  - "[[deepmind]]"
  - "[[google-research]]"
aliases:
  - wiki/source-promptingguide-models-collection
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Encyclopedic catalog of ~50+ notable/foundational LLMs (Sep 2023 cutoff) with release date, size (B), checkpoints (HF links), and description.</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-10-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/collection.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
Encyclopedic **catalog of ~50+ notable/foundational LLMs** (Sep 2023 cutoff) with release date, size (B), checkpoints (HF links), and description. Spans Falcon 7/40/180B (TII, 3500B tokens), Mistral 7B (GQA/SWA), CodeLlama 7/13/34B, LLaMA-2 7/13/70B, Claude-2 130B, Tulu/FLAN-tuned variants, PaLM 2, Gorilla (API-connected), plus BLOOM 176B, OPT-175B, Chinchilla 70B, InstructGPT 175B, AlphaCode 41B, GPT-3/2, BERT/RoBERTa, T5/UL2/Flan-T5, etc. Sources data from Papers With Code and Zhao et al. 2023 (https://arxiv.org/pdf/2303.18223.pdf). Under-development callout; intended as quick lookup for parameter scale, licensing, and HF availability.

## Key Takeaways
1. **Breadth at a glance:** Single table maps model × date × params × HF checkpoint × one-line capability (e.g., Falcon 180B trained on 3500B tokens; Mistral 7B uses Byte-fallback BPE + Sliding-Window Attention).
2. **Scale regimes:** Illustrates pre-Chinchilla oversized models (Gopher 280B, OPT-175B) vs Chinchilla-optimal 70B/1.4T and recent efficient open models (Phi-1 1.3B, Pythia 70M–12B).
3. **Instruction-tuning wave:** Many entries are LLaMA-derived fine-tunes (Alpaca 52K, Vicuna, Guanaco QLoRA, Koala, Dolly) showing ecosystem reuse.
4. **Checkpoint traceability:** Hugging Face links where available (Falcon, LLaMA-2, Bloom, etc.) vs closed (GPT-4, Claude-2, PaLM 540B).

## Detailed Notes
- **Structure:** Header callout + Markdown table (Model | Release Date | Size (B) | Checkpoints | Description) + adoption note + Zhao survey citation.
- **Sample rows:**
  - Falcon 180B — Sep 2023 — 180B — HF falcon-180B — TII, 3500B tokens.
  - Mistral-7B-v0.1 — Sep 2023 — 7B — GQA + SWA.
  - CodeLlama — Aug 2023 — 7/13/34B — tuned for instruction/safety.
  - Llama-2 — Jul 2023 — 7/13/70B — 40% more data than LLaMA-1, chat-tuned.
  - Claude-2 — Jul 2023 — 130B — steerable, long-context.
  - Tulu — Jun 2023 — 7/13/30/65B — FLAN V2/CoT/Dolly/OA1/GPT4-Alpaca mix.
  - Gorilla — May 2023 — 7B — Massive API connection.
  - Chinchilla — Mar 2022 — 70B — compute-optimal proof.
  - InstructGPT — Mar 2022 — 175B — SFT→RM→PPO-ptx.
  - LLaMA — Feb 2023 — 7/13/33/65B — efficient open foundation.
- **Historical tail:** Goes back to GPT (Jun 2018), BERT (Oct 2018), T5 (Oct 2019), GPT-2 (Nov 2019) through 2023 frontier.

## Notable Quotes
> "This section consists of a collection and summary of notable and foundational LLMs."
> "Data adopted from Papers with Code and the recent work by Zhao et al. (2023)."

## Concepts Introduced or Referenced
- [[llm-models-overview]] — Canonical index for model selection by scale/date/capability.
- [[scaling-laws]] — Implicit scale vs data tradeoff across table rows (Chinchilla vs Gopher).
- [[supervised-fine-tuning]] / [[rlhf]] — Instruction-tuned variants populate many rows.
- [[pretraining]] — Token counts (15T for Llama 3, 3500B for Falcon 180B) as scaling context.

## Critical Assessment
- **Strengths:** Broad, quickly scannable reference; anchors scale narratives with dates and HF links; captures mid-2023 open-source explosion.
- **Weaknesses:** Table-only, no task-level guidance or prompting tips; sizes sometimes "-" for closed models; dated (pre-Mistral-large, Gemini Ultra, Claude 3.5+); descriptions terse.
- **Contradictions:** None; complements individual model pages ([[source-promptingguide-models-chatgpt]], [[source-promptingguide-models-gpt-4]], [[source-promptingguide-models-llama-3]]) with aggregate view.
- **Gaps:** Needs link to [[llm-models-overview]] curated explainer and to [[scaling-laws]] compute-optimal framing.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/collection.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/collection.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/collection.en.mdx)
- Cited: https://paperswithcode.com/methods/category/language-models ; Zhao et al. 2023 https://arxiv.org/pdf/2303.18223.pdf

---

**Source:** LLM Collection — Prompt Engineering Guide (DAIR.AI) Models by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/models/collection.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
