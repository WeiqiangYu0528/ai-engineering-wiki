---
type: source-summary
title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"
summary: The foundational January 2022 (v6 Jan 2023) Google Research Brain paper by Wei et al. that introduced Chain-of-Thought (CoT) prompting — augmenting few-shot exemplars with <input, chain of thought, output> triples so…
status: draft
visibility: public
author: "Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed H. Chi, Quoc V. Le, Denny Zhou (Google Research, Brain Team)"
source-type: paper
url: "https://arxiv.org/abs/2201.11903"
date-published: 2022-01-28
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - llm-fundamentals
  - agents
key-concepts:
  - "[[chain-of-thought]]"
  - "[[in-context-learning]]"
  - "[[thinking-models]]"
  - "[[self-consistency]]"
  - "[[tree-of-thoughts]]"
  - "[[scaling-laws]]"
key-entities:
  - "[[google-research]]"
  - "[[openai]]"
aliases:
  - wiki/source-chain-of-thought-prompting-elicits-reasoning
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The foundational January 2022 (v6 Jan 2023) Google Research Brain paper by Wei et al. that introduced Chain-of-Thought (CoT) prompting — augmenting few-shot exemplars with &lt;input, chain of thought, output&gt; triples so…</p>
<p class="kb-provenance">Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed H. Chi, Quoc V. Le, Denny Zhou (Google Research, Brain Team), 2022-01-28. <a href="https://arxiv.org/abs/2201.11903">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary
The **foundational January 2022 (v6 Jan 2023) [[google-research]] Brain paper** by Wei et al. that introduced **Chain-of-Thought (CoT) prompting** — augmenting few-shot exemplars with `<input, chain of thought, output>` triples so that a frozen LLM generates intermediate natural-language reasoning steps before the answer. Evaluating **PaLM (8B–540B), LaMDA (422M–137B), GPT-3 (350M–175B), UL2 20B and Codex** on arithmetic (GSM8K, SVAMP, ASDiv, AQuA, MAWPS), commonsense (CSQA, StrategyQA, Date/Sports Understanding, SayCan) and symbolic (last-letter concatenation, coin flip) benchmarks, the paper shows **CoT is an emergent ability of scale** (~100B+ parameters): it more than doubles GSM8K for PaLM 540B with **8 exemplars** to **new SOTA** (≈58–60%) surpassing finetuned GPT-3+verifier, yields similar lifts on SVAMP/MAWPS/StrategyQA, and enables length-generalization on symbolic OOD tasks, while smaller models produce fluent-but-illogical chains and underperform standard prompting.

