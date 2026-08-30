---
type: concept
title: "Transformer"
summary: The Transformer is the foundational deep learning architecture underpinning virtually all modern Large Language Models (GPT-4, Claude, Llama).
visibility: public
aliases:
  - Decoder-Only Transformer
  - Encoder-Decoder Transformer
  - Self-Attention Architecture
  - wiki/transformer
tags:
  - llm-fundamentals
created: 2026-08-23
updated: 2026-08-26
status: draft
sources:
  - "[[source-attention-is-all-you-need]]"
  - "[[source-the-illustrated-transformer]]"
  - "[[source-transformer-explainer]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
  - "[[source-bert-pre-training-of-deep-bidirectional-transformers]]"
  - "[[source-llama-3-herd-of-models]]"
  - "[[source-layer-normalization]]"
  - "[[source-neural-machine-translation-subword-units]]"
  - "[[source-unsupervised-cross-lingual-representation-learning]]"
  - "[[source-history-human-language-understanding]]"
  - "[[source-learning-long-term-dependencies]]"
  - "[[source-difficulty-training-rnns]]"
  - "Learning Representations by Back-Propagating Errors"
  - "Jurafsky & Martin SLP3 Chapter 9: Masked Language Models (syllabus: 'The Transformer')"
  - "[[source-roformer]]"
  - "[[source-image-transformer]]"
  - "[[source-music-transformer]]"
  - "[[source-cs336-lecture01-overview-tokenization]]"
  - "[[source-cs336-lecture02-pytorch-resource-accounting]]"
  - "[[source-cs336-lecture03-architectures]]"
  - "[[source-cs336-lecture04-attention-moe]]"
  - "[[source-cs336-lecture05-gpus-tpus]]"
  - "CS224n 2026 Lecture 05: Attention and Transformers (Slides)"
related:
  - "[[self-attention]]"
  - "[[positional-encoding]]"
  - "[[tokenization]]"
  - "[[multilinguality]]"
  - "[[pretraining]]"
  - "[[bert]]"
  - "[[llama-3]]"
  - "[[inference]]"
  - "[[rnn]]"
  - "[[backpropagation]]"
  - "[[thinking-models]]"
  - "[[mixture-of-experts]]"
  - "[[scaling-laws]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">The Transformer is the foundational deep learning architecture underpinning virtually all modern Large Language Models (GPT-4, Claude, Llama).</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/llm-fundamentals/concepts/positional-encoding">Positional Encoding</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li><li><a href="/llm-fundamentals/concepts/positional-encoding">Positional Encoding</a></li><li><a href="/llm-fundamentals/concepts/tokenization">Tokenization</a></li><li><a href="/llm-fundamentals/concepts/multilinguality">Multilinguality</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/llm-fundamentals/concepts/bert">BERT</a></li><li><a href="/llm-fundamentals/entities/llama-3">Llama 3</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/llm-fundamentals/concepts/rnn">Recurrent Neural Network</a></li><li><a href="/llm-fundamentals/concepts/backpropagation">Backpropagation</a></li><li><a href="/llm-fundamentals/concepts/thinking-models">Thinking Models</a></li><li><a href="/llm-fundamentals/concepts/mixture-of-experts">Mixture of Experts</a></li><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-attention-is-all-you-need">Attention Is All You Need</a></li><li><a href="/llm-fundamentals/sources/source-the-illustrated-transformer">The Illustrated Transformer</a></li><li><a href="/llm-fundamentals/sources/source-transformer-explainer">Transformer Explainer: Learning LLM Transformers with Interactive Visual Explanation and Experimentation</a></li><li><a href="/llm-fundamentals/sources/source-deep-dive-into-llms-like-chatgpt">Deep Dive into LLMs like ChatGPT</a></li><li><a href="/llm-fundamentals/sources/source-bert-pre-training-of-deep-bidirectional-transformers">BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding</a></li><li><a href="/llm-fundamentals/sources/source-llama-3-herd-of-models">The Llama 3 Herd of Models</a></li><li><a href="/llm-fundamentals/sources/source-layer-normalization">Layer Normalization</a></li><li><a href="/llm-fundamentals/sources/source-neural-machine-translation-subword-units">Neural Machine Translation of Rare Words with Subword Units</a></li><li><a href="/llm-fundamentals/sources/source-unsupervised-cross-lingual-representation-learning">Unsupervised Cross-lingual Representation Learning at Scale</a></li><li><a href="/llm-fundamentals/sources/source-history-human-language-understanding">Human Language Understanding &amp; Reasoning</a></li><li><a href="/llm-fundamentals/sources/source-learning-long-term-dependencies">Learning Long-Term Dependencies with Gradient Descent is Difficult</a></li><li><a href="/llm-fundamentals/sources/source-difficulty-training-rnns">On the Difficulty of Training Recurrent Neural Networks</a></li><li><a href="/llm-fundamentals/sources/source-roformer">RoFormer: Enhanced Transformer with Rotary Position Embedding</a></li><li><a href="/llm-fundamentals/sources/source-image-transformer">Image Transformer</a></li><li><a href="/llm-fundamentals/sources/source-music-transformer">Music Transformer: Generating Music with Long-Term Structure</a></li><li><a href="/llm-fundamentals/sources/source-cs336-lecture01-overview-tokenization">CS336 Lecture 01 — Overview, Tokenization</a></li><li><a href="/llm-fundamentals/sources/source-cs336-lecture02-pytorch-resource-accounting">CS336 Lecture 02 — PyTorch (einops), Resource Accounting (FLOPs, Memory, Arithmetic Intensity)</a></li><li><a href="/llm-fundamentals/sources/source-cs336-lecture03-architectures">CS336 Lecture 03 — Architectures, Hyperparameters</a></li><li><a href="/llm-fundamentals/sources/source-cs336-lecture04-attention-moe">CS336 Lecture 04 — Attention Alternatives and Mixture of Experts</a></li><li><a href="/mlops/sources/source-cs336-lecture05-gpus-tpus">CS336 Lecture 05 — GPUs, TPUs</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Overview
