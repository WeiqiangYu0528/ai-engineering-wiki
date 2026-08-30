---
type: concept
title: "Backpropagation"
summary: Backpropagation (backprop, generalized delta rule, reverse-mode automatic differentiation) is the algorithm that makes training deep neural networks possible.
visibility: public
aliases:
  - Backprop
  - Reverse-Mode Automatic Differentiation
  - Generalized Delta Rule
  - wiki/backpropagation
tags:
  - llm-fundamentals
created: 2026-08-25
updated: 2026-08-26
status: draft
sources:
  - "Learning Representations by Back-Propagating Errors"
  - "[[source-yes-you-should-understand-backprop]]"
  - "[[source-history-human-language-understanding]]"
  - "[[source-difficulty-training-rnns]]"
  - "[[source-learning-long-term-dependencies]]"
  - "[[source-cs231n-neural-networks-notes]]"
  - "[[source-review-differential-calculus]]"
  - "[[source-derivatives-backprop-vectorization]]"
  - "CS224n 2026 Lecture 03: Neural Network Foundations — Matrix Calculus & Backpropagation (Slides)"
related:
  - "[[transformer]]"
  - "[[rnn]]"
  - "[[pretraining]]"
  - "[[self-attention]]"
  - "[[embeddings]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Backpropagation (backprop, generalized delta rule, reverse-mode automatic differentiation) is the algorithm that makes training deep neural networks possible.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/rnn">Recurrent Neural Network</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li><li><a href="/llm-fundamentals/concepts/embeddings">Embeddings</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-yes-you-should-understand-backprop">Yes you should understand backprop</a></li><li><a href="/llm-fundamentals/sources/source-history-human-language-understanding">Human Language Understanding &amp; Reasoning</a></li><li><a href="/llm-fundamentals/sources/source-difficulty-training-rnns">On the Difficulty of Training Recurrent Neural Networks</a></li><li><a href="/llm-fundamentals/sources/source-learning-long-term-dependencies">Learning Long-Term Dependencies with Gradient Descent is Difficult</a></li><li><a href="/llm-fundamentals/sources/source-cs231n-neural-networks-notes">CS231n Notes — Neural Networks 1 &amp; Optimization 2 (Backprop Intuitions)</a></li><li><a href="/llm-fundamentals/sources/source-review-differential-calculus">Review of Differential Calculus (CS224n Supplementary Reading)</a></li><li><a href="/llm-fundamentals/sources/source-derivatives-backprop-vectorization">Derivatives, Backpropagation, and Vectorization (CS231n handout)</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview

**Backpropagation** (backprop, generalized delta rule, reverse-mode automatic differentiation) is the algorithm that makes training deep neural networks possible. Introduced to its modern form by Rumelhart, Hinton & Williams (1986) in Learning Representations by Back-Propagating Errors, it computes gradients of a scalar loss with respect to every weight in a feed-forward or recurrent network by applying the chain rule of calculus backward through the computation graph. Every LLM — from [[rnn]] language models through [[transformer]]s — is trained by iterating forward pass → loss → backward pass → gradient-descent update, at scales now reaching trillions of tokens and thousands of GPUs.

## Key Ideas

- **Chain rule as credit assignment:** Given loss $E = \frac12 \sum_j (t_j - y_j)^2$ (Nature paper) or cross-entropy, for weight $w_{ji}$ from unit $i$ to $j$: $\partial E/\partial w_{ji} = -\delta_j x_{ji}$, where $\delta_j$ is the error signal at $j$. For output units $\delta_j = (t_j - y_j) y_j(1-y_j)$ (logistic derivative); for hidden units $\delta_j = y_j(1-y_j) \sum_k \delta_k w_{kj}$ — error is propagated backward weighted by fan-out connections. Modern vectorized form in `gradient-notes.pdf` (CS224n matrix calculus notes, source held privately) derives Jacobians for softmax, cross-entropy, and embedding lookups.
- **Differentiable activations prerequisite:** Requires smooth nonlinearity (logistic in 1986, now ReLU/SwiGLU/GELU) so derivatives exist; threshold perceptrons cannot be trained this way — the breakthrough over Minsky & Papert.
- **Hidden units learn distributed representations:** Without hand-coded features, hidden units spontaneously encode task regularities (family-tree demo: 6 hidden units learn compact codes clustering families). This emergence of internal representations is the philosophical leap to representation learning that underlies [[pretraining]] and [[embeddings]].
- **Efficiency — reverse mode:** Cost of one backward pass is comparable to one forward pass ($O(\text{weights})$), independent of number of parameters, via dynamic programming that reuses intermediate $\delta$'s. Contrasts forward-mode differentiation ($O(\text{weights} \times \text{parameters})$).
- **Training loop:** Forward propagation → loss computation → backprop (compute $\partial E/\partial\theta$ for all $\theta$) → SGD/Adam update $\theta \leftarrow \theta - \eta \cdot \partial E/\partial\theta$ (plus momentum, Adam moments, weight decay, gradient clipping). Repeated over billions of examples.
- **Backprop is a "leaky abstraction" (Karpathy):** autograd in [[source-yes-you-should-understand-backprop]] computes *correct* gradients but not necessarily *useful* ones — 1e-12 is correct yet practically zero; 1e+8 blows up weights. When training fails the error message is silence, so gradient-flow understanding is what separates debuggers from script-runners.
- **Failure signatures with quantitative thresholds:**
  - *Sigmoid saturation:* $\sigma'(x)\le 0.25$ → gradients shrink as $0.25^L$ ($\approx 9.5\times10^{-7}$ over 10 layers); empirical layer-0 vs layer-10 ratio 28,000×. Fix: ReLU-family activations in hidden layers; sigmoid only for gates/probability outputs.
  - *Dead ReLUs:* one oversized update pins a unit negative for all inputs → zero output, zero gradient, permanent (Karpathy observed 40% dead = wasted capacity). Detect by counting units inactive over the whole set (>5–10% → LR too high); fix via Leaky ReLU/GELU + init hygiene.
  - *Vanishing/exploding:* inherent to products of Jacobians $O(s^L)$; RNN worst case $W_{hh}^T$ (spectral radius 1.1 → norm ~13,780 at T=100) — see [[rnn]] and [[source-difficulty-training-rnns]].
