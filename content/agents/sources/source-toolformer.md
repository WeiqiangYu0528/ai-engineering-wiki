---
type: source-summary
title: "Toolformer: Language Models Can Teach Themselves to Use Tools"
summary: Schick et al. (Meta AI, arXiv 2302.04761, ICLR 2023) present Toolformer — a self-supervised method that teaches a language model (GPT-J 6.7B) to decide which APIs to call, when, with what arguments, and how to…
status: draft
visibility: public
author: "Timo Schick, Jane Dwivedi-Yu, Roberto Dessì, Roberta Raileanu, Maria Lomeli, Luke Zettlemoyer, Nicola Cancedda, Thomas Scialom (Meta AI Research)"
source-type: paper
url: "https://arxiv.org/abs/2302.04761"
date-published: 2023-02-09
date-ingested: 2026-08-25
tags:
  - agents
  - rag
  - llm-fundamentals
  - fine-tuning
key-concepts:
  - "[[tool-use]]"
  - "[[function-calling]]"
  - "[[retrieval-augmented-generation]]"
  - "[[self-attention]]"
key-entities:
  - "[[openai]]"
aliases:
  - wiki/source-toolformer
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Schick et al. (Meta AI, arXiv 2302.04761, ICLR 2023) present Toolformer — a self-supervised method that teaches a language model (GPT-J 6.7B) to decide which APIs to call, when, with what arguments, and how to…</p>
<p class="kb-provenance">Timo Schick, Jane Dwivedi-Yu, Roberto Dessì, Roberta Raileanu, Maria Lomeli, Luke Zettlemoyer, Nicola Cancedda, Thomas Scialom (Meta AI Research), 2023-02-09. <a href="https://arxiv.org/abs/2302.04761">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 6 of 35 figures on this page were not found in [https://arxiv.org/abs/2302.04761](https://arxiv.org/abs/2302.04761): `9.6`, `18.4`, `95%`, `100%`, `19.3`, `1.59`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Schick et al. (Meta AI, arXiv 2302.04761, ICLR 2023) present **Toolformer** — a self-supervised method that teaches a language model (GPT-J 6.7B) to **decide which APIs to call, when, with what arguments, and how to incorporate results** via linearized calls `<API>a(i)→r</API>`. Given only a few human demonstrations per API, the LM annotates a subset of CCNet with candidate calls sampled where $p_M(\texttt{<API>}|...)$ exceeds $\tau_s$, executes them (Atlas QA, calculator, BM25 Wikipedia search over KILT, NLLB translation, calendar), and **filters** to keep only calls where $L_i^- - L_i^+ \ge \tau_f$ — i.e., the call+result reduces weighted next-token loss ($w_t\propto\max(0,1-0.2t)$) vs. no call. Fine-tuning on the resulting $C^*$ (same content as $C$) yields large zero-shot gains without sacrificing perplexity (WikiText 10.3 vs 10.3 for +CC): e.g., LAMA T-REx 33.2→**53.5** (beats GPT-3 39.8), ASDiv 9.6→**40.4** (97.9% calculator use), WebQS 18.4→**26.3** (99.3% search), Dateset 2.9→**27.3** (54.8% calendar), with ability emerging at **~775M** parameters. Tool use is learned from model feedback, not human labels, preserving generality.

## Key Takeaways

1. **Self-supervised bootstrapping loop (§2).** Three steps: **Sampling** ($p_i=p_M(\texttt{<API>}|P(x),x_{<i})>\tau_s$, top-$k$, sample $m$ calls), **Execution** (task-agnostic API), **Filtering** via loss delta $L_i^- - L_i^+$ (compares against empty and call-without-result). Merge survivors into $C^*$ as $x_{1:i-1} e(c,r) x_{i:n}$ and finetune with standard LM loss — same distribution as $C$, only helpful insertions retained.

2. **Five diverse tools (§3, Table 1).** QA (Atlas on NQ) → factual lookup; Calculator (4 ops, 2 decimals) → precise arithmetic; Wikipedia Search (BM25 KILT) → snippets requiring extraction; Translation (NLLB 600M + fastText LID) → low-resource languages; Calendar → "Today is ..." temporal grounding. Constraints: inputs/outputs as text, few demos for prompt $P(x)$. Heuristics to subset $C$ (e.g., ≥3 numbers for calc, App A) to keep annotation cheap.

3. **Zero-shot results without losing LM abilities (§4.2–4.3).** LAMA (no Wiki for fairness): 98.1% QA use, beats 25× larger GPT-3; Math: doubling/tripling vs GPT-3, and Toolformer-disabled already 14.8 vs 9.6 (finetune on API results improves own math); QA (QA tool disabled): 26.3/17.7/48.8 via Wiki search but still behind GPT-3 (BM25 weak, no interactive reformulation); MLQA: 63–95% MT use but +CC degrades some languages; Temporal: TempLAMA gain not via calendar (0.2%) but Wiki/QA (needs 2 calls), Dateset requires calendar and improves sharply; Perplexity unchanged when disabled.

4. **Decoding and emergence (§4.4–5).** Greedy trick: generate `<API>` if in top-$k$ ($k=10$ used) to increase tool use (T-REx 40.3%→98.1% as $k=1$→10, overall 47.8→53.5; WebQS 8.5%→100%, 19.3→26.3); at $k=1$ model is somewhat calibrated (NC performance > All). Scaling: no benefit <775M, large gap remains at 6.7B.

5. **Data-quality signal (§5 Table data-quality).** High $\Delta L$ examples are clearly helpful (e.g., "War memorial Flodden" Wiki 5.49, Nile length QA 2.08, "735/499" calc 1.59) vs low $\Delta L$ spam (Fast train Wiki 0.92). Threshold $\tau_f$ trades quantity vs quality (Table 2).

## Detailed Notes

### Approach Nuances
- Special tokens as "["/"]"/"->" avoid vocab change.
- Prefix vs insert: $e(c,r)$ as prefix for loss computation because $M$ not yet finetuned on $e$ in middle would hurt perplexity.
- At most one API per input in eval (prevent loops); inference: stop at "→", execute, append result+"</API>", continue.

### Experimental Details
- $C$ subset sizes after $\tau_f=1.0$: QA 18.5k, Wiki 61k, Calc 994, Calendar 20.5k, MT 1k (Table 2). Thresholds per tool App A.
- Finetune: batch 128, LR 1e-5, 10% warmup.
- Eval: LAMA (SQuAD/Google-RE/T-REx, exact in first 5), Math (ASDiv/SVAMP/MAWPS, first number), QA WebQS/NQ/TriviaQA (answer in first 20), MLQA 6 languages (10 words), TempLAMA 2010–2020 + Dateset templates.

### Limitations (§7)
- Single call, non-interactive search, weak BM25, cannot chain calendar+QA, translation-CCNet shift, only 5 simple tools.

### Related Work
- Distinguishes from human-annotated Komeili/Thoppilan and task-specific Gao/Parisi; builds on bootstrapping (STaR) and dataset generation via in-context learning.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 3 of 5 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2302.04761](https://arxiv.org/abs/2302.04761)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Language models can teach themselves to use external tools via simple APIs and achieve the best of both worlds."

> "We introduce Toolformer, a model trained to decide which APIs to call, when to call them, what arguments to pass, and how to best incorporate the results into future token prediction."

> "This is done in a self-supervised way, requiring nothing more than a handful of demonstrations for each API."

> "Toolformer achieves substantially improved zero-shot performance across a variety of downstream tasks, often competitive with much larger models, without sacrificing its core language modeling abilities."

> "The use of tools should be learned in a self-supervised way without requiring large amounts of human annotations ... The LM should not lose any of its generality and should be able to decide for itself when and how to use which tool."

## Concepts Introduced or Referenced

- [[tool-use]] — Self-supervised API calling ($c=(a_c,i_c)$, $e(c,r)$), decision of when/which/how, filtering by loss delta, inference interruption — canonical Toolformer contribution.
- [[function-calling]] — Earlier form of structured tool use; Toolformer is the bootstrapped predecessor to modern JSON Schema function calling.
- [[retrieval-augmented-generation]] — Wikipedia Search as retrieval tool; Atlas QA variant; demonstrates retrieval utility without separate retriever training.
- [[supervised-fine-tuning]] / [[parameter-efficient-fine-tuning]] — Finetuning on $C^*$ vs $C$; retains generality, comparable perplexity; could be combined with LoRA.
- [[hallucination]] — Mitigated via factual tools (QA/Search) — LAMA + QA results show grounding.

## Critical Assessment

**Strengths:** Elegantly minimal and general — self-supervision via $L_i^- - L_i^+$ directly measures usefulness for next-token prediction, requiring only few demos per tool and no human labels. Preserves perplexity while unlocking emergent tool use, with clear scaling and decoding analyses ($k$, emergence at 775M). Diverse tools cover orthogonal weaknesses (factual, numerical, linguistic, temporal) and human eval shows genuine gains. Reproducible with GPT-J.

**Limitations / Gaps:** BM25 and Atlas are weak non-interactive retrievers — QA gains behind GPT-3 hint at retrieval quality bottleneck and lack of query reformulation/browsing (later ReAct/MCP address). Single-call restriction prevents compositional reasoning (TempLAMA calendar+QA). CCNet finetuning degrades some languages. No comparison to RL-based tool learning or later function-calling SFT. Long-context vs tool tradeoffs not studied.

**Contradictions / Notes vs. existing wiki:** Extends [[tool-use]] which was taxonomy/structured-outputs heavy but lacked self-supervised bootstrapping origin — Toolformer fills that gap and is the precursor to [[function-calling]] and [[model-context-protocol]]. Complements [[retrieval-augmented-generation]] (RAG is retriever-centric, Toolformer shows LM-driven API selection) and [[react]] (Toolformer is single-step tool use, ReAct is interleaved reasoning+acting). No contradictions; perplexity preservation counters concern that tool finetuning harms LM. Should be cross-linked with [[supervised-fine-tuning]] as bootstrapped SFT variant.

---

**Source:** Toolformer: Language Models Can Teach Themselves to Use Tools by Timo Schick, Jane Dwivedi-Yu, Roberto Dessì, Roberta Raileanu, Maria Lomeli, Luke Zettlemoyer, Nicola Cancedda, Thomas Scialom (Meta AI Research) — <https://arxiv.org/abs/2302.04761>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
