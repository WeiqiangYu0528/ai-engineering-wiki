---
type: source-summary
title: "The Illustrated Transformer"
summary: The landmark 2018 visual tutorial by Jay Alammar that became the standard pedagogical reference for understanding the Transformer architecture.
status: draft
visibility: public
author: "Jay Alammar"
source-type: article
url: "https://jalammar.github.io/illustrated-transformer/"
date-published: 2018-06-27
date-ingested: 2026-08-23
tags:
  - llm-fundamentals
key-concepts:
  - "[[transformer]]"
  - "[[self-attention]]"
  - "[[positional-encoding]]"
key-entities:
  - "[[jay-alammar]]"
  - "[[google-research]]"
aliases:
  - wiki/source-the-illustrated-transformer
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The landmark 2018 visual tutorial by Jay Alammar that became the standard pedagogical reference for understanding the Transformer architecture.</p>
<p class="kb-provenance">Jay Alammar, 2018-06-27. <a href="https://jalammar.github.io/illustrated-transformer/">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary
The landmark 2018 visual tutorial by [[jay-alammar]] that became the standard pedagogical reference for understanding the [[transformer]] architecture. The article demystifies the mathematical mechanics of [[source-attention-is-all-you-need]] by walking through step-by-step vector and matrix diagrams of the encoder-decoder stack, query-key-value self-attention projections, multi-headed attention, positional encodings, residual connections, layer normalization, and the final linear/softmax decoding layer.

## Key Takeaways
1. **The 6-Step Self-Attention Calculation:**
   - Step 1: Create Query ($Q$), Key ($K$), and Value ($V$) vectors for each word ($1 \times 64$) by multiplying input embeddings ($1 \times 512$) with learned weight matrices ($W^Q, W^K, W^V$).
   - Step 2: Calculate attention score for each word pair: $\text{Score} = q_1 \cdot k_1, q_1 \cdot k_2, \dots$
   - Step 3: Divide scores by scaling factor $\sqrt{d_k} = \sqrt{64} = 8$ to stabilize gradients.
   - Step 4: Apply $\text{softmax}$ to obtain normalized attention probabilities summing to $1.0$.
   - Step 5: Multiply each value vector by its softmax score ($v_i \times \text{score}_i$) to amplify relevant words and drown out irrelevant ones.
   - Step 6: Sum up weighted value vectors to produce the self-attention output vector $z_1 = \sum \text{score}_i \cdot v_i$.
2. **Multi-Headed Attention Intuition:**
   - Expands the model's ability to focus on different positions simultaneously (e.g. one head focuses on syntactic dependencies, another on pronoun-antecedent coreferences).
   - Gives the attention layer multiple "representation subspaces" (8 attention heads $\times$ 64 dimensions $= 512$ total dimensions), projected back to $512$ via output matrix $W^O$.
3. **The Wave Pattern of Positional Encoding:**
   - Adds fixed sinusoidal frequency vectors ($512$-d) directly to input word embeddings to represent token position, allowing the model to determine distance between words without recurrence.
4. **Encoder-to-Decoder Information Transfer (Cross-Attention):**
   - The top encoder outputs a set of attention vectors $K$ and $V$.
   - Each decoder block's "Encoder-Decoder Attention" layer uses the encoder's $K$ and $V$ vectors paired with the decoder's $Q$ vectors to map source context into the target translation.
5. **Linear and Softmax Output Layer:**
   - Turns the decoder's float vector ($512$-d) into a massive logit vector matching vocabulary size (e.g. 10,000 words), applying softmax to pick the highest probability next token.

## Detailed Notes

### The Matrix Calculation of Self-Attention
$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
Where:
- $X$ is the input matrix of token embeddings ($N \times d_{\text{model}}$).
- $Q = X W^Q, \quad K = X W^K, \quad V = X W^V$.
- The resulting matrix $Z = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$ passes directly to the feed-forward network.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 2 passages in this section could not be located in the stored source ([https://jalammar.github.io/illustrated-transformer/](https://jalammar.github.io/illustrated-transformer/)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Self-attention is the method the Transformer uses to bake the 'understanding' of other relevant words into the one we're currently processing." — Jay Alammar

> "When the model is processing the word 'it', self-attention allows it to associate 'it' with 'animal' rather than 'street'." — Jay Alammar

## Concepts Introduced or Referenced
- [[transformer]] — Comprehensive visual explanation of encoder and decoder components.
- [[self-attention]] — Granular step-by-step vector and matrix arithmetic.
- [[positional-encoding]] — Frequency-based position vectors added to token embeddings.

## Critical Assessment
- **Pedagogical Milestone:** Widely cited in university curricula (Stanford CS224N, Harvard, MIT, Princeton, CMU) as the clearest visual introduction to Transformers.
- **Historical Context:** Focuses on the original 2017 Encoder-Decoder architecture for Machine Translation; modern LLMs (GPT, Llama, Claude) evolve this into decoder-only stacks with RoPE embeddings and causal masking.

---

**Source:** The Illustrated Transformer by Jay Alammar — <https://jalammar.github.io/illustrated-transformer/>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
