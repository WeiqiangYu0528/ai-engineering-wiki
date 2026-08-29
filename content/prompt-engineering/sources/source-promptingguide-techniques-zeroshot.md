---
type: source-summary
title: "Prompt Engineering Guide — Zero-Shot Prompting"
summary: This short chapter from the DAIR.AI Prompt Engineering Guide defines zero-shot prompting as instructing a model without any demonstrations or exemplars, relying entirely on instruction tuning and pretraining to…
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/zeroshot.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - llm-fundamentals
key-concepts:
  - "[[zero-shot-prompting]]"
  - "[[in-context-learning]]"
  - "[[prompt-engineering]]"
  - "[[supervised-fine-tuning]]"
key-entities:
  - "[[openai]]"
  - "[[anthropic]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-zeroshot
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This short chapter from the DAIR.AI Prompt Engineering Guide defines zero-shot prompting as instructing a model without any demonstrations or exemplars, relying entirely on instruction tuning and pretraining to…</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-01-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/zeroshot.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
This short chapter from the DAIR.AI Prompt Engineering Guide defines **zero-shot prompting** as instructing a model without any demonstrations or exemplars, relying entirely on instruction tuning and pretraining to interpret the task. It demonstrates the canonical text-classification prompt (`Classify the text into neutral, negative or positive. Text: … Sentiment:`) producing `Neutral`, and explains why modern instruction-tuned models (GPT-3.5 Turbo, GPT-4, Claude 3) succeed zero-shot where earlier base models failed. It frames instruction tuning (Wei et al. 2022) and RLHF as the enablers that power ChatGPT-style zero-shot followership.

## Key Takeaways
1. **Definition is exemplar-free:** A zero-shot prompt contains only an instruction and the query instance; no input-output demonstrations are provided.
2. **Relies on scale + instruction tuning:** Large-scale pretraining gives the model world knowledge (e.g., what *sentiment* means); instruction tuning teaches it to map natural-language directives to task behavior.
3. **Classification pattern is the demo:** `Instruction → Text → Sentiment:` with colon-terminated [[prompt-elements]] output indicator is the minimal zero-shot skeleton that still controls format.
4. **Modern models are zero-shot-first:** GPT-3.5 Turbo / GPT-4 / Claude 3 are explicitly tuned to follow instructions, so many tasks succeed without few-shot overhead.
5. **Fallback is few-shot:** When zero-shot fails or output is unstable, the guide recommends adding demonstrations (→ [[few-shot-prompting]]) before considering fine-tuning.

## Detailed Notes
### Definition and Motivation
- Zero-shot = no examples or demonstrations in the prompt; model must infer intent from instruction phrasing alone.
- Contrasted with [[few-shot-prompting]] which adds conditioning via demonstrations for [[in-context-learning]].
- Statement: "Large-scale training makes these models capable of performing some tasks in a 'zero-shot' manner."

### Worked Example
```
Classify the text into neutral, negative or positive. 

Text: I think the vacation is okay.
Sentiment:
→ Neutral
```
- No labeled exemplars precede the query; the token `Sentiment:` acts as [[prompt-elements]] output indicator.
- Note the 2026-08-24 guide video embed (YouTube `ZTaHqdkxUMs`) covering zero-shot live in Playground.

### Why It Works Now
- **Instruction tuning** — Finetuning on datasets described via instructions (Wei et al. 2022, https://arxiv.org/pdf/2109.01652.pdf) improves zero-shot generalization.
- **RLHF** — Reinforcement learning from human feedback aligns the tuned model to human preferences; cited as the engine behind ChatGPT.
- Implication: zero-shot capability is not innate to autoregressive modeling; it emerges from post-training recipes on top of [[pretraining]] + [[scaling-laws]].

### Guidance
- Recommends iterating prompt specificity per [[prompt-design-tips]] before abandoning zero-shot.
- Explicit handoff: "When zero-shot doesn't work, it's recommended to provide demonstrations or examples in the prompt which leads to few-shot prompting."

## Notable Quotes
> "Large language models (LLMs) today, such as GPT-3.5 Turbo, GPT-4, and Claude 3, are tuned to follow instructions and are trained on large amounts of data."
> "Zero-shot prompting means that the prompt used to interact with the model won't contain examples or demonstrations. The zero-shot prompt directly instructs the model to perform a task without any additional examples to steer it."
> "Instruction tuning has been shown to improve zero-shot learning [Wei et al. (2022)]."

## Concepts Introduced or Referenced
- [[zero-shot-prompting]] — Primary subject; exemplar-free instruction following.
- [[in-context-learning]] — Zero-shot as the 0-demonstration edge of the ICL spectrum (0-shot vs 1-shot vs few-shot).
- [[prompt-engineering]] — Prompt design as the lever for zero-shot success; context-as-working-memory framing.
- [[prompt-elements]] — Instruction + Input Data + Output Indicator composition underlying the sentiment example.
- [[supervised-fine-tuning]] / [[rlhf]] — Instruction tuning + RLHF as training-time enablers discussed in text.
- [[hallucination]] — Implicitly relevant: zero-shot without grounding is most prone to confabulation, motivating RAG/tool use later.

## Critical Assessment
- **Strengths:** Minimal, runnable canonical example that transfers across tasks; correctly identifies the causal chain scale → instruction tuning → RLHF → zero-shot competence; cleanly delimits when to escalate to few-shot.
- **Weaknesses:** Very brief; does not show a failure case in this page (failure demo appears in few-shot page with parity reasoning); cites RLHF as https://arxiv.org/abs/1706.03741 which is actually the original RLHF paper but not the InstructGPT application — slight citation mismatch. No discussion of temperature/top_p interaction per [[llm-settings]] or sensitivity to output-indicator wording.
- **Contradictions:** None with [[prompt-engineering]] or [[in-context-learning]] wiki pages; complements them by naming the post-training stack explicitly.
- **Gaps to fill:** Needs cross-link to [[role-prompting]] (system instructions boost zero-shot), [[decoding-strategies]] (greedy vs sampled decoding changes zero-shot stability), and grounding via [[retrieval-augmented-generation]].

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/zeroshot.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/zeroshot.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/zeroshot.en.mdx)
- Cited: Wei et al. 2022 Instruction Tuning https://arxiv.org/pdf/2109.01652.pdf

---

**Source:** Prompt Engineering Guide — Zero-Shot Prompting by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/zeroshot.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
