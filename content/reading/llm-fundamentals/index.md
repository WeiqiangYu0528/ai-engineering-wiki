---
title: "Reading path: LLM Fundamentals"
---

> 9 pages in order, about 74 minutes of reading · content as of 2026-08-27

Each entry assumes the ones above it, which is the only claim this page makes — it is a route in, not a table of contents. The [LLM Fundamentals map](/llm-fundamentals/) has the full list.

1. [Tokenization](/llm-fundamentals/concepts/tokenization) — what the model actually consumes; context length, cost and vocabulary are all denominated in these units
2. [Embeddings](/llm-fundamentals/concepts/embeddings) — how the discrete IDs from step 1 become the continuous vectors every later layer operates on
3. [Recurrent Neural Network](/llm-fundamentals/concepts/rnn) — the sequential baseline, and the vanishing-gradient argument that motivated a non-recurrent architecture
4. [Self-Attention Mechanism](/llm-fundamentals/concepts/self-attention) — the operation itself, read once you know what it was built to escape
5. [Positional Encoding](/llm-fundamentals/concepts/positional-encoding) — attention is permutation-invariant, so order has to be put back deliberately
6. [Transformer](/llm-fundamentals/concepts/transformer) — the block that assembles steps 4 and 5 into an architecture
7. [Pretraining](/llm-fundamentals/concepts/pretraining) — the objective and the compute that turn that architecture into a model
8. [Scaling Laws](/llm-fundamentals/concepts/scaling-laws) — how to size the run in step 7 before starting it
9. [Scaling Laws: Kaplan, Chinchilla, and What the Disagreement Was Really About](/llm-fundamentals/concepts/scaling-laws-revisions) — the Kaplan/Chinchilla gap only reads as a methodology artifact once step 8 is in hand

Every page here names the one before it in its header and links the one after it at the foot of its body, so the order can be followed without coming back to this page.
