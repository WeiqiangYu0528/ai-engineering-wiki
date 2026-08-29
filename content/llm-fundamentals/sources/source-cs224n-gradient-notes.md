---
type: source-summary
title: "CS224n Gradient Notes — Matrix Calculus for Backprop"
summary: The 202 KB CS224n supplemental note (readings/gradient-notes.pdf, Last-Modified 2025-09-05, [https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf](https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf)) is the hands-on companion to Lecture 03 for mastering Backpropagation by hand before PyTorch…
status: draft
visibility: public
author: "Stanford CS224n Staff (Diyi Yang, Yejin Choi)"
source-type: note
url: "https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf"
date-published: 2025-09-05
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
key-concepts:
  - "[[backpropagation]]"
  - "[[rnn]]"
  - "[[transformer]]"
  - "[[embeddings]]"
key-entities:
  - "[[stanford-university]]"
aliases:
  - wiki/source-cs224n-gradient-notes
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The 202 KB CS224n supplemental note (readings/gradient-notes.pdf, Last-Modified 2025-09-05, [https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf](https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf)) is the hands-on companion to Lecture 03 for mastering Backpropagation by hand before PyTorch…</p>
<p class="kb-provenance">Stanford CS224n Staff (Diyi Yang, Yejin Choi), 2025-09-05. <a href="https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

The 202 KB CS224n supplemental note (`readings/gradient-notes.pdf`, Last-Modified 2025-09-05, [https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf](https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf)) is the **hands-on companion to Lecture 03** for mastering [[backpropagation]] by hand before PyTorch Autograd is allowed. In ~20 pages it fixes notation (numerator vs denominator layout), then derives Jacobians and gradients for the exact operations students differentiate in Assignment 2: affine layers, nonlinearities, softmax + cross-entropy composition ($ \nabla_z \text{CE}(\text{softmax}(z), y)$ simplifies to $\hat{y}-y$), embedding lookup sparsity, and the chain rule through a two-layer window-based NER classifier. The note explicitly bridges Rumelhart et al. 1986 (Learning Representations by Back-Propagating Errors) abstract delta rule to the vectorized, batched implementation used in modern [[transformer]]/[[rnn]] code, and diagnoses common shape-mismatch and layout errors.

## Key Takeaways

1. **Layout convention:** CS224n adopts numerator layout ($ \partial y/\partial x$ shape $|y|\times|x|$), so gradient of scalar loss w.r.t. column vector is row vector transposed for update; mixing with denominator-layout references is a common bug source explicitly warned.
2. **Softmax-cross-entropy simplification:** Derives $\partial \text{CE}/\partial z = \hat{y} - y$ (predicted minus one-hot) — the simplification that makes language-model gradient intuitive and that Lecture 03's backprop walkthrough relies on.
3. **Embedding gradients are sparse:** $\partial E/\partial W_e$ touches only rows for tokens in the window/batch — explains Word2Vec NEG sparse row updates and Assignment 2's efficient implementation note ("Rows not columns in DL packages!").
4. **Chain-rule templates:** Provides reusable patterns for $y = Wx+b \rightarrow \partial E/\partial W = \delta x^T$, $\partial E/\partial x = W^T \delta$, and element-wise $y=\sigma(a)$ Jacobian diagonal — the same patterns that underpin BPTT product-of-Jacobians $\prod W_{rec}^T \text{diag}(\sigma')$ analyzed in [[source-difficulty-training-rnns]].

## Detailed Notes

- **Structure:** Scalar/vector/matrix derivative definitions → Jacobian layouts → chain rule examples → softmax derivation → cross-entropy → two-layer network cache-and-backprop → embedding-specific sparsity tip → assignment-specific NER window gradient walkthrough.
- **Assignment 2 link:** Students first compute analytical gradients (this note) then verify via `gradCheck` before implementing `word2vec` and `ner` modules; teaches debugging via dimension analysis before relying on autograd.
- **Asset:** Binary at [https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf](https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf) (202706 bytes), placeholder [https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf](https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf).

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 1 passages in this section could not be located in the stored source ([https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf](https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "This note reviews matrix calculus conventions and derives gradients for common NLP operations — affine, softmax, cross-entropy, and embeddings — so you can implement backprop by hand and sanity-check autograd."

## Concepts Introduced or Referenced
- [[backpropagation]] — The algorithm whose matrix-calculus implementation is detailed.
- [[rnn]] — BPTT extension where Jacobian product and layout choice determine vanishing/exploding analysis.
- [[transformer]] — Deeper stacks using same chain-rule primitives with LayerNorm and attention Jacobians.
- [[embeddings]] — Embedding matrix sparse gradients as concrete application.

## Critical Assessment
Indispensable practical note: fills the gap between 1986 theory and code. Narrow scope intentionally (no attention/RNN Jacobians beyond generic templates) — for recurrent specifics see [[source-difficulty-training-rnns]] §1 and [[source-learning-long-term-dependencies]] §3. No contradictions; complements Lecture 03 slides which gesture at gradients but leave algebra to this note.

---

**Source:** CS224n Gradient Notes — Matrix Calculus for Backprop by Stanford CS224n Staff (Diyi Yang, Yejin Choi) — <https://web.stanford.edu/class/cs224n/readings/gradient-notes.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