The **Transformer** is the foundational deep learning architecture underpinning virtually all modern Large Language Models (GPT-4, Claude, Llama). Introduced by Vaswani et al. (2017) at [[google-research]] in [[source-attention-is-all-you-need]], visually popularized by [[jay-alammar]] in [[source-the-illustrated-transformer]], and interactively dissected in [[source-transformer-explainer]], the architecture eliminated recurrence ([[rnn]]s, LSTMs) and convolutions in favor of pure **[[self-attention]]**, enabling massive parallelization during training on GPUs. It directly resolves the vanishing/exploding gradient trade-off diagnosed for [[rnn]]s in [[source-learning-long-term-dependencies]] (Bengio et al. 1994) and refined in [[source-difficulty-training-rnns]] (Pascanu et al. 2013) by replacing the $O(N)$ product-of-Jacobians recurrence with $O(1)$ parallel attention, a narrative arc chronicled historically in [[source-history-human-language-understanding]] (Manning 2022) and learned via [[backpropagation]] (Learning Representations by Back-Propagating Errors).

## Key Ideas
- **Elimination of Recurrence:** Traditional sequence models process tokens sequentially ($O(N)$ operations), precluding GPU parallelization. Transformers compute token interactions in parallel with a constant $O(1)$ maximum path length for signal flow.
- **Architectural Variations:**
  - **Encoder-Decoder (Original 2017):** Designed for sequence-to-sequence tasks (machine translation). The Encoder creates bidirectional representations, while the Decoder uses causal masking and cross-attention over encoder states (e.g., T5, BART).
  - **Decoder-Only (Modern Standard):** Dominant architecture for generative LLMs (GPT, Llama, Mistral). Stacks causal self-attention layers with autoregressive next-token prediction.
  - **Encoder-Only (BERT):** Non-causal bidirectional attention for classification and embeddings. Jurafsky & Martin (Ch 9, SLP3 Chapter 9: Masked Language Models (syllabus: 'The Transformer')) stress this is *one modification* to the decoder stack: remove the causal mask from the $QK^\top$ attention computation (Eq 9.1 masked → Eq 9.2 unmasked full N×N matrix) — feedforward, layer norm, and residuals stay identical; only the training objective must change too, since next-word prediction becomes trivial with future context visible (hence masked LM / cloze).
