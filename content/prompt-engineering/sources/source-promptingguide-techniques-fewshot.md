---
type: source-summary
title: "Prompt Engineering Guide — Few-Shot Prompting"
summary: This chapter defines few-shot prompting as enabling In-Context Learning by providing demonstrations in the prompt to condition the model, covering 1-shot through 10+-shot scaling, emergent few-shot properties with model…
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/fewshot.en.mdx"
date-published: 2023-01-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - llm-fundamentals
key-concepts:
  - "[[few-shot-prompting]]"
  - "[[in-context-learning]]"
  - "[[zero-shot-prompting]]"
  - "[[chain-of-thought]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-fewshot
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This chapter defines few-shot prompting as enabling In-Context Learning by providing demonstrations in the prompt to condition the model, covering 1-shot through 10+-shot scaling, emergent few-shot properties with model…</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.), 2023-01-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/fewshot.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
</aside>

## Summary
This chapter defines **few-shot prompting** as enabling [[in-context-learning]] by providing demonstrations in the prompt to condition the model, covering 1-shot through 10+-shot scaling, emergent few-shot properties with model size (Kaplan 2020; Touvron LLaMA 2023; Brown GPT-3 2020), and practical findings from Min et al. 2022 on label-space, format, and distribution effects. It walks through the classic `whatpu/farduddle` 1-shot novel-word example, randomized-label robustness experiments, and a failure case on parity reasoning where few-shot alone still errs (`15, 32, 5, 13, 82, 7, 1`), motivating the need for [[chain-of-thought]].

## Key Takeaways
1. **Conditioning, not training:** Demonstrations serve as context conditioning; no weight updates occur — the model performs pattern completion over the provided exemplars.
2. **Emerges with scale:** Few-shot capability appears only when models are scaled to sufficient size (Kaplan 2020 scaling laws; Touvron et al. 2023 LLaMA).
3. **Label space + format outweigh label correctness:** Min et al. 2022 shows input distribution and consistent delimiters matter more than per-example correctness; even random labels beat no labels if format and label distribution are preserved.
4. **Robustness is growing:** Newer GPT models tolerate inconsistent formatting (e.g., shuffled `Positive This is awesome!` vs `//` delimiters) yet still classify correctly — but thorough evaluation is still needed.
5. **Limits on reasoning:** For multi-step tasks (parity sum → 41 odd → False), even 4-shot QA (`A: The answer is True/False`) fails, signaling the ceiling of vanilla few-shot and the need for reasoning-centric techniques like CoT or fine-tuning.

## Detailed Notes
### Definition and Scale Emergence
- Few-shot = provide demonstrations (input-output pairs) in prompt to steer generation; enables [[in-context-learning]] where K examples condition the next completion.
- Cited emergence: Kaplan et al. 2020 scaling laws for when few-shot appears; Touvron et al. 2023 LLaMA confirms sufficient size required.
- Associated YouTube tutorial `ojtbHUqw1LA` embedded.

### Canonical Example — Novel Word Use (Brown 2020)
```
A "whatpu" is a small, furry animal native to Tanzania. An example...
We were traveling in Africa and we saw these very cute whatpus.

To do a "farduddle" means to jump up and down really fast. An example...
→ When we won the game, we all started to farduddle in celebration.
```
- 1-shot suffices for the model to generalize the template to a new nonce word.

### Findings from Min et al. 2022
- Label space and input distribution specified by demonstrations both matter regardless of per-input correctness.
- Format plays key role: even random labels >> no labels.
- Sampling random labels from true distribution beats uniform random — hints for demonstration design.

### Robustness Experiments
- Random-label sentiment task:
```
This is awesome! // Negative
This is bad! // Positive
Wow that movie was rad! // Positive
What a horrible show! // → Negative (still correct)
```
- Inconsistent-format variant still yields `Negative` — suggests newer GPT models are format-resilient, but author cautions task-dependent variance.

### Limitations — Parity Reasoning Failure
- Query: `The odd numbers in this group add up to an even number: 15, 32, 5, 13, 82, 7, 1. A: → Yes, ... 107 even` (wrong; true odds = 15+5+13+7+1=41 → False / odd).
- Adding 4 labeled exemplars (`A: The answer is False/True`) still yields `True` — model lacks explicit reasoning trace; surface pattern matching is insufficient.
- Pointer to [[chain-of-thought]] (Wei et al. 2022) as the principled fix for arithmetic/commonsense/symbolic reasoning.

### Prescription
- "When zero-shot and few-shot are not sufficient, it might mean whatever was learned isn't enough" → consider fine-tuning or more advanced techniques (CoT, self-consistency, ToT).

## Notable Quotes
> "Few-shot prompting can be used as a technique to enable in-context learning where we provide demonstrations in the prompt to steer the model to better performance."
> "the label space and the distribution of the input text specified by the demonstrations are both important (regardless of whether the labels are correct for individual inputs)" — Min et al. 2022
> "It seems like few-shot prompting is not enough to get reliable responses for this type of reasoning problem."

## Concepts Introduced or Referenced
- [[few-shot-prompting]] — Core technique: K-shot conditioning, delimiter consistency, scaling with model size.
- [[zero-shot-prompting]] — Contrasted baseline; when to escalate from zero to few.
- [[in-context-learning]] — Theoretical grounding; demonstrations as non-parametric task specification without gradient updates.
- [[chain-of-thought]] — Explicitly foreshadowed as the remedy for reasoning failures.
- [[prompt-elements]] — Delimiter choice (`Q:/A:`, `//`) and output indicator design driving format effects.
- [[scaling-laws]] — Kaplan emergence claim linking few-shot to scale.
- [[hallucination]] / [[pretraining]] — Implicit: limited reasoning reflects gaps in parametric knowledge vs contextual reasoning.

## Critical Assessment
- **Strengths:** Excellent empirical texture: juxtaposes crisp 1-shot success (whatpu) with systematic ablations (random labels, inconsistent format) and a clean failure mode (parity) — making limitations concrete; correctly cites Min 2022 nuance that practitioners often miss (label correctness less important than distribution/format).
- **Weaknesses:** Random-label claims based on informal `gpt-3.5` playground probes without controlled benchmark numbers; format robustness observation is anecdotal ("seems newer GPT models are becoming more robust") and needs rigorous replication. Does not quantify K vs performance curve or discuss context-window cost of many-shot.
- **Contradictions:** No contradiction with [[in-context-learning]] wiki page but sharpens it: ICL page claims "5–100 exemplars" typical, this page shows even 1 picks up pattern; reconciliation needed — both true depending on task novelty.
- **Gaps:** Should cross-link to [[prompt-elements]] and [[prompt-design-tips]] for delimiter iteration, [[llm-settings]] for sampling variance across few-shot runs, and [[retrieval-augmented-generation]] for grounding when few-shot exemplars are insufficient.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/fewshot.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/fewshot.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/fewshot.en.mdx)
- Cited: Brown et al. 2020 GPT-3 https://arxiv.org/abs/2005.14165; Touvron et al. 2023 LLaMA https://arxiv.org/pdf/2302.13971.pdf; Kaplan et al. 2020 https://arxiv.org/abs/2001.08361; Min et al. 2022 https://arxiv.org/abs/2202.12837; Wei CoT https://arxiv.org/abs/2201.11903

---

**Source:** Prompt Engineering Guide — Few-Shot Prompting by DAIR.AI (Elvis Saravia et al.) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/fewshot.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