## Key Takeaways
1. **Simple Few-Shot Triples Unlock Reasoning:** Instead of `<input, output>`, prompting with 8 manually-written `<input, CoT, output>` exemplars (one set for all arithmetic benchmarks except AQuA's 4) lets large models mimic stepwise decomposition ("*There were 9 computers... 5*4=20... 9+20=29*") — no finetuning, no verifier, greedy decoding suffices.
2. **Emergence at ~100B Scale:** Figure 4: CoT flat or harmful for ≤10B models, sharply beneficial at 68B–137B (LaMDA), 62B–540B (PaLM) and 175B (GPT-3). Smaller models generate illogical CoTs; the paper's manual error analysis on LaMDA 137B shows 54% of wrong answers stem from major semantic incoherence, while scaling PaLM 62B→540B fixes most one-step-missing and semantic errors.
3. **Largest Gains on Hardest Tasks:** GSM8K (hardest arithmetic) >2× gain; SingleOp (MAWPS one-step subset) sees 0 or negative gain — CoT helps where multi-step composition is required, not where direct answer suffices.
4. **Ablations Exclude Trivial Explanations:** *Equation-only* helps only 1–2 step problems, fails on GSM8K semantics; *variable compute only* (dots `……` matching equation length) and *CoT after answer* both match baseline — proving benefit is **sequential linguistic reasoning before the answer**, not just more tokens or knowledge activation.
5. **Robust to Prompt Variation:** Chains written independently by Annotators B/C, a concise "solutions-style" variant, three random GSM8K-sampled exemplar sets, varied orders and exemplar counts — all outperform standard prompting (Figure 6). Prompt engineering matters but not brittly.
6. **Broad Applicability:** Commonsense: PaLM 540B CoT → StrategyQA 75.6% vs prior SOTA 69.4%, Sports Understanding 95.4% vs 84% human enthusiast (CSQA gains minimal); Symbolic: PaLM 540B CoT → ~100% in-domain on last-letter-2 and coin-flip-2, with upward OOD scaling to length 4 where standard prompting collapses — demonstrating compositional generalization.
7. **Limitations & Open Questions:** CoT does not guarantee correctness (46% of analyzed wrong chains are *almost* correct with minor calculator/symbol errors); manual CoT annotation cost limits finetuning scale; serves as expensive at 100B+ inference; raises whether neural net truly "reasons" vs mimics.

## Detailed Notes

### Motivation & Properties
- Combines (a) natural-language rationales from training/finetuning literature (Ling 2017, Cobbe 2021) with (b) in-context prompting strength (Brown 2020), avoiding large rationale datasets and task-specific finetunes. The work is *prompting-only* and *off-the-shelf*.
- Four touted properties: (1) decomposes multi-step → allocates variable compute via intermediate tokens; (2) interpretable window for debugging; (3) language-general (math/commonsense/symbolic, extensible to any human-verbalizable task); (4) trivially elicited with a few exemplars.

### Experimental Setup Details
- **Models & decoding:** GPT-3 text-* ada/babbage/curie/davinci-002 (≈350M–175B), LaMDA 422M–137B (5 seeds, averaged), PaLM 8B/62B/540B, UL2 20B, Codex code-davinci-002; greedy sampling (Wang et al. self-consistency later shows majority vote over samples improves further).
- **Prompts:** 8 exemplars total, *single* prompt set for GSM8K/SVAMP/ASDiv/MAWPS; AQuA uses 4 exemplars from its train set due to multiple-choice format; commonsense prompts use train-sampled chains (CSQA/StrategyQA) or first-10 eval examples (BIG-bench Date/Sports) or 6 SayCan training examples; symbolic uses 2-word names / 2-flip exemplars testing OOD to 3–4 words/flips (Figure 3 shows exemplar format per benchmark, full prompts in Appendix G Table 20–21).

### Results Highlights (Appendix B All Results)
- **Arithmetic:** GSM8K: PaLM 540B standard ~17% → CoT 58% (Figure 2) vs finetuned GPT-3 verifier ~55%; SVAMP: PaLM 540B CoT ~80% vs standard already > prior best; MAWPS ~100% vs prior; AQuA/ASDiv within 2% SOTA.
- **Correctness analysis (Appendix D.1/D.2):** On 50 correct LaMDA 137B GSM8K answers, 48 CoTs are logically/mathematically correct (2 lucky guesses); on 50 incorrect, 46% are almost-correct (minor errors), 54% major errors. Scaling fixes semantic understanding.
- **Robustness (3.4, A.2):** No prompt-engineering on initial exemplars; variance across annotators/order/count expected (Zhao 2021 SST-2 54–93% analogy) but CoT always >> standard.
- **Symbolic OOD:** Last-letter concatenation: standard fails beyond in-domain length; CoT allows generalization though absolute OOD < in-domain; same for coin-flip.

### Extended Related Work (Appendix C)
- **Prompting:** Few-shot (Brown), instruction tuning (Wei 2022a, Sanh 2022, Ouyang 2022), automated prompts (Lester 2021).
- **Explanations:** e-SNLI (Camburu 2018), rationalization datasets.
- **Program synthesis:** Nye 2021 stepwise execution.
- **Intermediate steps:** Scratchpads, latent language (Andreas 2018), calculator-augmented BERT (Andor 2019).

### FAQ Appendix A (Useful for Practitioners)
- **A.1 Scale effect:** Emergence tied to model capacity to produce coherent chains; qualitative analysis shows smaller models' chains are fluent but illogical.
- **A.2 Prompt engineering role:** Not critical — random GSM8K exemplars work; order/count robustness documented.
- **A.3 When will CoT help your task?** Tasks requiring multi-step reasoning; simple one-step tasks see no benefit and may degrade.
- **A.4 Why equation-only insufficient?** GSM8K requires semantic parsing before equation formulation; 1–2 step problems can jump directly to equation.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 4 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2201.11903](https://arxiv.org/abs/2201.11903)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Chain-of-thought prompting is an emergent ability of model scale." — Wei et al., Figure 4 caption

> "We explore how generating a chain of thought — a series of intermediate reasoning steps — significantly improves the ability of large language models to perform complex reasoning."

> "Although chain of thought emulates the thought processes of human reasoners, this does not answer whether the neural network is actually 'reasoning,' which we leave as an open question."

> "With just eight chain-of-thought exemplars, PaLM 540B achieves state-of-the-art accuracy on GSM8K, surpassing even finetuned GPT-3 with a verifier."

## Concepts Introduced or Referenced
- [[chain-of-thought]] — Core method: `<input, CoT, output>` triples, greedy decoding, robustness & scale emergence.
- [[in-context-learning]] — CoT is a specialized few-shot prompt format atop Brown 2020.
- [[thinking-models]] — CoT as prompting ancestor; scaling test-time compute and RL on CoT turns prompting into trained reasoning (o1/R1).
- [[self-consistency]] — Wang et al. follow-up: sampling many CoTs and majority voting improves over greedy CoT.
- [[tree-of-thoughts]] — Yao et al. generalization: search tree over CoT thoughts (BFS) for further gains.
- [[scaling-laws]] — Kaplan/Rae scaling insufficient for reasoning; CoT reveals new emergent scaling curve for reasoning tasks.

## Critical Assessment
- **Strengths:** Landmark simplicity — *no training*, single prompt set, sweeping evaluation across 3 model families × 3 reasoning families with ablations and robustness. Established the emergent-scale narrative that seeded all subsequent reasoning research (Self-Consistency, ToT, RLVR/Thinking Models). Appendices (FAQs, error taxonomies, alternate annotators, full prompts) are unusually thorough and practitioner-friendly. CC-BY 4.0.
- **Limitations:** Evaluation is few-shot *greedy* only (Self-Consistency later shows sampling helps); arithmetic CoT exemplars are manually curated (8) — cost would be high for finetuning scale; commonsense gains uneven (StrategyQA large, CSQA minimal) suggesting not all commonsense benefits from stepwise language; no analysis of faithfulness (does CoT reflect actual computation?); inference cost at 540B is prohibitive for deployment. The paper's "emergent at 100B" claim is model-family-specific and later contested for smaller models with better instruction tuning.
- **Wiki Integration:** Fills the gap between [[source-promptingguide-techniques-cot]] (Dair Guide's concise summary) and the primary evidence. No contradictions; complements [[scaling-laws]] (flat vs emergent curves) and seeds [[thinking-models]] (prompted CoT → trained CoT). Should be cited alongside `source-deep-dive-into-llms-like-chatgpt` for reasoning discussion.

---

**Source:** Chain-of-Thought Prompting Elicits Reasoning in Large Language Models by Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed H. Chi, Quoc V. Le, Denny Zhou (Google Research, Brain Team) — <https://arxiv.org/abs/2201.11903>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
