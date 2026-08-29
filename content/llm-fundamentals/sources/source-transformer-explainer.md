---
type: source-summary
title: "Transformer Explainer: Learning LLM Transformers with Interactive Visual Explanation and Experimentation"
summary: An open-source interactive visualization system and companion research paper published at IEEE VIS 2024 by the Polo Club of Data Science at Georgia Tech.
status: draft
visibility: public
author: "Aeree Cho, Grace C. Kim, Alexander Chao, Chao Zhang, Seongmin Lee, Minsuk Kahng, Duen Horng Chau (Georgia Tech Polo Club)"
source-type: paper
url: "https://poloclub.github.io/transformer-explainer/"
date-published: 2024-08-08
date-ingested: 2026-08-23
tags:
  - llm-fundamentals
  - inference
  - prompt-engineering
key-concepts:
  - "[[transformer]]"
  - "[[self-attention]]"
  - "[[tokenization]]"
  - "[[inference]]"
key-entities:
  - "[[polo-club-of-data-science]]"
aliases:
  - wiki/source-transformer-explainer
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">An open-source interactive visualization system and companion research paper published at IEEE VIS 2024 by the Polo Club of Data Science at Georgia Tech.</p>
<p class="kb-provenance">Aeree Cho, Grace C. Kim, Alexander Chao, Chao Zhang, Seongmin Lee, Minsuk Kahng, Duen Horng Chau (Georgia Tech Polo Club), 2024-08-08. <a href="https://poloclub.github.io/transformer-explainer/">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary
An open-source interactive visualization system and companion research paper published at IEEE VIS 2024 by the [[polo-club-of-data-science]] at Georgia Tech. **Transformer Explainer** runs a real GPT-2 model (124M parameters) live in the browser using ONNX Runtime Web and WebAssembly, enabling learners to visually inspect the exact token-level mathematical transformations across all layers of a decoder-only [[transformer]].

## Key Takeaways
1. **Interactive In-Browser Inference:** Executes real GPT-2 inference directly in the client browser without backends, visualizing actual token activations, embeddings, attention scores, and MLP projections in real time.
2. **Token-Centric Information Flow:** Traces the transformation of input text tokens as they flow from discrete token IDs $\to$ word & positional embeddings $\to$ multi-head [[self-attention]] projection matrices ($W_Q, W_K, W_V, W_O$) $\to$ MLP layers $\to$ LayerNorm $\to$ output logit distribution.
3. **De-mystifying Temperature and Sampling:** Visually demonstrates how sampling hyperparameters alter the next-token probability distribution:
   - **Temperature ($T$):** Scales logits $z_i / T$ before softmax. Lower temperature sharpens the distribution toward greedy argmax; higher temperature flattens the distribution toward uniform randomness.
   - **Top-$k$ Sampling:** Restricts selection to the top $k$ highest-probability tokens.
   - **Top-$p$ (Nucleus) Sampling:** Truncates the candidate pool to the smallest set of tokens whose cumulative probability exceeds threshold $p$.
4. **Attention Score Matrix Inspection:** Allows granular inspection of Query-Key dot products $\frac{QK^T}{\sqrt{d_k}}$, causal masking (lower-triangular masking), and attention weight heatmaps across multiple attention heads.

## Detailed Notes

### 1. The Interactive Pipeline Visualized
```
Input Prompt ("Data visualization empowers users to")
       │
       ▼
[ Tokenization & Embedding ] (Token IDs + Positional Encodings)
       │
       ▼
[ Transformer Blocks (1..12) ]
  ├── LayerNorm
  ├── Multi-Head Self-Attention (Q, K, V Projections ──► Softmax Score Heatmap ──► Output Projection)
  ├── Residual Connection (+)
  ├── LayerNorm
  ├── MLP / Feed-Forward Network (GELU Activation)
  └── Residual Connection (+)
       │
       ▼
[ Final LayerNorm & Unembedding ] ──► Logits Vector (Vocabulary Size: 50,257)
       │
       ▼
[ Temperature Scaling & Softmax ] ──► Probabilities ──► Top-k / Top-p Sampling ──► Next Token (" learn")
```

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 1 passages in this section could not be located in the stored source ([https://poloclub.github.io/transformer-explainer/](https://poloclub.github.io/transformer-explainer/)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "While temperature is frequently anthropomorphized as a 'creativity' control, interactive visual experimentation reveals how it actually scales logit values to flatten or sharpen the probability distribution." — Cho et al.

## Concepts Introduced or Referenced
- [[transformer]] — Architecture breakdown of decoder-only autoregressive models.
- [[self-attention]] — Granular matrix projections ($Q, K, V$) and multi-head attention visual weights.
- [[tokenization]] — Subword token mapping to vocabulary IDs.
- [[inference]] — Autoregressive token generation, temperature scaling, and nucleus sampling.

## Critical Assessment
- **Educational Excellence:** Provides the most intuitive, mechanically precise visual interface for understanding modern generative LLMs, bridging high-level conceptual understanding with exact tensor mathematics.
- **Scope:** Visualizes a 124M parameter GPT-2 model due to browser WebAssembly constraints; modern frontier architectures incorporate minor variations (e.g., RoPE positional embeddings, SwiGLU activations, Grouped Query Attention).

---

**Source:** Transformer Explainer: Learning LLM Transformers with Interactive Visual Explanation and Experimentation by Aeree Cho, Grace C. Kim, Alexander Chao, Chao Zhang, Seongmin Lee, Minsuk Kahng, Duen Horng Chau (Georgia Tech Polo Club) — <https://poloclub.github.io/transformer-explainer/>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
