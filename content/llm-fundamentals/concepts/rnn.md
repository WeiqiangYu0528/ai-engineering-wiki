---
type: concept
title: "Recurrent Neural Network"
summary: A Recurrent Neural Network (RNN) is a neural architecture for modeling sequences where the same parameters are reused at each time step and hidden state is passed forward, giving the model memory of past inputs.
visibility: public
aliases:
  - RNN
  - Recurrent Language Model
  - Vanilla RNN
  - Elman Network
  - wiki/rnn
tags:
  - llm-fundamentals
created: 2026-08-25
updated: 2026-08-25
status: draft
sources:
  - "[[source-learning-long-term-dependencies]]"
  - "[[source-difficulty-training-rnns]]"
  - "[[source-layer-normalization]]"
  - "[[source-history-human-language-understanding]]"
  - "CS224n 2026 Lecture 04: Language Models and Recurrent Neural Networks (Slides)"
related:
  - "[[backpropagation]]"
  - "[[transformer]]"
  - "[[self-attention]]"
  - "[[pretraining]]"
  - "[[embeddings]]"
  - "[[positional-encoding]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">A Recurrent Neural Network (RNN) is a neural architecture for modeling sequences where the same parameters are reused at each time step and hidden state is passed forward, giving the model memory of past inputs.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/llm-fundamentals/concepts/embeddings">Embeddings</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/backpropagation">Backpropagation</a></li><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/llm-fundamentals/concepts/embeddings">Embeddings</a></li><li><a href="/llm-fundamentals/concepts/positional-encoding">Positional Encoding</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-learning-long-term-dependencies">Learning Long-Term Dependencies with Gradient Descent is Difficult</a></li><li><a href="/llm-fundamentals/sources/source-difficulty-training-rnns">On the Difficulty of Training Recurrent Neural Networks</a></li><li><a href="/llm-fundamentals/sources/source-layer-normalization">Layer Normalization</a></li><li><a href="/llm-fundamentals/sources/source-history-human-language-understanding">Human Language Understanding &amp; Reasoning</a></li></ul></nav>
</aside>

## Overview

