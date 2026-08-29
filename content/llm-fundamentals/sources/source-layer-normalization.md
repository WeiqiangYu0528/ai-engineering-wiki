---
type: source-summary
title: "Layer Normalization"
summary: The July 2016 University of Toronto/Google paper that introduced Layer Normalization (LN), now the ubiquitous normalization in every Transformer block.
status: draft
visibility: public
author: "Jimmy Lei Ba, Jamie Ryan Kiros, Geoffrey E. Hinton"
source-type: paper
url: "https://arxiv.org/abs/1607.06450"
date-published: 2016-07-21
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
key-concepts:
  - "[[transformer]]"
  - "[[self-attention]]"
  - "[[pretraining]]"
key-entities:
  - "[[google-research]]"
aliases:
  - wiki/source-layer-normalization
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The July 2016 University of Toronto/Google paper that introduced Layer Normalization (LN), now the ubiquitous normalization in every Transformer block.</p>
<p class="kb-provenance">Jimmy Lei Ba, Jamie Ryan Kiros, Geoffrey E. Hinton, 2016-07-21. <a href="https://arxiv.org/abs/1607.06450">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary
The July 2016 University of Toronto/Google paper that introduced **Layer Normalization (LN)**, now the ubiquitous normalization in every [[transformer]] block. Transposing Batch Normalization (Ioffe & Szegedy 2015) from batch-dimension to layer-dimension — computing mean and variance over all summed inputs to neurons **within a single training case and layer** — LN performs identical computation at training and test time, imposes no mini-batch size constraints, and stabilizes hidden-state dynamics in recurrent networks by making them invariant to rescaling of the entire weight matrix and to rescaling of individual examples. Through invariance and Fisher-information geometry analysis plus 6 empirical tasks, Ba et al. show LN substantially accelerates training and improves generalization with negligible per-iteration cost.

## Key Takeaways
1. **LN definition:** For layer $l$ with $H$ hidden units and summed inputs $a_i^l$, $\mu^l = \frac{1}{H}\sum_i a_i^l$, $\sigma^l = \sqrt{\frac{1}{H}\sum_i (a_i^l - \mu^l)^2}$ (Eq. 3). Normalized $ \bar{a}_i^l = \frac{g_i}{\sigma^l}(a_i^l - \mu^l)+b_i$ where $g$ (gain) and $b$ (bias) are learned per neuron, applied before non-linearity $h_i^{l+1}=f(\bar{a}_i^l)$. Unlike BN (Eq. 2, statistics $E_{x\sim P(x)}[a_i]$ over batch/data), all units in a layer share $\mu,\sigma$ but each example has its own statistics.
2. **RNN specialization:** For recurrent step $a^t = W_{hh}h^{t-1}+W_{xh}x^t$, LN computes $\mu^t,\sigma^t$ per time-step and reuses single $g,b$ across steps: $h^t = f[ g/\sigma^t \odot (a^t - \mu^t)+b]$ (Eq. 4). Avoids BN's need for per-timestep statistics and running averages, handles variable-length sequences and online learning (batch size 1), stabilizes recurrent dynamics that otherwise grow/shrink leading to exploding/vanishing gradients.
3. **Invariance properties (Table 1):** LN invariant to scaling of entire weight matrix $W' = \delta W + 1\gamma^\top$ and to shifting all incoming weights, and to rescaling of single training case $x'=\delta x$ (since $\mu',\sigma'$ scale by $\delta$). BN invariant to weight-vector rescaling and dataset recentering but not per-example; weight norm invariant to weight-vector rescaling but neither data centering nor per-example. Proof via Eq. 6–7.
4. **Geometry — implicit learning-rate reduction:** Via Fisher information $\bar{F}_{ij}$ (Eq. 13) with $\chi_i = x - \partial\mu_i/\partial w_i - (a_i-\mu_i)/\sigma_i \partial\sigma_i/\partial w_i$, growth of $\|w_i\|$ by $2\times$ doubles $\sigma_i$ and halves Fisher curvature along $w_i$ → same parameter update has half effect, harder to change orientation with large norm → implicit early stopping near convergence. Learning gain $g$ more robust than learning weight magnitude in standard GLM because gain direction scaled by prediction error only, not input norm.
5. **Empirical wins across 6 tasks:** (1) Order embeddings MSCOCO (GRU+VGG) — LN 60% time to best validation (R@1 46.6→48.5 caption, 37.8→38.9 image); (2) Attentive Reader CNN QA — LN faster and better than baseline and both recurrent BN variants (LN gain 1.0 beats 0.1, not sensitive like BN); (3) Skip-thought BookCorpus 2400-d encoder — 1M steps SICK 0.842→0.854, MR 77.3→79.5 etc, 1.7M† further; (4) DRAW MNIST generation — converges ~2× faster (82.36→82.09 nats); (5) IAM Handwriting generation (700 avg length, batch 8) — comparable NLL much faster; (6) Permutation-invariant MNIST 784-1000-1000-10 — LN robust to batch 128 and 4, faster than BN. ConvNets: LN speedup over baseline but BN outperforms — boundary units have different statistics (further research needed).

## Detailed Notes

