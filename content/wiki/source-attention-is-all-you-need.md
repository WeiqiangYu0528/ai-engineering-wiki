---
type: source-summary
title: "Attention Is All You Need"
summary: The seminal 2017 research paper from Google Research that introduced the Transformer architecture.
status: verified
visibility: public
author: "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin"
source-type: paper
url: "https://arxiv.org/abs/1706.03762"
date-published: 2017-06-12
date-ingested: 2026-08-23
tags:
  - llm-fundamentals
key-concepts:
  - "[[transformer]]"
  - "[[self-attention]]"
  - "[[positional-encoding]]"
key-entities:
  - "[[google-research]]"
verified-by: agent
verified-on: 2026-08-27
---

# Attention Is All You Need

## Summary
The seminal 2017 research paper from [[google-research]] that introduced the **[[transformer]]** architecture. The paper proved that sequence transduction models could completely abandon recurrence (RNNs, LSTMs) and convolutions in favor of a pure attention mechanism. By replacing sequential recurrence with parallelizable [[self-attention]], the Transformer achieved state-of-the-art results in machine translation while training in a fraction of the time, laying the technological foundation for modern generative AI and LLMs.

## Key Takeaways
1. **Dispensing with Recurrence:** Recurrent models force sequential computation along token positions ($O(n)$ steps), preventing parallel training on GPUs. The Transformer reduces sequential operations to $O(1)$.
2. **Constant Path Length for Long-Range Dependencies:** Information between any two arbitrary token positions travels in $O(1)$ operations via [[self-attention]], unlike RNNs ($O(n)$) or CNNs ($O(\log n)$).
3. **Scaled Dot-Product & Multi-Head Attention:** Scaling dot-products by $\frac{1}{\sqrt{d_k}}$ prevents vanishing gradients in the softmax. Multi-head projection allows the model to jointly attend to information across different representation subspaces.
4. **Sinusoidal Positional Encoding:** In the absence of recurrence, deterministic sinusoidal encodings inject token order directly into embeddings.
5. **Efficiency & State-of-the-Art Quality:** Trained on 8 NVIDIA P100 GPUs in just 3.5 days, achieving 28.4 BLEU on WMT En-De and 41.8 BLEU on WMT En-Fr.

## Detailed Notes

### 1. Encoder-Decoder Architecture
- **Encoder:** 6 identical layers, each with Multi-Head Self-Attention and a position-wise Feed-Forward Network (FFN), with residual connections and Layer Normalization ($d_{\text{model}} = 512$).
- **Decoder:** 6 identical layers, inserting a third sub-layer that performs cross-attention over encoder outputs, with causal masking on self-attention.

### 2. Attention Formulation
$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
- Multi-Head Attention splits the dimension into $h=8$ parallel heads ($d_k = d_v = 64$), concatenating outputs and projecting via $W^O$.

### 3. Positional Encoding
- Uses fixed sinusoidal functions across geometric frequencies ($2\pi$ to $10000 \cdot 2\pi$), hypothesized to allow easy relative position learning and length extrapolation.

## Notable Quotes
> "The Transformer is the first sequence transduction model relying entirely on self-attention to compute representations of its input and output without using sequence-aligned RNNs or convolution." — Vaswani et al.

> "To the best of our knowledge, the Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs." — Vaswani et al.

## Concepts Introduced or Referenced
- [[transformer]] — The foundational neural network architecture.
- [[self-attention]] — Scaled dot-product and multi-head attention mechanisms.
- [[positional-encoding]] — Method for encoding sequence order into permutation-invariant attention layers.

## Critical Assessment
- **Landmark Impact:** Arguably the most influential deep learning paper of the 2010s; revolutionized natural language processing, computer vision, and speech.
- **Historical Context:** Originally proposed as an **Encoder-Decoder** model for sequence-to-sequence translation. Modern LLMs (GPT, Llama) adapted this into **Decoder-Only** architectures for autoregressive text generation.

---

**Source:** Attention Is All You Need by Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin — <https://arxiv.org/abs/1706.03762>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
