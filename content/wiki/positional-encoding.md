---
type: concept
title: "Positional Encoding"
summary: Positional Encoding is the technique used in Transformer models to inject information about the sequential order of tokens into token representations.
visibility: public
aliases:
  - "Positional Embeddings"
  - "Sinusoidal Positional Encoding"
  - "RoPE"
  - "Rotary Position Embedding"
tags:
  - llm-fundamentals
created: 2026-08-23
updated: 2026-08-23
status: draft
sources:
  - "[[source-attention-is-all-you-need]]"
  - "[[source-the-illustrated-transformer]]"
related:
  - "[[transformer]]"
  - "[[self-attention]]"
---

# Positional Encoding

## Overview
**Positional Encoding** is the technique used in [[transformer]] models to inject information about the sequential order of tokens into token representations. Because [[self-attention]] is fundamentally permutation-invariant (treating inputs as an unordered set of vectors), positional encodings ensure that the model understands token positions (e.g., distinguishing *"dog bites man"* from *"man bites dog"*).

## Key Ideas
- **Permutation Invariance of Attention:** Without positional information, $\text{Attention}(Q, K, V)$ yields identical output regardless of the order of words in the sentence.
- **Sinusoidal Positional Encoding (Original Transformer):**
  Introduced by Vaswani et al. (2017) in [[source-attention-is-all-you-need]] and visually mapped in [[source-the-illustrated-transformer]], uses fixed trigonometric functions across different frequencies:
  $$PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i / d_{\text{model}}}}\right)$$
  $$PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i / d_{\text{model}}}}\right)$$
  - *Geometric Frequencies:* Wavelengths form a geometric progression from $2\pi$ to $10000 \cdot 2\pi$.
  - *The Visual Wave Pattern:* As illustrated by [[jay-alammar]], plotting positional vectors creates a continuous wave gradient across dimensions, allowing the model to learn relative distances between tokens through simple linear projections.
  - *Linear Representation of Relative Offset:* For any fixed offset $k$, $PE_{pos+k}$ can be represented as a linear transformation of $PE_{pos}$.
- **Evolution of Positional Encodings:**
  1. *Sinusoidal Fixed Encodings (2017):* Added directly to input embeddings.
  2. *Learned Absolute Positional Embeddings (e.g., BERT, GPT-2):* Learned parameters per position index; strictly bounded by the maximum trained context length.
  3. *Relative Positional Encodings (e.g., T5 / ALiBi):* Inject positional bias directly into the attention score matrix $QK^T$.
  4. *Rotary Position Embedding / RoPE (e.g., Llama 3, Mistral, Qwen):* Modern standard that rotates query and key vectors in 2D planes, naturally encoding relative distances with superior length extrapolation properties.

## How It Works
```
Token ID ──► Token Embedding Vector (dim 512)
                   │
                   ▼ (Element-wise Addition)
Pos Index ──► Sinusoidal Vector PE(pos) (dim 512) ◄── Continuous wave pattern
                   │
                   ▼
         Input to Transformer Block 1
```

## Practical Implications
- **Context Window Limits:** How positional information is encoded dictates whether a model can extrapolate to context lengths beyond its pretraining window (e.g., via RoPE base frequency scaling like YaRN).
- **No Extra Parameters:** Deterministic encodings (sinusoidal, RoPE) do not require learnable parameters.

## Connections
- Compensates for the permutation invariance of [[self-attention]].
- Crucial component of the [[transformer]] input pipeline.
- Visualized clearly in [[source-the-illustrated-transformer]].

## Open Questions
- What are the mathematical limits of context window extrapolation via RoPE frequency scaling without fine-tuning?

## Sources
- [[source-attention-is-all-you-need]]
- [[source-the-illustrated-transformer]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