- **Verification & monitoring discipline:** centered finite-difference gradient checking $(f(x{+}\varepsilon)-f(x{-}\varepsilon))/2\varepsilon$ with relative error < 1e-7 excellent / > 1e-3 bug (run at init, small model, norm off — now `torch.autograd.gradcheck`); **update-to-weight ratio ≈ 1e-3** as the single best health metric; per-layer grad norms within ~10× of each other.
- **Backprop as circuits (CS231n intuition):** [[source-cs231n-neural-networks-notes]] (optimization-2) teaches backprop as gradient flow through real-valued circuits: each gate independently computes its output plus *local* gradients, and the backward pass chains them multiplicatively — "gates communicate whether they want their outputs to increase or decrease, and how strongly." Three reusable patterns: the **add gate distributes** gradients unchanged to all inputs, the **max gate routes** them to the winning input only, and the **multiply gate swaps-and-scales** its inputs — which is why preprocessing scale directly changes weight-gradient magnitude. The same notes' staged-computation discipline (cache forward variables; `+=` at forks) is the practical implementation of the chain rule, and its sigmoid collapse $\sigma'(x)=(1-\sigma(x))\sigma(x)$ is the model example of gate fusion.

## How It Works

```
Input x ──► Linear (W x + b) ──► Activation σ ──► ... ──► Logits ──► Softmax ──► Loss E
              │                    │                                ▲                │
              │                    │                                │                │
              └────────────────────┴────────────────────────────────┴─── δ_out ──────┘
                                      ▲
                                      │  δ_hidden = σ'(net) * Σ δ_next * W_next
                                      │
                              Gradients ∂E/∂W = δ * x^T,  ∂E/∂b = δ
                                      │
                                      ▼
                              Optimizer step (SGD/Adam) with optional clip:
                                if ||g|| ≥ threshold: g ← threshold/||g||·g
```

1. **Forward:** Compute net inputs $a_j = \sum_i w_{ji} x_i$, activations $y_j = \sigma(a_j)$, propagate layer by layer.
2. **Loss:** Compare output $y$ to target $t$ (squared error historically, cross-entropy for language modeling: $-\sum \log P(w_t|w_{<t})$).
3. **Backward:** Initialize $\delta$ at output from $\partial E/\partial y$, multiply by $\sigma'(a)$ to get $\delta_{\text{net}}$, propagate backward: $\delta^{(l)} = (W^{(l+1)T} \delta^{(l+1)}) \odot \sigma'(a^{(l)})$.
4. **Gradients:** $\nabla_{W^{(l)}} E = \delta^{(l+1)} h^{(l)T}$, $\nabla_{b^{(l)}} E = \delta^{(l+1)}$.
5. **Update:** Via SGD, momentum, or Adam ($\beta_1,\beta_2$, bias correction), with gradient norm clipping (Pascanu et al. 2013 Algorithm 1) to handle exploding gradients in [[rnn]]s/[[transformer]]s.

For [[rnn]]s, this becomes **Backpropagation Through Time (BPTT)**: unroll the recurrent graph over time steps ($x_t = F(x_{t-1}, u_t, \theta)$), treat it as a deep feed-forward net with shared weights, and backprop through the unrolled product of Jacobians $\prod \partial x_i/\partial x_{i-1}$ — whose eigenvalues determine vanishing vs exploding (see [[rnn]]).

## Practical Implications