A **Recurrent Neural Network (RNN)** is a neural architecture for modeling sequences where the same parameters are reused at each time step and hidden state is passed forward, giving the model memory of past inputs. Formalized as $x_t = F(x_{t-1}, u_t, \theta)$ — commonly $x_t = W_{rec}\,\sigma(x_{t-1}) + W_{in} u_t + b$ or $h_t = \tanh(W_{hh} h_{t-1} + W_{xh} x_t + b)$ — and trained via [[backpropagation]] through time (BPTT), the vanilla RNN was the workhorse of NLP from the 1980s until 2017. Its strength (unbounded memory via recurrence) is also its fatal training flaw: the product of Jacobians $\partial x_t/\partial x_k = \prod_{t \ge i > k} W_{rec}^T \text{diag}(\sigma'(x_{i-1}))$ causes **vanishing and exploding gradients** that make learning long-term dependencies exponentially hard (Bengio et al. 1994 in [[source-learning-long-term-dependencies]]; Pascanu et al. 2013 in [[source-difficulty-training-rnns]]). This limitation directly motivated gated variants (LSTM 1997, GRU 2014), LayerNorm-stabilized RNNs (Ba et al. 2016 in [[source-layer-normalization]]), and ultimately the non-recurrent [[transformer]] that dominates today.

## Key Ideas

- **Recurrence as memory:** Unlike feed-forward nets that treat each input independently, RNNs maintain hidden state $h_t$ summarizing history $u_{1..t}$. Unrolled in time, the network is a deep computation graph with shared weights across layers (Fig. 2 in Pascanu): depth equals sequence length, enabling context-dependent predictions essential for language modeling $P(w_t | w_{<t})$.
- **Training by BPTT:** Loss $E = \sum_t E_t$ ($E_t = \mathcal{L}(x_t)$) gradient is sum of temporal contributions $ \partial E_t/\partial\theta = \sum_{k \le t} (\partial E_t/\partial x_t)(\partial x_t/\partial x_k)(\partial^+ x_k/\partial\theta)$. Term $\partial x_t/\partial x_k$ transports error backward in time. Long-term contributions ($k \ll t$) vs short-term ($k \approx t$).
- **Vanishing vs exploding — eigenvalue condition:** Let $\lambda_1$ be largest eigenvalue magnitude of $W_{rec}$, $\gamma = \sup |\sigma'|$ (1 for tanh, $1/4$ for sigmoid). Sufficient for vanishing: $|\lambda_1| < 1/\gamma \Rightarrow ||\partial x_{k+1}/\partial x_k|| \le \eta <1 \Rightarrow ||\partial E_t/\partial x_t \cdot \partial x_t/\partial x_k|| \le \eta^{t-k} ||\partial E_t/\partial x_t||$ decays exponentially (Pascanu Eq. 6–7). Necessary for exploding: $|\lambda_1| > 1/\gamma$. Linear case: tight threshold $|\lambda_1| < 1$ vanishes, $>1$ explodes via power iteration.
- **Dynamical-systems view:** State space partitioned into basins of attraction to attractors (stable fixed points storing memories). Bifurcation boundaries (attractor appears/disappears) are global events neither necessary nor sufficient for exploding. **Sufficient is crossing a basin boundary** — small parameter change switches trajectory to different attractor, yielding large $\Delta x_t$ and large gradient when $t$ large (Pascanu Fig. 3, $w_{rec}=5$ diagram). Input-driven view folds input into time-varying maps $F_t = \tilde{F} \circ U_t$ with $U_t(x)=x+W_{in}u_t$.
- **Geometric view — high-curvature walls:** Single-unit model $x_t = w\sigma(x_{t-1})+b$ with $E_{50}=(\sigma(x_{50})-0.7)^2$ after 50 steps (Pascanu Fig. 6) shows steep wall perpendicular to exploding direction $v$ (eigenvector of $\lambda_1$). When gradient explodes ($||(\partial E_t/\partial\theta) v|| \ge C\alpha^t$, $\alpha>1$) curvature Hessian's leading eigenvector also explodes and aligns with $v$, causing SGD to jump across valley. Gradient norm clipping (scale to threshold) stays near wall in smooth region.
- **Fixed trade-off (Bengio 1994):** Robust latching (hyperbolic attractors contracting, $|\lambda_1|<1$ stable to noise) vs efficiently trainable by gradient descent cannot be simultaneously satisfied for long spans. Explains empirical fixation on short-term dependencies.

## How It Works

```
         ┌─────────────────────────────────────────────┐
         │  Recurrent cell (shared weights)             │
u_t ──►  │  a_t = W_rec σ(h_{t-1}) + W_in u_t + b       │  ──► h_t ──► y_t = softmax(W_y h_t)
         │  h_t = σ(a_t)  or  f(LayerNorm(a_t))        │             │
         └──────────┬──────────────────────────────────┘             ▼
                    │  h_t is fed to next step                     Loss E_t
                    │                                                │
                    └────────────────────────────────────────────────┘
                                           BPTT unrolled over T steps
```

1. **Forward:** For $t=1..T$, compute $h_t$ from $h_{t-1}$ and input embedding $u_t$ (word vector via [[embeddings]]). Apply output head for next-word prediction: $P(w_{t+1}|w_{\le t}) = \text{softmax}(W_y h_t)$.
2. **Loss:** Cross-entropy $-\sum_t \log P(w_{t+1} | w_{\le t})$ aggregated.
3. **Backward (BPTT):** Unroll graph, backprop gradients through $T$ steps, accumulating $\partial E/\partial W_{rec}$ etc. Clip norm if $||\hat{g}||\ge\text{threshold}$: $\hat{g} \leftarrow \text{threshold}/||\hat{g}|| \cdot \hat{g}$ (Pascanu Algorithm 1).
4. **Solutions to vanishing:** Architectural — **LSTM** (Hochreiter & Schmidhuber 1997) linear self-loop $c_t = f_t \odot c_{t-1} + i_t \odot \tilde{c}_t$ with input/forget/output gates; **GRU**; **LayerNorm RNN** $h^t = f[g/\sigma^t \odot (a^t-\mu^t)+b]$ (Ba et al. Eq. 4); initialization (orthogonal/identity $W_{rec}$); regularization $\Omega = \sum_k (||\partial E/\partial x_{k+1} \cdot \partial x_{k+1}/\partial x_k||/||\partial E/\partial x_{k+1}|| -1)^2$ (Pascanu soft norm preservation). Optimization — Hessian-Free + structural damping, curriculum (short→long sequences), teacher forcing.
5. **Why superseded:** Sequential $O(N)$ path, no parallelization, $O(N)$ max path length between distant tokens vs [[transformer]]'s $O(1)$ attention. RNN LM (CS224n Lecture 04: $P(\text{sentence}) = \prod P(w_t|w_{<t})$ via RNN) is now taught as predecessor to Transformer LM.

## Practical Implications

- **Pedagogical core:** CS224n Week 2 (Lectures 03–04, `cs224n-2026-lecture03-neuralnets.pdf` + `cs224n-2026-lecture04-rnnlm.pdf`, the private layer) uses RNN LM to teach language modeling fundamentals — chain rule, BPTT, perplexity ($2^{H}$, $\exp(E)$), and why naive RNNs fail on long dependencies (Bengio/Pascanu readings).
- **Clipping lives on:** `torch.nn.utils.clip_grad_norm_(params, 1.0)` default in Transformer training is Pascanu's remedy; still essential even with Adam.
- **When RNNs still used:** Resource-constrained sequence tasks, streaming, certain bio/RL settings, and state-space models (Mamba, S4) which revive recurrence with selective gating and parallel scan — addressing the same stability issue with modern math.
- **Evaluation legacy:** Pathological synthetic benchmarks (Temporal Order up to length 200, addition, noiseless memorization) in Pascanu remain stress tests for long-memory; SGD-CR 100% success up to 200 demonstrates clipping+regularization viability before LSTM dominance.
- **Historical bridge:** Understanding RNN failure modes is prerequisite for appreciating why [[self-attention]]'s constant path length and [[transformer]] parallelism were breakthroughs (see [[source-history-human-language-understanding]] Era 4).

## Connections

- Trained by [[backpropagation]] via BPTT; product-of-Jacobians structure is the source of vanishing/exploding diagnosed in [[source-learning-long-term-dependencies]] (theory) and [[source-difficulty-training-rnns]] (refined mechanics + geometry).
- Stabilized by [[source-layer-normalization]] (Ba et al. §3.1): LayerNorm RNN computes $\mu^t,\sigma^t$ per step with shared $g,b$, invariant to rescaling $W$ and $x$, stabilizing hidden dynamics on 700-length handwriting sequences.
- Replaced by [[transformer]] which eliminates recurrence, replaces $O(N)$ sequential steps with $O(1)$ parallel [[self-attention]] and $O(N^2)$ attention over [[positional-encoding]] + context, trained with same clipped backprop.
- Input embeddings via [[embeddings]] (word2vec/GloVe) feed $u_t$ to recurrence; early contextual representations (ELMo) stacked BiLSTM RNNs before BERT's bidirectional encoder.
- Language modeling objective $P(w_t|w_{<t})$ shared with modern autoregressive [[pretraining]] — RNN LM is the direct ancestor of decoder-only pretraining.
- History narrated in [[source-history-human-language-understanding]]: Era 2–4 transition from rule-based SHRDLU → statistical → deep RNN → Transformer.

## Open Questions

- Can modern recurrent revivals (Mamba/S4, RWKV) match Transformer long-context in-context learning with sub-quadratic $O(N)$ and constant memory, or does attention's quadratic retrieval remain essential for few-shot?
- What minimal gating/normalization suffices for stable recurrence at 128K+ context without attention — does LayerNorm alone (as in 2016) plus orthogonal init approach modern long-context viability, or is linear-attention hybrid required?
- How to diagnose and mitigate residual vanishing in deep RNN stacks (e.g., 3×400 LSTM for handwriting) without full gating overhead?

## Sources

- [[source-learning-long-term-dependencies]]
- [[source-difficulty-training-rnns]]
- [[source-layer-normalization]]
- [[source-history-human-language-understanding]]

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
