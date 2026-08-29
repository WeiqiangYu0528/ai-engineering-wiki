---
type: source-summary
title: "Derivatives, Backpropagation, and Vectorization (CS231n handout)"
summary: CS231n's worked-derivation handout bridging scalar calculus to production-ready vectorized gradients.
status: draft
visibility: public
author: "Stanford CS231n teaching staff"
source-type: code-doc
url: "http://cs231n.stanford.edu/handouts/derivatives.pdf"
date-published: 2017-01-01
date-ingested: 2026-08-26
tags:
  - llm-fundamentals
key-concepts:
  - "[[backpropagation]]"
  - "[[rnn]]"
  - "[[transformer]]"
aliases:
  - wiki/source-derivatives-backprop-vectorization
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">CS231n's worked-derivation handout bridging scalar calculus to production-ready vectorized gradients.</p>
<p class="kb-provenance">Stanford CS231n teaching staff, 2017-01-01. <a href="http://cs231n.stanford.edu/handouts/derivatives.pdf">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

CS231n's worked-derivation handout bridging scalar calculus to production-ready vectorized gradients. It derives derivatives through computation graphs, walks backpropagation through a two-layer fully-connected network by hand, and shows how per-example gradients collapse into matrix expressions (`dW = dD·Xᵀ`, `dX = Wᵀ·dD`). It is the paper companion to the web notes captured in [[source-cs231n-neural-networks-notes]] and the practical sequel to [[source-review-differential-calculus]].

## Key Takeaways

1. Backprop = organized bookkeeping of local gradients chained multiplicatively along a computation graph.
2. Vectorization rules: gradient shapes must match parameter shapes; dimension analysis uniquely determines each matrix product.
3. Hand-derived gradients precede autograd trust — the same discipline CS224n Assignment 1/2 demands before switching to PyTorch.

## Detailed Notes

- Binary PDF captured to [http://cs231n.stanford.edu/handouts/derivatives.pdf](http://cs231n.stanford.edu/handouts/derivatives.pdf) (206 KB); placeholder markdown at [http://cs231n.stanford.edu/handouts/derivatives.pdf](http://cs231n.stanford.edu/handouts/derivatives.pdf)
- Companion reference cited by the optimization-2 notes: Erik Learned-Miller's `vecDerivs.pdf` for deeper matrix-derivative conventions.

## Notable Quotes

> (placeholder — content not transcribed from PDF; see local asset)

## Concepts Introduced or Referenced

- [[backpropagation]] — canonical worked example set; complements [[source-yes-you-should-understand-backprop]]' debugging view with forward derivation mechanics.
- [[rnn]] / [[transformer]] — the same graph-chaining pattern extends to BPTT unrolls and attention blocks.

## Critical Assessment

Pedagogically dense but terse; assumes comfort with matrix notation from the start. Pairs best with the gentler cs231n.github.io optimization-2 walkthrough. No conflicts with existing wiki content on backprop.

---

**Source:** Derivatives, Backpropagation, and Vectorization (CS231n handout) by Stanford CS231n teaching staff — <http://cs231n.stanford.edu/handouts/derivatives.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