- **Key Components:**
  1. **[[self-attention|Multi-Head Self-Attention]]:** Linearly projects inputs into queries, keys, and values to attend across multiple representation subspaces simultaneously.
  2. **[[positional-encoding|Positional Encodings]]:** Injects token sequence order into the otherwise permutation-invariant attention layers (sinusoidal in 2017, RoPE in modern models).
  3. **Position-wise Feed-Forward Networks (FFNs/MLPs):** Applies non-linear projections per token (ReLU in 2017, SwiGLU in modern LLMs).
  4. **Residual Connections & Layer Normalization:** Stacks sub-layers with residual additions ($\text{LayerNorm}(x + \text{Sublayer}(x))$) for stable gradient flow, as introduced for RNNs in [[source-layer-normalization]] (Ba et al. 2016) and adopted as the Transformer sub-layer wrapper. See details below.

### The Residual-Stream View (Jurafsky & Martin Ch 7/9)
The current SLP3 draft (Aug 2026; Transformer content in Ch 7 after renumbering — see Jurafsky & Martin SLP3 Chapter 9: Masked Language Models (syllabus: 'The Transformer') header note) teaches the architecture as a **stream**: each token's input embedding flows directly up through $L$ stacked blocks (12–96+) while being enriched by attention, FFN, and layer-norm modules; the stream value at any layer = original embedding + sum of all previous module outputs. Attention is then dual-purpose: building **contextual representations** of a token's meaning by integrating surrounding tokens, or equivalently *moving information between residual streams* across positions. After the final block, a linear unembedding matrix $U$ + softmax over vocabulary forms the **language modeling head**. Spec table for encoders (Ch 9 §9.2): BERT WordPiece 30K, N=512, d=768, L=12, A=12 (~100M params) vs XLM-R SentencePiece 250K, d=1024, L=24, A=16 (~550M — still ~1000× smaller than Llama 3 405B).

### Positional Encoding Evolution: Sinusoid → Relative → RoPE (from [[source-roformer]])
- **Additive era (2017–2020):** Original sinusoidal or learned absolute vectors are **added** to token embeddings before Q/K/V projection; relative variants (Shaw 2018 clipped distance embeddings, Transformer-XL, T5 bias $b_{i,j}$) patch the expanded attention logit formulation term-by-term.
- **RoPE (Su et al. 2021, [[source-roformer]]):** Multiplicative instead — rotate query/key vectors by position-dependent angles so the inner product depends only on relative distance: $\langle f_q(x_m,m), f_k(x_n,n)\rangle = g(x_m,x_n,m{-}n)$, realized as a sparse block-diagonal rotation $R^d_{\Theta,m}$ with frequencies $\Theta=\{10000^{-2i/d}\}$, giving `q_m^T k_n = x_m^T W_q^T R_{n−m} W_k x_n` with **zero extra parameters** (efficient elementwise cos/sin implementation). Three wins:
  - **Length extrapolation** — no learned max-length bound; the basis for later NTK/YaRN scaling that lets Llama-class models stretch to 128K+ contexts.
  - **Long-term decay** — attention magnitude decays with distance (averaged over frequencies), matching linguistic intuition.
  - **Linear-attention compatibility** — additive embeddings break the kernel trick; RoPE rotates $\phi(q), \phi(k)$ separately, enabling Performer-style linear variants.
- **Status:** De-facto standard in modern decoder-only LLMs (Llama 3, Mistral, Qwen, Gemma); KV-cache and FlashAttention compatible since rotation is per-position on-the-fly.

