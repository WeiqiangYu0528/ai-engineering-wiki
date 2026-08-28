---
type: source-summary
title: "How to generate text: using different decoding methods for language generation with Transformers"
summary: Practical March 2020 Hugging Face blog by Patrick von Platen (updated July 2023) that is the canonical hands-on reference for auto-regressive text decoding with the transformers library.
status: draft
visibility: public
author: "Patrick von Platen (Hugging Face)"
source-type: article
url: "https://huggingface.co/blog/how-to-generate"
date-published: 2020-03-01
date-ingested: 2026-08-24
tags:
  - llm-fundamentals
  - inference
key-concepts:
  - "[[decoding-strategies]]"
  - "[[inference]]"
  - "[[transformer]]"
  - "[[tokenization]]"
key-entities:
  - "[[huggingface]]"
---

# How to generate text: using different decoding methods for language generation with Transformers

## Summary
Practical March 2020 [[huggingface]] blog by Patrick von Platen (updated July 2023) that is the canonical hands-on reference for **auto-regressive text decoding** with the `transformers` library. Using GPT-2 and the prompt *"I enjoy walking with my cute dog"* as a running example, it defines the probabilistic factorization $P(w_{1:T}|W_0)=\prod_t P(w_t|w_{1:t-1},W_0)$, implements **greedy search**, **beam search** (with $n$-gram penalties and `num_return_sequences`), and **stochastic sampling** (temperature-scaled, **Top-$K$** [Fan et al. 2018] and **Top-$p$ / nucleus** sampling [Holtzman et al. 2019]), and explains *when* each fails: greediness hides high-joint-probability sequences, beam search excels only for length-predictable tasks (MT/summarization) and otherwise produces repetitive, over-predictable text, while vanilla sampling produces incoherent gibberish without tempering. The post maps each method to the exact `model.generate()` flags (`do_sample`, `num_beams`, `temperature`, `top_k`, `top_p`, `no_repeat_ngram_size`, `early_stopping`) and concludes—citing Welleck et al. 2019/2020—that no single decoder dominates and that repetition may be a training rather than decoding artifact.

## Key Takeaways
1. **Autoregressive Factorization is the Substrate:** All methods operate on $P(w_t|w_{1:t-1},W_0)$ and stop at EOS; decoding is the *policy* for traversing that distribution during the memory-bandwidth-bound decoding phase of [[inference]].
2. **Greedy Search = Argmax at Each Step:** $w_t = \arg\max_w P(w|w_{1:t-1})$. Simple, deterministic, but suffers from (a) missing high-joint-prob sequences hidden behind a locally suboptimal token (toy example: greedy picks "nice"→"woman" 0.2, misses "dog"→"has" 0.36) and (b) rapid repetition loops ("I'm not sure if I'll ever be able to walk with my dog. I'm not sure...").
3. **Beam Search = Breadth-First $N$-Best:** Keeps `num_beams` hypotheses per step, finally picks max joint probability. Guaranteed $\geq$ greedy probability but not globally optimal. Code: `num_beams=5, early_stopping=True`. Practical extensions: `no_repeat_ngram_size=2` zeroes out tokens that would recreate an $n$-gram (eliminates repetition in the demo but would break "New York"), and `num_return_sequences ≤ num_beams` surfaces the $N$ highest-scoring hypotheses for reranking. The blog cites Murray et al. 2018 / Yang et al. 2018 (beam best for MT/summarization) and Holtzman's entropy plot: human text occupies *lower* probability than beam outputs — beam is "boring."
4. **Sampling = True Stochastic Decoding:** $w_t \sim P(w|w_{1:t-1})$. With `do_sample=True, top_k=0` and fixed seed, GPT-2 produces fluent-looking but incoherent text. **Temperature** sharpens/flattens via $\text{softmax}(logits/T)$: $T→0$ → greedy; $T=0.6$ reduces weird $n$-grams in the example; typical ranges low $T$ 0.1–0.7 (code/math) vs high $T$ 0.8–1.2 (creative).
5. **Top-$K$ Sampling [Fan et al. 2018] — Fixed Pool:** Truncate to $K$ most likely tokens and renormalize. With $K=50$ the blog's GPT-2 sample is the most human-sounding yet. Limitation: fixed $K$ is blind to distribution shape — for flat distributions it prunes plausible words ("people", "big", "house", "cat"), for sharp distributions it admits ill-fitted tail words ("down", "a").
6. **Top-$p$ (Nucleus) Sampling [Holtzman et al. 2019] — Dynamic Pool:** Take the minimal set $V^{(p)}$ with $\sum_{w∈V^{(p)}} P(w) ≥ p$ (e.g., $p=0.92$ → 9 words in a flat step, 3 in a sharp step) and renormalize. Adapts pool size to entropy: wide when next token is unpredictable ($P(w|"The")$), narrow when predictable ($P(w|"The","car")$). In practice `top_p=0.92` (blog) or 0.95 combined with `top_k=50` works well and `top_k=0` disables Top-$K$. `num_return_sequences=3` yields independent samples.
7. **Conclusion & Caveats:** Top-$p$/$K$ are more fluent than greedy/beam for open-ended story/dialog, but Welleck et al. 2019/2020 show (a) repetition may stem from *training* (MLE), not decoding, (b) when the training objective is adapted, beam can be judged *more* fluent by humans, and (c) Top-$K$/$p$ also still repeat. No one-size-fits-all; the post points to `GenerationConfig`, streaming, and the full `generate` API.