### Background (Section 2)
- Feed-forward: $a_i^l = w_i^{l\top} h^l$, $h_i^{l+1}=f(a_i^l+b_i^l)$ (1). Gradients in one layer dependent on previous layer outputs, especially correlated changes with ReLU. BN rescales via dataset expectation (2) requiring mini-batch empirical estimation → batch-size constraint, hard for RNNs.

### LN Design (Section 3)
- Fix mean/variance within layer to reduce covariate shift from correlated changes. Eq. 3 shared vs Eq. 2 per-neuron. Online regime batch size 1 allowed.
- RNN: single gain/bias shared over timesteps, vs BN per-timestep storage and inability to handle longer test sequences.

### Related Work (Section 4)
- Prior recurrent BN (Laurent et al. 2015; Amodei et al. 2015 Deep Speech 2; Cooijmans et al. 2016 recurrent BN with independent stats per step, gain init 0.1 critical) and weight norm (Salimans & Kingma 2016 L2 weight norm, re-parameterization) and Path-SGD (Neyshabur et al. 2015). LN not re-parameterization, different invariance.

### Analysis 5.1–5.2
- Unified form $h_i = f(g_i/\sigma_i (a_i-\mu_i)+b_i)$ (5).
- Table 1 invariance matrix and derivations Eqs. 6–7.
- Geometry: Riemannian metric via KL → Fisher $ds^2 ≈ 1/2 δ^T F(θ)δ$ (8)–(9). GLM exponential family (10)–(11), multi-dim GLM Kronecker Fisher (12), normalized GLM block $\bar{F}_{ij}$ (13)–(14). Two insights: implicit LR reduction and more robust magnitude learning.

### Experiments Detail
- Defaults $g=1,b=0$.
- Order-embeddings: Theano, Adam, every 300 iterations checkpoint on 5 test splits 1k images/5k caps.
- Attentive Reader: unidirectional, CNN corpus 4-sentence passages, anonymized, compare LN vs BN everywhere vs BN LSTM only.
- Skip-thought: contiguous sentence encoding/decoding, BookCorpus, CNMeM enables no overhead despite 2400-dim.
- DRAW: 64 glimpses, 256 LSTM, Adam batch128, fixed binarization.
- Handwriting: 3×400 LSTM, 20 bivariate Gaussian output, input 3 chars + window 57, 3.7M weights.
- MNIST FC: apply only to hidden layers not softmax logits (scale determines confidence).
- ConvNets note boundary receptive fields rarely activated.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 3 of 3 passages in this section could not be located in the stored source ([https://arxiv.org/abs/1607.06450](https://arxiv.org/abs/1607.06450)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "We transpose batch normalization into layer normalization by computing the mean and variance used for normalization from all of the summed inputs to the neurons in a layer on a single training case."

> "Unlike batch normalization, layer normalization performs exactly the same computation at training and test times. It is also straightforward to apply to recurrent neural networks by computing the normalization statistics separately at each time step."

> "In a layer normalized RNN, the normalization terms make it invariant to re-scaling all of the summed inputs to a layer, which results in much more stable hidden-to-hidden dynamics."

## Concepts Introduced or Referenced
- [[transformer]] — LN is core sub-layer formula $\text{LN}(x + \text{Sublayer}(x))$ in original 2017 Transformer (post-norm) and modern pre-norm/RMSNorm variants; residual+LN enables stable gradient flow through stacked self-attention and FFN.
- [[self-attention]] — LN stabilizes attention input scales; modern LLMs use RMSNorm (Zhang & Sennrich 2019) as simplified LN without mean subtraction.
- [[pretraining]] — LN enables deeper/wider pretraining, online learning, and long-sequence stability (handwriting 700 length analogue to long-context LLMs).
- [[inference]] — LN vs BN inference difference; LN no running stats, deterministic single-example.
- Batch Normalization, Weight Normalization, Fisher information, natural gradient (Amari 1998).

## Critical Assessment
- **Strengths:** Simple, batch-size agnostic, single-case invariant, test-train consistent; strong theory linking invariance to geometry and implicit early stopping; broad empirical validation across vision, language, generation with existing public codes; default $g=1$ insensitive (vs BN 0.1 sensitivity).
- **Limitations:** Boundary-effect assumption breaks for ConvNets where spatial statistics not homogeneous → BN superior there; later work shows pre-norm vs post-norm placement matters for deep Transformers (Xiong et al. 2020); LN subtracts mean which RMSNorm argues unnecessary for LLMs; GLM Fisher analysis assumes block-diagonal approximation, idealized.
- **Evolution:** Direct ancestor of LayerNorm in Transformer (Vaswani et al. 2017 cites Ba et al. 2016), then RMSNorm, DeepNorm, ScaleNorm. Understanding LN vs BN crucial for choosing normalization in sequence models vs vision models.
- **Connection to this ingest:** While assigned as Week3 Transformers extra, complements tokenization/multilinguality: longer token sequences from fragmented languages increase sequence lengths where LN's stability for long sequences (demonstrated on 700-length handwriting) becomes more relevant — though Ahia et al. show fragmentation hurts utility regardless of LN.

---

**Source:** Layer Normalization by Jimmy Lei Ba, Jamie Ryan Kiros, Geoffrey E. Hinton — <https://arxiv.org/abs/1607.06450>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
