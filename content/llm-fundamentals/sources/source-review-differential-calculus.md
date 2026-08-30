---
type: source-summary
title: Review of Differential Calculus (CS224n Supplementary Reading)
summary: "The CS224n prerequisite math handout reviewing single- and multi-variable differential calculus: derivatives and partial derivatives, the chain rule, gradients of vector-valued functions, and Jacobians."
status: draft
visibility: public
author: "Stanford CS224n course staff"
source-type: code-doc
url: "https://web.stanford.edu/class/cs224n/readings/review-differential-calculus.pdf"
date-published: 2025-01-01
date-ingested: 2026-08-26
tags:
  - llm-fundamentals
key-concepts:
  - "[[backpropagation]]"
  - "[[transformer]]"
aliases:
  - wiki/source-review-differential-calculus
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The CS224n prerequisite math handout reviewing single- and multi-variable differential calculus: derivatives and partial derivatives, the chain rule, gradients of vector-valued functions, and Jacobians.</p>
<p class="kb-provenance">Stanford CS224n course staff, 2025-01-01. <a href="https://web.stanford.edu/class/cs224n/readings/review-differential-calculus.pdf">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

The CS224n prerequisite math handout reviewing single- and multi-variable differential calculus: derivatives and partial derivatives, the chain rule, gradients of vector-valued functions, and Jacobians. It supplies exactly the derivative machinery students need before deriving neural-network backpropagation by hand, feeding directly into the more advanced [[source-cs224n-gradient-notes]] (matrix calculus for softmax + cross-entropy) and into CS231n's backprop notes ([[source-cs231n-neural-networks-notes]]).

## Key Takeaways

1. Derivatives as sensitivity/rate-of-change; partial derivatives and the gradient vector.
2. Chain rule as the engine of credit assignment through composed functions.
3. Jacobians of vector-valued functions — the object that generalizes "the gradient" to layer-level transformations.

## Detailed Notes

- Binary PDF captured to [https://web.stanford.edu/class/cs224n/readings/review-differential-calculus.pdf](https://web.stanford.edu/class/cs224n/readings/review-differential-calculus.pdf) (142 KB); markdown is a placeholder (raw record ([https://web.stanford.edu/class/cs224n/readings/review-differential-calculus.pdf](https://web.stanford.edu/class/cs224n/readings/review-differential-calculus.pdf))).
- Position in curriculum: Week 2 (neural networks + backprop) warm-up; pairs with [[source-cs231n-neural-networks-notes]]' staged-computation workflow and [[source-derivatives-backprop-vectorization]]'s vectorized gradients.

## Notable Quotes

> (placeholder — content not transcribed from PDF; see local asset)

## Concepts Introduced or Referenced

- [[backpropagation]] — chain rule review is the mathematical core of backprop; this note is its on-ramp.
- [[transformer]] — every modern architecture's training loop rests on these derivative rules applied at scale via autograd.

## Critical Assessment

As a refresher it is deliberately narrow (no proofs); students wanting rigor should pair with a full multivariable text. No contradictions with existing pages — extends the lineage already documented around Learning Representations by Back-Propagating Errors.

---

**Source:** Review of Differential Calculus (CS224n Supplementary Reading) by Stanford CS224n course staff — <https://web.stanford.edu/class/cs224n/readings/review-differential-calculus.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