### Domain Variants: Image & Music Transformers
- **Image Transformer (Parmar et al. 2018, [[source-image-transformer]], ICML 2018):** First convincing autoregressive image generation with tractable likelihood. Pixels treated as sequences of channel values (256-way categorical or 10-component DMOL mixture — 7× smaller output head); scalability restored by **local self-attention**: partition into query blocks (256) attending to larger memory blocks (512), either 1D raster-scan or 2D rectangular partitions — decoupling receptive field from parameter count (256-pixel RF vs PixelCNN's 25). ImageNet 32×32 NLL 3.83→3.77 bits/dim (SOTA); 4× super-resolution fools humans 3× more often than prior work. Direct precursor to ViT, VQGAN, DALL-E; block-locality anticipates Swin/Sparse Transformer.
- **Music Transformer (Huang et al. 2018, [[source-music-transformer]], ICLR 2019):** First minute-long symbolic music generation with coherent structure (motif repetition/variation, phrase-level ABA form). Adopts Shaw's relative position representations but cuts their intermediate memory **O(L²D)→O(LD)** via a "skewing" trick (pad→reshape→slice aligning `Q E_r^T` into `S_rel`) — 8.5GB→4.2MB per layer at L=2048, unlocking 2048-token training windows (~60s of music). Extends relative embeddings to **pitch interval and inter-onset time**, showing relational inductive bias encodes musical grammar; primed continuations generalize beyond training length while absolute-position baselines deteriorate.
- **Common thread:** Both prove self-attention's domain generality beyond NLP by pairing it with **structure-aware position/locality** (2D coordinates for images, relative distance for periodic music) — the same insight RoPE later generalizes parameter-free for text, and both inform long-sequence handling needed by [[thinking-models]] (32K–65K reasoning traces).

## How It Works (Original 2017 vs. Modern Decoder-Only)
```
Original Encoder-Decoder (2017)                Modern Decoder-Only LLM (2024+)
───────────────────────────────────            ────────────────────────────────
Input Tokens ──► Encoder Stack (N=6)           Input Tokens ──► Token Embeddings
                      │                                               │
                      ▼ (Cross-Attention)                             ▼
Target Tokens ─► Decoder Stack (N=6)           RoPE Position ─► Transformer Block 1..N
                      │                                         - RMSNorm (pre-norm)
                      ▼                                         - Causal Multi-Head / GQA
                 Output Softmax                                 - Residual Connection
                                                                - RMSNorm (pre-norm)
                                                                - SwiGLU MLP
                                                                - Residual Connection
                                                                      │
                                                                      ▼
                                                                 Output LM Head
```

### Layer Normalization in Detail (from [[source-layer-normalization]])
- **Formula (Ba et al. 2016):** For layer $l$ with $H$ units and summed inputs $a_i^l$, $\mu^l = \frac1H\sum_{i=1}^H a_i^l$, $\sigma^l = \sqrt{\frac1H\sum_i (a_i^l-\mu^l)^2}$ (Eq. 3), then $\text{LN}(a_i^l)=\frac{g_i}{\sigma^l}(a_i^l-\mu^l)+b_i$ with learned gain $g$ and bias $b$ per neuron before non-linearity. Unlike BatchNorm ($E_{x\sim P(x)}[a_i]$ over mini-batch), LN shares $\mu,\sigma$ across all units in a layer but per example — identical at train/test, no batch-size constraint, works online (batch 1).
- **RNN → Transformer adaptation:** For RNN step $a^t = W_{hh}h^{t-1}+W_{xh}x^t$, LN per timestep $h^t = f[g/\sigma^t \odot (a^t-\mu^t)+b]$ with single $g,b$ across steps, stabilizing hidden dynamics that otherwise explode/vanish (demonstrated on 700-length handwriting). Transformer imports as $\text{LayerNorm}(x + \text{Sublayer}(x))$ **post-norm** in 2017, later switched to **pre-norm** ($\text{x + Sublayer}(\text{LN}(x))$) and **RMSNorm** (Zhang & Sennrich 2019, removes mean subtraction) for deeper stability in modern LLMs (Llama 3, etc.).
- **Invariance & geometry:** LN invariant to scaling entire weight matrix $W'=\delta W+1\gamma^\top$ and to per-example rescaling $x'=\delta x$ (since $\mu',\sigma'$ scale by $\delta$) — Table 1 of [[source-layer-normalization]]. Fisher-information analysis shows growth of $\|w\|$ halves curvature → implicit learning-rate reduction / early stopping; learning gain $g$ more robust than raw weight magnitude (depends only on prediction error, not input norm).
- **Empirical note:** On permutation-invariant MNIST 784-1000-1000-10, LN robust to batch 4 vs 128 and faster than BN; on ConvNets BN outperforms LN due to boundary receptive-field heterogeneity (further research needed).

## Practical Implications
- **Quadratic Complexity ($O(N^2)$):** Standard self-attention scales quadratically with sequence length $N$, motivating innovations like FlashAttention, Grouped-Query Attention (GQA), and KV caching.
- **Universal Pretraining Backbone:** Serves as the universal substrate for modern generative AI across text, code, audio, and vision domains.
- **CS336 systems perspective — why modern Transformers look the way they do:** [[source-cs336-lecture03-architectures]] surveys 19+ dense models (2024–2025) and finds convergence on a *LLaMA-like* recipe — **pre-norm** (non-residual double post-norm in OlMo 2/Gemma 2), **RMSNorm** (no mean/bias, wall-clock win via fewer bytes moved though FLOPs barely change — `FLOPs≠runtime`), **SwiGLU/GeGLU** with $d_{ff}$ scaled by 2/3, **no bias terms**, and RoPE — explained through data-movement and stability rather than pure FLOP counts. [[source-cs336-lecture04-attention-moe]] extends to architecture at scale: hybrids (Minimax M1 7:1, Nemotron-3 3:1, Qwen-Next GDN) marry linear-time recurrence to a few full attention layers, while [[mixture-of-experts]] decouples total params from active FLOPs. Underlying cost model comes from [[source-cs336-lecture02-pytorch-resource-accounting]]: $6ND$ FLOPs, intensity roofline, and checkpointing — which makes 1000-byte→250-token compression from [[tokenization]] (Lecture 01) an architectural requirement, not a linguistic one.

## Connections
- Core engine for [[pretraining]] large-scale text simulators.
- Deconstructs into [[self-attention]] and [[positional-encoding]]; normalized via LN/RMSNorm; position modernized from additive sinusoid to multiplicative RoPE per [[source-roformer]].
- Generalizes across domains via structure-aware variants: local 2D blocks for vision ([[source-image-transformer]]) and memory-efficient relative attention for music ([[source-music-transformer]]) — precursors to ViT and audio/symbolic generation in [[multimodal-ai]].
- Built on BPE subword inputs from [[tokenization]] — joint BPE 37k vocab in original Transformer (WMT En-De) → 250K SentencePiece in XLM-R for [[multilinguality]] (see [[source-neural-machine-translation-subword-units]] and [[source-unsupervised-cross-lingual-representation-learning]]).
- Visualized in detail in [[source-the-illustrated-transformer]] and [[source-transformer-explainer]].
- Optimized during serving via [[inference]]; LN choice affects quantization and throughput; RoPE's per-position rotation is KV-cache friendly, and speculative decoding ([[source-speculative-decoding]]) exploits the architecture's parallel verification for lossless 2–3× speedups.
- Cross-lingual transfer via [[multilinguality]] (curse of multilinguality, α=0.3 sampling) and token cost inequity in [[source-do-all-languages-cost-same-tokenization]].
- Succeeds [[rnn]]s — whose training difficulty (vanishing/exploding gradients, basin-crossing walls, gradient clipping) is diagnosed in [[source-learning-long-term-dependencies]] and [[source-difficulty-training-rnns]] — by eliminating recurrence.
- Trained via [[backpropagation]] as formalized in Learning Representations by Back-Propagating Errors and hands-on in `gradient-notes.pdf`; historical transition from rule-based SHRDLU→statistical→RNN→Transformer narrated in [[source-history-human-language-understanding]].
- Long-context RoPE extrapolation (with NTK/YaRN frequency scaling) is what enables [[thinking-models]] to sustain 32K–65K reasoning traces.

## Open Questions
- Can sub-quadratic architectures (State Space Models / Mamba, Linear Attention) match or surpass Transformers on long-context in-context reasoning?
- Does 2D RoPE (extending rotation to image coordinates) unify the Image Transformer's absolute 2D encoding with relative geometry, and does learned-relative ([[source-music-transformer]]) beat parameter-free RoPE for domains with strong periodicity?

## Sources
- [[source-attention-is-all-you-need]]
- [[source-the-illustrated-transformer]]
- [[source-transformer-explainer]]
- [[source-deep-dive-into-llms-like-chatgpt]]
- [[source-layer-normalization]]
- [[source-neural-machine-translation-subword-units]]
- [[source-unsupervised-cross-lingual-representation-learning]]
- [[source-do-all-languages-cost-same-tokenization]]
- [[source-history-human-language-understanding]]
- Learning Representations by Back-Propagating Errors
- Jurafsky & Martin SLP3 Chapter 9: Masked Language Models (syllabus: 'The Transformer')
- [[source-learning-long-term-dependencies]]
- [[source-difficulty-training-rnns]]
- [[source-roformer]]
- [[source-image-transformer]]
- [[source-music-transformer]]
- [[source-cs336-lecture01-overview-tokenization]]
- [[source-cs336-lecture02-pytorch-resource-accounting]]
- [[source-cs336-lecture03-architectures]]
- [[source-cs336-lecture04-attention-moe]]
- [[source-cs336-lecture05-gpus-tpus]]

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