## Detailed Notes

### Autoregressive Setup
- Factorization and EOS-terminated variable length.
- GPT-2 tokenizer/model loading pattern (`pad_token_id = eos_token_id`, `torch_device` selection) — identical API for TF/JAX.

### Greedy Search
- Math: $w_t = \arg\max_w P(w|w_{1:t-1})$
- Toy probabilities illustrating local optima; visual greedy_search.png.
- Empirical failure: repetition loop after ~10 tokens; references Vijayakumar et al. 2016 (diverse beam), Shao et al. 2017.

### Beam Search
- Math: maintain $B$ hypotheses, score $=\sum \log P$; diagram beam_search.png with $B=2$ example.
- `early_stopping=True` stops when all beams hit EOS.
- $n$-gram blocking: `no_repeat_ngram_size=2` sets $P(next|history)=0$ if $n$-gram already seen.
- Returning multiple sequences and their marginal variation with small $B$.
- Three critiques for open-ended generation: (1) length unpredictability, (2) repetition penalty tuning fragility, (3) Holtzman argument: high-quality human language is *not* high-probability; beam maximizes probability → generic/boring. Includes FastForward Labs entropy figure link.

### Sampling Family
- Base sampling $w_t \sim P$ — sampling_search.png.
- Temperature scaling: $P_T(w) ∝ \exp(logit/T)$; figure sampling_search_with_temp.png; $T=0.6$ example.
- Top-$K$: figure top_k_sampling.png (10-word vocab, $K=6$), GPT-2 adoption story.
- Top-$p$: figure top_p_sampling.png ($p=0.92$, 9 vs 3 words), cumulative-mass definition, dynamic pool advantage.
- Combination: `top_k=50, top_p=0.95` + `num_return_sequences`.

### Practical `generate` Flags Covered
`max_new_tokens`, `num_beams`, `early_stopping`, `no_repeat_ngram_size`, `num_return_sequences`, `do_sample`, `top_k`, `top_p`, `temperature`, `pad_token_id`, `set_seed` for reproducibility, `GenerationConfig` for defaults, streaming.

### Conclusion Detail
- Welleck et al. 2019 (Consistent explanations): unlikelihood training reduces repetition; Welleck et al. 2020 (Neural Text Degeneration): Top-$K$/$p$ still degenerate.
- Pointer to `generation_strategies` docs, `GenerationConfig`, streaming guide, full `generate` reference, Open LLM Leaderboard.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 5 of 5 passages in this section could not be located in the stored source ([https://huggingface.co/blog/how-to-generate](https://huggingface.co/blog/how-to-generate)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Besides the improved transformer architecture and massive unsupervised training data, **better decoding methods** have also played an important role."

> "Beam search will always find an output sequence with higher probability than greedy search, but is not guaranteed to find the most likely output."

> "As humans, we want generated text to surprise us and not to be boring/predictable."

> "High quality human language does not follow a distribution of high probability next words." — Ari Holtzman et al. (2019), cited.

> "The major drawback of greedy search though is that it misses high probability words hidden behind a low probability word."

## Concepts Introduced or Referenced
- [[decoding-strategies]] — Full taxonomy: greedy, beam ($n$-gram blocking, $N$-best), temperature, Top-$K$, Top-$p$/nucleus, their failure modes and `generate` parameterization.
- [[inference]] — Decoding is the sequential, memory-bandwidth-bound phase of inference after prefill; temperature/Top-$p$/$K$ are the logit transforms before softmax sampling.
- [[transformer]] — Autoregressive decoder-only backbone whose $P(w_t|w_{<t})$ the decoders traverse; KV-cache discussion ties here.
- [[tokenization]] — Implicit: SentencePiece/BPE tokenization underlies GPT-2 `AutoTokenizer` and EOS/pad handling.

## Critical Assessment
- **Strengths:** Exceptionally clear, runnable (Colab), visual, and code-first — each decoding flaw is demonstrated with the *same* prompt so differences are comparable. Pinpoints exact `generate` args, links to primary papers (Fan, Holtzman, Paulus, Klein, Vijayakumar, Murray, Yang, Welleck), and updates for `transformers` API evolution (July 2023). Still the most-cited practical decoding reference.
- **Limitations:** Focused on GPT-2 (2020) and short 40-token continuations; does not cover post-2020 advances: contrastive search [Su et al. 2022], typical sampling, mirostat, repetition penalty / frequency penalty, or constrained/structured decoding (JSON, grammar-guided). Temperature vs Top-$p$ interaction and schedule (e.g., dynamic temperature) not explored. Human evaluation nuance (Welleck findings) is briefly noted but not resolved.
- **Wiki Integration:** Fills the gap between [[inference]]'s high-level mention of temperature/Top-$p$ and a dedicated decoding reference. No contradictions; complements [[transformer]] and [[inference]] (prefill vs decode, KV-cache) by detailing the *policy* inside the decode loop. Should be cited alongside `source-transformer-explainer` for logit/softmax visuals.

---

**Source:** How to generate text: using different decoding methods for language generation with Transformers by Patrick von Platen (Hugging Face) — <https://huggingface.co/blog/how-to-generate>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
