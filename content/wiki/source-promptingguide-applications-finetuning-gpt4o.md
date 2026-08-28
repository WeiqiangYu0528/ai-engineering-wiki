---
type: source-summary
title: "Fine-Tuning with GPT-4o Models — Prompt Engineering Guide (DAIR.AI) Applications"
summary: Announcement-style guide to OpenAI GPT-4o / GPT-4o mini fine-tuning (GA via GPT-4o-2024-08-06 checkpoint).
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/finetuning-gpt4o.en.mdx"
date-published: 2024-08-15
date-ingested: 2026-08-24
tags:
  - fine-tuning
  - prompt-engineering
key-concepts:
  - "[[supervised-fine-tuning]]"
  - "[[applications-overview]]"
  - "[[prompt-optimization]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
---

# Fine-Tuning with GPT-4o Models — Prompt Engineering Guide (DAIR.AI) Applications

## Summary
Announcement-style guide to **OpenAI GPT-4o / GPT-4o mini fine-tuning** (GA via `GPT-4o-2024-08-06` checkpoint). Covers purpose (customize structure/tone/domain instruction following), dashboard access (`platform.openai.com/finetune`), pricing ($25/M training tokens; $3.75/M input + $15/M output inference; paid tiers only), promo (1M free training tokens/day for 4o, 2M for mini until Sep 23), emotion-classification demo (JSONL dataset from `dair-ai/datasets` → fine-tuned GPT-4o mini; YouTube `UJ7ry7Qp2Js`), and evaluation via Playground + API systematic testing.

## Key Takeaways
1. **What to fine-tune for:** Response structure, tone, and complex domain instruction adherence — not just knowledge injection.
2. **Costs & access:** `GPT-4o-2024-08-06` via fine-tuning dashboard; $25/1M train, $3.75/1M input + $15/1M output; free-tier promo 1M (4o) / 2M (mini) tokens/day until 2024-09-23.
3. **Demo pattern:** JSONL dataset with `{text, emotion}` pairs → GPT-4o mini emotion classifier → "significant improvements in accuracy vs standard models" (qualitative; numbers not tabulated).
4. **Eval loop:** Playground interactive testing + API integration for systematic eval — same workflow as prior OpenAI FT.
5. **Scheduling note:** Promo deadline Sept 23 implies time-boxed experimentation incentive.

## Detailed Notes
- **Structure:** 5 sections + callout: Fine-Tuning Details and Costs, Free Training Tokens, Use Case: Emotion Classification (iframe), Accessing and Evaluating Fine-Tuned Models.
- **Pricing table implied:** Training vs inference vs promo — matches OpenAI announcement https://openai.com/index/gpt-4o-fine-tuning/
- **Dataset link:** https://github.com/dair-ai/datasets/tree/main/openai — JSONL with emotion-labeled text samples.
- **Limitations noted:** Exclusively paid tiers; inference cost higher than base; no hyperparams or eval metrics detailed.

## Notable Quotes
> "This new capability enables developers to customize the GPT-4o models for specific use cases, enhancing performance and tailoring outputs."
> "This process allows for customization of response structure, tone, and adherence to complex, domain-specific instructions."

## Concepts Introduced or Referenced
- [[supervised-fine-tuning]] — Task-specific JSONL fine-tuning of frontier models (SFT for tone/structure/domain).
- [[applications-overview]] — Applied customization route when prompting alone insufficient.
- [[prompt-optimization]] — Alternative lever; fine-tuning complements iterative prompt design.
- [[rlhf]] — Not applied here; pure SFT fine-tuning.

## Critical Assessment
- **Strengths:** Timely pricing + promo details and concrete JSONL emotion-classification recipe; clear dashboard/API eval path.
- **Weaknesses:** No quantitative result table (accuracy lift not reported), no guidance on dataset size, formatting (`system/user/assistant` JSONL), or overfitting/validation split; announcement rather than tutorial.
- **Contradictions:** None; aligns with [[supervised-fine-tuning]] and [[source-promptingguide-introduction-basics]] prompt-first workflow (fine-tune only after prompting limits).
- **Gaps:** Needs link to eval harness, data validation, and cost calculator.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/finetuning-gpt4o.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/finetuning-gpt4o.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/finetuning-gpt4o.en.mdx)
- Cited: https://openai.com/index/gpt-4o-fine-tuning/ ; https://platform.openai.com/finetune ; https://github.com/dair-ai/datasets/tree/main/openai ; YouTube UJ7ry7Qp2Js

---

**Source:** Fine-Tuning with GPT-4o Models — Prompt Engineering Guide (DAIR.AI) Applications by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/applications/finetuning-gpt4o.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
