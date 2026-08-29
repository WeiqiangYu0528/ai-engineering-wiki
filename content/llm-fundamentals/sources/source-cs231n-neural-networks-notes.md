---
type: source-summary
title: CS231n Notes — Neural Networks 1 & Optimization 2 (Backprop Intuitions)
summary: Two companion chapters of Stanford's CS231n course notes, assigned as CS224n Week 2 background.
status: draft
visibility: public
author: "Andrej Karpathy and CS231n teaching staff (Stanford)"
source-type: code-doc
url: "http://cs231n.github.io/neural-networks-1/"
date-published: 2016-01-01
date-ingested: 2026-08-26
tags:
  - llm-fundamentals
key-concepts:
  - "[[backpropagation]]"
  - "[[transformer]]"
  - "[[pretraining]]"
aliases:
  - wiki/source-cs231n-neural-networks-notes
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Two companion chapters of Stanford's CS231n course notes, assigned as CS224n Week 2 background.</p>
<p class="kb-provenance">Andrej Karpathy and CS231n teaching staff (Stanford), 2016-01-01. <a href="http://cs231n.github.io/neural-networks-1/">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

Two companion chapters of Stanford's CS231n course notes, assigned as CS224n Week 2 background. **Neural Networks 1** (`cs231n.github.io/neural-networks-1`) builds the architecture story: neurons → activation functions (sigmoid/tanh/ReLU/Leaky ReLU/Maxout) → fully-connected layers as matrix operations → universal approximation → why bigger nets with regularization beat small nets. **Optimization 2** (`cs231n.github.io/optimization-2`) builds backpropagation intuition as gradient flow through real-valued circuits: chain rule via local gates, staged computation, add/max/multiply gate patterns, and vectorized gradients.

## Key Takeaways

1. **Activation function doctrine**: ReLU default ("Never use sigmoid"); sigmoid kills gradients by saturation and is not zero-centered; tanh preferred over sigmoid; dying-ReLU monitoring matters (up to 40% dead units at high LR).
2. **Backprop as circuits**: each gate computes its output plus local gradients independently; backward pass chains them multiplicatively; gates "communicate" whether outputs should increase/decrease.
3. **Staged computation discipline**: cache forward variables; use `+=` at forks; never differentiate symbolically in full — decompose into easy-local-gradient stages.
4. **Gate patterns in backward flow**: add distributes equally; max routes to the winner; multiply swaps-and-scales inputs (→ preprocessing scale directly changes weight-gradient magnitude).
5. **Capacity vs regularization**: larger networks train more reliably (better minima, lower variance); control overfitting with regularization strength, not size reduction.

## Detailed Notes

### neural-networks-1 (architecture)
- Neuron model from biology (rate-code approximation) to `σ(Σw_i x_i + b)`; single neuron = logistic regression or linear SVM depending on loss.
- Layer-wise organization: acyclic graphs of fully-connected layers; N-layer convention excludes input; output layer has no activation.
- Forward pass = matrix multiplications interwoven with nonlinearity; batches evaluate in parallel.
- Universal approximators (Cybenko 1989) — mathematically cute, practically weak (indicator-bump functions also universally approximate); depth helps empirically, especially for hierarchical data like images.
- Sizing: bigger nets + stronger regularization wins (loss-surface argument: many good minima at scale).

### optimization-2 (backprop)
- Worked example `(x+y)z` → circuit visualization; sigmoid gate collapse `σ'(x) = (1−σ(x))σ(x)`.
- Staged backprop example `f(x,y)=(x+σ(y))/(σ(x)+(x+y)²)` with full forward/backward variable table.
- Vectorized matrix-multiply gradients with dimension-analysis tip; pointer to Learned-Miller's vecDerivs.pdf.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 3 passages in this section could not be located in the stored source ([http://cs231n.github.io/neural-networks-1/](http://cs231n.github.io/neural-networks-1/), [http://cs231n.github.io/neural-networks-1/](http://cs231n.github.io/neural-networks-1/)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Use the ReLU non-linearity, be careful with your learning rates... Never use sigmoid."

> "The derivative on each variable tells you the sensitivity of the whole expression on its value."

> "In practice it is always better to use [regularization] methods to control overfitting instead of the number of neurons."

## Concepts Introduced or Referenced

- [[backpropagation]] — the canonical intuition-first treatment; complements Learning Representations by Back-Propagating Errors (history), [[source-cs224n-gradient-notes]] (matrix calculus rigor), [[source-review-differential-calculus]] (prerequisites), and [[source-derivatives-backprop-vectorization]] (worked derivations). Same author lineage as [[source-yes-you-should-understand-backprop]].
- [[transformer]] — the activation-function and capacity lessons carry into modern LLM blocks (GELU/SwiGLU replacing ReLU; residual+LayerNorm institutionalizing the vanishing-gradient fixes).
- [[pretraining]] — "big net + regularization" foreshadows modern scaling practice.

## Critical Assessment

Timeless pedagogy but pre-transformer specifics: "3-layer nets rarely benefit from more depth" is true only for plain MLPs — depth is central for ConvNets and transformers. The notes themselves flag this contrast. No contradictions with existing wiki content; enriches the failure-mode numbers already cited in [[backpropagation]].

---

**Source:** CS231n Notes — Neural Networks 1 & Optimization 2 (Backprop Intuitions) by Andrej Karpathy and CS231n teaching staff (Stanford) — <http://cs231n.github.io/neural-networks-1/>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
