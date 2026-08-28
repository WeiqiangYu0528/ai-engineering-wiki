---
type: source-summary
title: Parameter-Efficient Transfer Learning for NLP (Houlsby et al., ICML 2019)
summary: The canonical adapter-tuning paper (Google Research).
status: verified
visibility: public
author: "Neil Houlsby, Andrei Giurgiu, Stanisław Jastrzȩbski, Bruna Morrone, Quentin de Laroussilhe, Andrea Gesmundo, Mona Attariyan, Sylvain Gelly"
source-type: paper
url: "https://arxiv.org/abs/1902.00751"
date-published: 2019-02-02
date-ingested: 2026-08-26
tags:
  - fine-tuning
key-concepts:
  - "[[parameter-efficient-fine-tuning]]"
  - "[[lora]]"
  - "[[bert]]"
  - "[[supervised-fine-tuning]]"
verified-by: agent
verified-on: 2026-08-27
---

# Parameter-Efficient Transfer Learning for NLP (Houlsby et al., ICML 2019)

## Summary

The canonical **adapter-tuning** paper (Google Research). Houlsby et al. insert small bottleneck modules ("adapters") into every Transformer layer of a frozen pretrained BERT and train only those per downstream task. On GLUE, adapters reach within **0.4%** of full fine-tuning while training only **3.6%** of parameters per task (1.3× total BERT-LARGE size vs 9× for per-task fine-tuning); similar results hold on 17 additional classification tasks (1.14% params/task) and SQuAD v1.1 (F1 90.4 vs 90.7 at 2% params). Adapters yield *compact* and *extensible* multi-task models without catastrophic forgetting.

## Key Takeaways

1. **Bottleneck adapter architecture**: two serial adapters per Transformer block (after attention projection, after FFN), applied before the residual add; down-project d→m, nonlinearity, up-project m→d; params = 2md+d+m; internal skip + near-zero init ⇒ identity at start (init too far from identity breaks training).
2. **Near-parity at ~3% params**: GLUE 80.0 vs 80.4; optimal bottleneck varies per task (256 MNLI, 8 RTE); fixed 64 costs little.
3. **Adapters auto-prioritize higher layers**: removing layers 0–4 adapters barely hurts MNLI; removing all collapses to majority class — distributed yet hierarchical adaptation.
4. **LN-only tuning insufficient** (~3.5–4% drops); top-k layer fine-tuning dominated by adapters at matched budgets.
5. Architecture ablations (deeper adapters, extra norms, parallel placement) gave no significant gains — simplicity wins.

## Detailed Notes

- Framing: online/streaming task setting (cloud services); contrasts feature-based transfer χ_v(φ_w(x)), full fine-tuning, and adapter tuning ψ_{w,v}(x) with |v|≪|w|.
- Related-work positioning: inspired by convolutional adapters for multi-domain vision (Rebuffi et al. 2017); vs ELMo which only *reads* inner layers while adapters *write* to them; concurrent PALs (Stickland & Murray 2019).
- Relation to continual/multi-task learning: shared frozen base ⇒ perfect memory across tasks without simultaneous data access.
- Code: github.com/google-research/adapter-bert.

## Notable Quotes

> "Adapter modules yield a compact and extensible model; they add only a few trainable parameters per task, and new tasks can be added without revisiting previous ones."

> "On GLUE, we attain within 0.4% of the performance of full fine-tuning, adding only 3.6% parameters per task."

## Concepts Introduced or Referenced

- [[parameter-efficient-fine-tuning]] — this source is the AdapterH lineage root named in its four-lineages taxonomy; supplies the latency caveat later quantified in [[source-lora]] (sequential depth overhead).
- [[lora]] — LoRA's motivation section benchmarks directly against these adapters; parallel low-rank design removes the added-depth inference cost.
- [[bert]] / [[supervised-fine-tuning]] — the experimental substrate and the baseline paradigm being made efficient.
- [[instruction-tuning]] — later large-scale SFT inherits the "adapt cheaply" question this paper first answered for BERT-era transfer.

## Critical Assessment

Defining strength: clean controlled comparison + practical deployment framing; spawned the entire PEFT subfield. Limitations: encoder-era tasks (no generation); serial-adapters latency cost left unmeasured until LoRA's analysis; bottleneck-size sweeps modest by modern standards.

---

**Source:** Parameter-Efficient Transfer Learning for NLP (Houlsby et al., ICML 2019) by Neil Houlsby, Andrei Giurgiu, Stanisław Jastrzȩbski, Bruna Morrone, Quentin de Laroussilhe, Andrea Gesmundo, Mona Attariyan, Sylvain Gelly — <https://arxiv.org/abs/1902.00751>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