- **The learning path is scaffolded:** prerequisites ([[source-review-differential-calculus]] — derivatives, chain rule, Jacobians) → circuit intuitions + activation-function doctrine ([[source-cs231n-neural-networks-notes]]) → fully worked vectorized derivations ([[source-derivatives-backprop-vectorization]]: `dW = dD·Xᵀ`, `dX = Wᵀ·dD`, dimension analysis) → matrix-calculus rigor ([[source-cs224n-gradient-notes]]) → autograd. Hand derivation before framework trust remains the CS224n/CS231n pedagogical contract.
- **Universal training substrate:** From 1986 toy family trees to 405B-parameter Llama 3 on 15.6T tokens, algorithm unchanged — scale and hardware (GPUs, FSDP, bf16) do the work. Understanding backprop is prerequisite for debugging training (loss spikes, NaNs, gradient norms).
- **Gradient notes are the hands-on companion:** CS224n `gradient-notes.pdf` walks through numerator-layout conventions, Jacobian of $softmax$ and $- \log$ composition, and embedding gradient sparsity — essential for Assignment 2 where students derive word2vec gradients by hand before PyTorch autograd takes over.
- **Clipping still default:** Despite Adam, every modern LLM training script clips gradient norm to 1.0 (Pascanu's remedy) to survive the high-curvature walls diagnosed in [[source-difficulty-training-rnns]].
- **Foundation for analysis:** Vanishing/exploding diagnosed in Bengio 1994 and Pascanu 2013 are properties of the back-propagated product of Jacobians — backprop is both the solution and the source of difficulty.
- **Auto-diff abstraction:** Modern frameworks (PyTorch Autograd, JAX) automate the chain rule, but manual derivation ability remains critical for custom kernels (FlashAttention), efficient checkpointing, and second-order methods.
- **Karpathy debugging workflow (from [[source-yes-you-should-understand-backprop]]):** check loss at init ≈ $-\ln(1/N)$ → overfit a tiny batch to ~0 loss → monitor per-layer gradient norms → inspect activation distributions for saturation → count dead units → gradient-check custom code. Know when autograd *technically* fails: argmax (zero a.e.), sampling (need Gumbel-Softmax/REINFORCE), naive `log(softmax)` → −inf, silent `.detach()` graph truncation. The 2016 fixes matured but never went away: ReLU+init → +residuals/LayerNorm/GELU in [[transformer]]s; clipping → +LR warmup & mixed-precision grad scaling at [[pretraining]] scale.
- **Residual connections as gradient guarantee:** skip connections give $\partial y/\partial x = \partial F/\partial x + 1$ — an identity path that survives even when $F$ kills gradients; this is why ResNets train 1000+ layers and every Transformer sublayer wraps attention/FFN with residuals (institutionalized vanishing-gradient fix).

## Connections

- Derived in Learning Representations by Back-Propagating Errors; re-derived in vectorized modern form in `gradient-notes.pdf`.
- Applied to [[rnn]]s via BPTT — where Bengio 1994 proves long-term dependencies make backprop exponentially inefficient, and Pascanu 2013 refines with eigenvalue, dynamical, and geometric views.
- Powers [[transformer]] training: [[self-attention]]'s $O(1)$ path replaces RNN's $O(N)$ product-of-Jacobians, mitigating vanishing while still requiring clipping for exploding.
- Accumulates knowledge during [[pretraining]] — next-token loss minimized by backprop over trillions of tokens compresses internet into weights (Karpathy compression view in [[source-deep-dive-into-llms-like-chatgpt]]).
- Creates [[embeddings]] — embedding matrix rows are weights updated by backprop; hidden-unit distributed codes prefigure contextual vectors.
- Historical arc narrated in [[source-history-human-language-understanding]] (Era 4: back-prop of errors from prediction task back to word representations).
- Pedagogy lineage: [[source-cs231n-neural-networks-notes]] (Karpathy-authored CS231n notes — same author as [[source-yes-you-should-understand-backprop]]) supplies the activation-function survey (ReLU default, "never use sigmoid") whose failure modes the debugging essay quantifies; [[source-derivatives-backprop-vectorization]] and [[source-review-differential-calculus]] are its math on-ramps.

## Open Questions

- Can alternative credit assignment (forward-mode, zeroth-order, synthetic gradients, or non-gradient optimization like simulated annealing explored in Bengio 1994 §5) rival backprop's efficiency for extremely long horizons where vanishing dominates?
- How does backprop interact with normalization (LayerNorm/RMSNorm) to shape loss landscape curvature — does post-norm vs pre-norm placement affect exploding-wall geometry of Pascanu Fig. 6?
- At trillion-parameter mixture-of-experts scale, can we preserve backprop's efficiency while routing gradients sparsely through experts?

## Sources

- Learning Representations by Back-Propagating Errors
- [[source-yes-you-should-understand-backprop]]
- [[source-history-human-language-understanding]]
- [[source-difficulty-training-rnns]]
- [[source-learning-long-term-dependencies]]
- [[source-cs231n-neural-networks-notes]] — CS231n neural-networks-1 + optimization-2: circuit intuition, staged computation, gate patterns, activation doctrine.
- [[source-review-differential-calculus]] — CS224n prerequisite handout: derivatives, chain rule, Jacobians.
- [[source-derivatives-backprop-vectorization]] — CS231n handout: worked backprop derivations and vectorized gradient rules.

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
