---
type: source-summary
title: "LLM Tokenization — Karpathy Lecture Summary"
summary: Pointer to Andrej Karpathy's lecture on LLM tokenization (https://youtu.be/zduSFxRajkE), covering BPE tokenizer training, GPT tokenizer from-scratch implementation, and how many LLM quirks trace to tokenization.
status: draft
visibility: public
author: "Andrej Karpathy via DAIR.AI"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/llm-tokenization.en.mdx"
date-published: 2024-01-01
date-ingested: 2026-08-24
tags:
  - llm-fundamentals
  - prompt-engineering
key-concepts:
  - "[[tokenization]]"
  - "[[prompt-engineering]]"
key-entities:
  - "[[andrej-karpathy]]"
  - "[[openai]]"
---

# LLM Tokenization — Karpathy Lecture Summary

## Summary
Pointer to Andrej Karpathy's lecture on LLM tokenization (https://youtu.be/zduSFxRajkE), covering BPE tokenizer training, GPT tokenizer from-scratch implementation, and how many LLM quirks trace to tokenization. Highlights tooling (Tiktokenizer) and tokenization-aware prompting implications. Accompanied by "What is the real root of suffering? Tokenization." taxonomy of 11 failure modes.

## Key Takeaways
1. **11 tokenization-rooted behaviors** — spelling/letter counting, string reversal, non-English (Japanese) quality, arithmetic, GPT-2 Python issues, \<endoftext\> halting, trailing-whitespace warnings, SolidGoldMagikarp glitch, YAML>JSON preference, non-end-to-end LM, and "root of suffering" meme.
2. **Tokenizer is a separate trained artifact** — BPE vocab built from own dataset/algorithm, not inherent to Transformer.
3. **Prompting implication** — Prompt engineering must consider tokenizer constraints (e.g., acronym/concept tokenization, spacing around numbers) — a commonly overlooked failure surface.
4. **Tooling** — Tiktokenizer (https://tiktokenizer.vercel.app/) for interactive inspection; lecture walks through building a GPT tokenizer.

## Detailed Notes
- Figure lists 11 questions all answered "Tokenization."
- Lecture covers tiktoken / cl100k_base regex splitting and merge ranks.
- Practical note: YAML preferred over JSON partly due to token efficiency.

## Concepts Introduced or Referenced
- [[tokenization]] — BPE, subwords, regex pre-tokenization, embedding lookup.
- [[prompt-engineering]] / [[prompt-elements]] — tokenization-aware structure and formatting.
- [[inference]] — max_tokens, context window token budgeting.

## Critical Assessment
High-value conceptual pointer but minimal guide-internal detail — essentially a lecture trailer. Strength: memorable 11-item diagnostic checklist. Limitation: no tokenizer implementation detail reproduced. Reinforces [[tokenization]] page's existing quirks list (strawberry, Japanese, YAML vs JSON) with Karpathy's framing. No contradictions; strengthens connection between tokenization and prompting quality.

---

**Source:** LLM Tokenization — Karpathy Lecture Summary by Andrej Karpathy via DAIR.AI — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/research/llm-tokenization.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
