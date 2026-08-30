---
type: source-summary
title: "On the Difficulty of Training Recurrent Neural Networks"
summary: The 2013 ICML paper (arXiv:1211.5063v2, 16 Feb 2013) by Pascanu, Mikolov & Bengio — the canonical Week 2 RNN companion to Bengio 1994 in CS224n 2026 — revisits the vanishing and exploding gradient problems with an…
status: draft
visibility: public
author: "Razvan Pascanu, Tomas Mikolov, Yoshua Bengio"
source-type: paper
url: "https://arxiv.org/abs/1211.5063"
date-published: 2013-02-16
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
key-concepts:
  - "[[rnn]]"
  - "[[backpropagation]]"
  - "[[transformer]]"
  - "[[self-attention]]"
key-entities:
  - "[[stanford-university]]"
  - "[[google-research]]"
aliases:
  - wiki/source-difficulty-training-rnns
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The 2013 ICML paper (arXiv:1211.5063v2, 16 Feb 2013) by Pascanu, Mikolov &amp; Bengio — the canonical Week 2 RNN companion to Bengio 1994 in CS224n 2026 — revisits the vanishing and exploding gradient problems with an…</p>
<p class="kb-provenance">Razvan Pascanu, Tomas Mikolov, Yoshua Bengio, 2013-02-16. <a href="https://arxiv.org/abs/1211.5063">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 3 of 4 figures on this page were not found in [https://arxiv.org/abs/1211.5063](https://arxiv.org/abs/1211.5063): `0.7`, `3.80`, `3.46`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The 2013 ICML paper (arXiv:1211.5063v2, 16 Feb 2013) by Pascanu, Mikolov & Bengio — the canonical **Week 2 RNN companion** to Bengio 1994 in CS224n 2026 — revisits the vanishing and exploding gradient problems with an analytical, geometric, and dynamical-systems lens, then derives two simple yet enduring remedies. For the canonical [[rnn]] $x_t = W_{rec} \sigma(x_{t-1}) + W_{in} u_t + b$ and cost $E = \sum_t E_t$ with $\partial E/\partial\theta = \sum_{t,k} (\partial E_t/\partial x_t) (\partial x_t/\partial x_k) (\partial^+ x_k/\partial\theta)$ where $\partial x_t/\partial x_k = \prod_{t\ge i>k} W_{rec}^T \text{diag}(\sigma'(x_{i-1}))$, the authors tighten the eigenvalue conditions for vanishing vs exploding, show exploding corresponds to crossing basin-of-attraction boundaries (not necessarily bifurcations) creating high-curvature walls in the loss, and propose **gradient norm clipping** (scale down when norm exceeds threshold, always a descent direction) plus a soft **vanishing-gradient regularization** preferring norm-preserving Jacobian transport. Tested on 6 pathological synthetic tasks (Temporal Order up to length 200) and natural polyphonic music / char-level Penn Treebank language modeling, the SGD-CR variant achieves 100% success up to 200 steps and SOTA for RNNs at the time, while norm clipping remains the default stabilizer in modern [[transformer]] training.

## Key Takeaways

1. **Analytical mechanics tightened:** Sufficient for vanishing: largest eigenvalue $|\lambda_1| < 1/\gamma$ of $W_{rec}$ ($\gamma = \sup|\sigma'|$, 1 for tanh, $1/4$ for sigmoid) ⇒ $||\partial x_{k+1}/\partial x_k|| \le \eta <1$ ⇒ long-term term $\eta^{t-k}$ decays exponentially; necessary for exploding: $|\lambda_1| > 1/\gamma$. For linear case (σ = identity) power iteration gives tight necessary/sufficient $|\lambda_1|<1$ vanishes / $>1$ explodes. Re-derives Bengio 1994 single-unit analysis to matrix-product generality (Eqs. 3–7).
2. **Dynamical-systems view refined beyond Doya 1993:** State space partitioned into basins of attraction to point attractors; bifurcation boundaries (where attractors appear/disappear/shape-change) are global events neither necessary nor sufficient for explosion. Sufficient is **crossing a basin boundary** — local event where small change in bias/parameter switches trajectory to different attractor, yielding large $\Delta x_t$ and large gradient for large $t$. Illustrates with 1-unit bifurcation diagram ($b$ vs $x_\infty$, $w_{rec}=5$, Fig. 3) showing boundaries between $b_1$ (new attractor emerges) and $b_2$ (attractor disappears) plus input-driven folding $F_t = \tilde{F} \circ U_t$ with $U_t(x)=x+W_{in}u_t$.
3. **Geometric view — high-curvature walls:** One-unit model $x_t = w\sigma(x_{t-1})+b$ error surface $E_{50}=(\sigma(x_{50})-0.7)^2$ after 50 steps (Fig. 6) exhibits steep walls perpendicular to exploding direction $v$ (eigenvector of largest eigenvalue). When gradient explodes ($||(\partial E_t/\partial\theta) v|| \ge C\alpha^t$, $\alpha>1$), curvature (Hessian leading eigenvector) also explodes and aligns with $v$. SGD step jumps across valley disrupting learning; dashed clipped trajectory stays near wall in smooth low-curvature region exploring other descent directions. Explains why Hessian-Free (full Hessian, re-estimated each step) succeeded vs other second-order averaging methods, but clipping alone suffices if valley wide.
4. **Two practical remedies (still ubiquitous):** **(a) Norm clipping Algorithm 1:** $\hat{g} \leftarrow \partial E/\partial\theta$; if $||\hat{g}||\ge\text{threshold}$ then $\hat{g} \leftarrow \text{threshold}/||\hat{g}|| \cdot \hat{g}$ — ensures descent direction (unlike element-wise clipping), handles abrupt norm jumps unlike adaptive LR methods (Duchi AdaGrad), threshold set via average norm statistics, insensitive within task/model size. **(b) Vanishing regularization:** $\Omega = \sum_k (||\partial E/\partial x_{k+1} \cdot \partial x_{k+1}/\partial x_k||/||\partial E/\partial x_{k+1}|| -1)^2$, i.e., prefer Jacobian preserves error norm in relevant direction $\partial E/\partial x_{k+1}$ (not all directions), computed efficiently via immediate derivative $\partial^+\Omega/\partial W_{rec}$ using BPTT + Theano, acknowledging need for clipping when regularizer pushes toward exploding regime.
5. **Empirical — long memory without LSTM:** Pathological benchmarks from Hochreiter & Schmidhuber 1997: **Temporal Order** (stream of symbols, two special in {A,B} at beginning/middle, classify order A-A/A-B/B-A/B-B at end) log-sequence-length success plot (Fig. 7): SGD and SGD-C fail >20 due to vanishing; SGD-CR 100% up to length 200 (max in Martens & Sutskever 2011), single model 50–200 lengths generalizes to $2\times$ longer unseen. Also solves addition, multiplication, 3-bit temporal order, random permutation, noiseless memorization (5-bit and 20+ bit). Natural tasks: Piano-midi.de / Nottingham / MuseData polyphonic music (NLL/step) and char-level Penn Treebank LM + 5th-char-ahead variant — SGD-CR statistically significant SOTA for RNNs (e.g., Nottingham test 3.80→3.46).

## Detailed Notes

### §1 Training Recurrent Networks and BPTT Reformulation
- Generic $x_t = F(x_{t-1},u_t,\theta)$ vs specific $W_{rec}\sigma(x_{t-1})+W_{in}u_t+b$ (Eqs. 1–2).
- Cost $E=\sum_t E_t$, gradients re-written sum-of-products (Eqs. 3–5) making transport factor $\partial x_t/\partial x_k$ explicit. Distinguishes immediate derivative $\partial^+ x_k/\partial\theta$ (treating $x_{k-1}$ constant) for $\Omega$ derivation.

### §2.1 Mechanics — Power Iteration and General Bounds
- Linear model power iteration analysis → eigenvalue conditions; nonlinear extension via $||\text{diag}(\sigma')||\le\gamma$ and submultiplicativity leading to Eq. 6–7. Note fixed $W_{rec}$ vs time-varying Jacobian product nuance.

### §2.2 Input-Driven Extension
- Autonomous dynamics $F$ vs input-driven family $F_t$; decomposition $\tilde{F}(x)=W_{rec}\sigma(x)+b$ plus $U_t(x)=x+W_{in}u_t$ (Fig. 5) allows studying $\tilde{F}$ attractors while $U_t$ drives system across basins.

### §2.3 Geometry and Second-Order Implication
- Single-unit curvature explosion: linear $x_t=x_0 w^t$, $\partial x_t/\partial w = t x_0 w^{t-1}$, $\partial^2 x_t/\partial w^2 = t(t-1)x_0 w^{t-2}$ both explode together. Hypothesis general high-dim wall → Hessian-Free's two advantages (full Hessian not diagonal, fresh per-step estimate handles abrupt curvature walls).

### §3.1 Previous Solutions Survey
- L1/L2 on $W_{rec}$ (ensures spectral radius <1, single attractor, can't latch); Doya pre-programming / teacher forcing (initializes in right regime, needs target per step, doesn't prevent basin crossing); LSTM (fixed self-loop 1 + gates, addresses vanishing not exploding); Hessian-Free + structural damping (forces small $\partial x_t/\partial\theta$); Echo State / leaky integration $x_k=\alpha x_{k-1}+(1-\alpha)\sigma(\dots)$ as low-pass filter not general; Mikolov element-wise clipping (empirically good, backbone of proposal).

### §4 Experiments Setup
- Theano implementation; threshold tuned per dataset but reported insensitive; synthetic tasks varying lengths per SGD step; music datasets from Boulanger-Lewandowski 2012, characters via Mikolov 2012.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 4 of 4 passages in this section could not be located in the stored source ([https://arxiv.org/abs/1211.5063](https://arxiv.org/abs/1211.5063)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "There are two widely known issues with properly training Recurrent Neural Networks, the vanishing and the exploding gradient problems detailed in Bengio et al. (1994)."

> "Crossing boundaries between basins of attraction is a *local* event, and it is *sufficient* for the gradients to explode. It is however *neither necessary nor sufficient* to cross a bifurcation for the gradients to explode, as bifurcations are global events that could have no effect locally."

> "If both the gradient and the leading eigenvector of the curvature are aligned with the exploding direction **v**, it follows that the error surface has a steep wall perpendicular to **v** (and consequently to the gradient)."

> "The proposed clipping is simple to implement and computationally efficient, but it does however introduce an additional hyper-parameter, namely the threshold. One good heuristic for setting this threshold is to look at statistics on the average norm over a sufficiently large number of updates."

## Concepts Introduced or Referenced
- [[rnn]] — The model whose training difficulty is anatomized; BPTT, product-of-Jacobians, spectral radius, attractors/basins/bifurcations all defined here.
- [[backpropagation]] — BPTT reformulation and the gradient whose norm is clipped / whose transport is regularized.
- [[transformer]] — The architectural successor whose training still uses norm clipping (now with Adam, threshold 1.0) to tame exploding gradients without recurrence.
- [[self-attention]] — The $O(1)$ path mechanism that avoids the $\prod \partial x_i/\partial x_{i-1}$ product altogether.
- Gradient clipping, vanishing gradient regularization, Hessian-Free, structural damping, Echo State, LSTM (surveyed solutions).

## Critical Assessment
- **Strengths:** Tri-perspective analysis (analytical + dynamical + geometric) is unusually comprehensive; clean necessary/sufficient eigenvalue refinement of Bengio 1994; basin-crossing sufficient condition corrects Doya's bifurcation hypothesis; Fig. 6 geometric wall gives intuitive justification for clipping that naive gradient-norm intuition misses; Algorithm 1's norm clipping is trivial, efficient, and proved durable — default in PyTorch/TensorFlow LLM training a decade later; synthetic benchmarks demonstrate long memory up to 200 steps without architectural change, fair comparison to LSTM/Hessian-Free.
- **Limitations:** Vanishing regularizer $\Omega$ is soft, immediate-derivative approximation, increases tendency to explode (acknowledged), later superseded by architectural fixes (LSTM/GRU gate initialization, orthogonal/identity $W_{rec}$) and normalization (LayerNorm in recurrent and transformer); analysis largely autonomous or input-as-bounded-noise, not fully input-driven chaos; Hessian-Free comparison is informal; natural language results modest by modern scale.
- **Evolution:** LSTM/GRU (1997/2014) solved vanishing via gating; residual connections, LayerNorm, and attention eliminated need for $\Omega$; but clipping persists. Understanding this paper is prerequisite for why [[transformer]] attention was needed and why modern LLM training still clips grads.
- **For wiki:** Completes [[rnn]] and [[backpropagation]] backstory; directly explains code default `clip_grad_norm_`. No contradiction with Bengio 1994 — refinement, not replacement.

---

**Source:** On the Difficulty of Training Recurrent Neural Networks by Razvan Pascanu, Tomas Mikolov, Yoshua Bengio — <https://arxiv.org/abs/1211.5063>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
