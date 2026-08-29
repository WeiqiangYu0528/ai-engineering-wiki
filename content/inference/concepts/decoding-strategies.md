---
type: concept
title: "Decoding Strategies"
summary: Decoding Strategies are the policies that traverse an autoregressive Transformer's next-token distribution $P(wt \mid w{1:t-1}, W0)$ to produce variable-length text.
visibility: public
aliases:
  - Text Generation Decoding
  - Greedy Search
  - Beam Search
  - Top-k Sampling
  - Top-p Sampling
  - Nucleus Sampling
  - Temperature Sampling
  - wiki/decoding-strategies
tags:
  - inference
  - llm-fundamentals
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-self-consistency-improves-chain-of-thought-reasoning]]"
  - "[[source-chain-of-thought-prompting-elicits-reasoning]]"
  - "[[source-how-to-generate]]"
  - "[[source-transformer-explainer]]"
  - "[[source-deep-dive-into-llms-like-chatgpt]]"
related:
  - "[[self-consistency]]"
  - "[[chain-of-thought]]"
  - "[[inference]]"
  - "[[transformer]]"
  - "[[tokenization]]"
  - "[[hallucination]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Decoding Strategies are the policies that traverse an autoregressive Transformer's next-token distribution $P(wt \mid w{1:t-1}, W0)$ to produce variable-length text.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/prompt-engineering/concepts/self-consistency">Self-Consistency</a></li><li><a href="/prompt-engineering/concepts/chain-of-thought">Chain-of-Thought Prompting</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/llm-fundamentals/concepts/transformer">Transformer</a></li><li><a href="/llm-fundamentals/concepts/tokenization">Tokenization</a></li><li><a href="/eval-safety/concepts/hallucination">Hallucination</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/prompt-engineering/sources/source-self-consistency-improves-chain-of-thought-reasoning">Self-Consistency Improves Chain of Thought Reasoning in Language Models</a></li><li><a href="/prompt-engineering/sources/source-chain-of-thought-prompting-elicits-reasoning">Chain-of-Thought Prompting Elicits Reasoning in Large Language Models</a></li><li><a href="/llm-fundamentals/sources/source-how-to-generate">How to generate text: using different decoding methods for language generation with Transformers</a></li><li><a href="/llm-fundamentals/sources/source-transformer-explainer">Transformer Explainer: Learning LLM Transformers with Interactive Visual Explanation and Experimentation</a></li><li><a href="/llm-fundamentals/sources/source-deep-dive-into-llms-like-chatgpt">Deep Dive into LLMs like ChatGPT</a></li></ul></nav>
</aside>

## Overview
**Decoding Strategies** are the policies that traverse an autoregressive [[transformer]]'s next-token distribution $P(w_t \mid w_{1:t-1}, W_0)$ to produce variable-length text. For a prompt $W_0$, generation factorizes as $P(w_{1:T}\mid W_0)=\prod_{t=1}^T P(w_t\mid w_{1:t-1},W_0)$ and terminates at $\text{EOS}$. The choice of decoder — **greedy**, **beam search**, or **stochastic sampling** with **temperature**, **Top-$K$**, and **Top-$p$ (nucleus)** filtering — determines fluency, diversity, repetition, and factuality. Canonical practical reference is [[huggingface]]'s *How to Generate* blog [[source-how-to-generate]] (Patrick von Platen, 2020; updated July 2023), demonstrated on GPT-2 via Hugging Face `transformers` `model.generate()`.

## Key Ideas

### 1. The Common Substrate: Autoregressive $P(w_t \mid w_{<t})$
All decoders operate on logits → softmax probabilities from the same causal LM head. `generate` parameters simply reshape that distribution before choosing $w_t$. Decoding happens inside the **decoding phase** of [[inference]] (memory-bandwidth-bound, KV-cache-assisted token-by-token loop).

### 2. Greedy Search — $\arg\max$ Per Step
$w_t = \arg\max_w P(w\mid w_{1:t-1})$. Deterministic, fastest.
- **Failure 1 — Local optimum hides global optimum:** Toy example: greedy picks ("The","nice","woman") prob $0.5\times0.4=0.20$ and misses ("The","dog","has") $0.36$ because "dog" is only second-best at $t=1$.
- **Failure 2 — Repetition loops:** Demo prompt *"I enjoy walking with my cute dog"* → greedy loops *"but I'm not sure if I'll ever be able to walk with my dog. I'm not sure..."* — a universal pathology of likelihood-maximizing decoders [Vijayakumar et al. 2016; Shao et al. 2017].
- **Code:** `model.generate(**inputs, max_new_tokens=40)` (default greedy).

### 3. Beam Search — $B$-Best Breadth-First
Maintains `num_beams`= $B$ hypotheses per step, finally picks $\max \sum \log P$. Guarantees probability $\ge$ greedy but not globally optimal.
- **Visualization:** $B=2$ keeps ("The","nice") and ("The","dog") at $t=1$, discovers ("The","dog","has") beats ("The","nice","woman") at $t=2$.
- **Code:** `num_beams=5, early_stopping=True` (stop when all beams hit EOS).
- **$n$-gram blocking:** `no_repeat_ngram_size=2` zeroes $P(next)$ if the $n$-gram already appeared — cures repetition in the demo (produces *"...I've been thinking about this for a while..."*) but is brittle: blocking bigrams would forbid the second *New York*.
- **$N$-best:** `num_return_sequences ≤ num_beams` surfaces top hypotheses for reranking; with $B=5$ they differ only marginally.
- **When it shines / fails:** Cited in [[source-how-to-generate]] as optimal for **length-predictable tasks** — machine translation, summarization [Murray et al. 2018; Yang et al. 2018] — but poor for **open-ended** generation (dialog, story) where length varies. Also "boring": Holtzman et al. 2019 show human text lies at *lower* model probability than beam outputs (entropy figure); beam maximizes probability → predictable, generic text.

### 4. Sampling — $w_t \sim P(w\mid w_{<t})$
True stochastic decoding. `do_sample=True, top_k=0` with fixed seed demonstrates fluent-looking but incoherent rambling.
- **Temperature $T$:** Reshapes logits as $\text{softmax}(logits/T)$.
  - $T\to0$ → greedy; $T=1$ → original; $0.1$–$0.7$ sharpens (good for code/math determinism), $0.8$–$1.2$ flattens (creative diversity). Demo $T=0.6$ reduces weird $n$-grams vs $T=1$.
- **Why vanilla sampling fails:** Untempered tails sample rare, incoherent tokens → gibberish [Holtzman et al. 2019].

### 5. Top-$K$ Sampling [Fan et al. 2018]
Keep only $K$ most likely tokens, renormalize: $P_K(w) = P(w)/\sum_{w\in V^{(K)}}P(w)$. Adopted by GPT-2 for story generation.
- **Demo:** $K=50$ yields the blog's most human-sounding output. Figures show for a 10-word vocab with $K=6$, the retained mass is ~66% (flat step) vs ~100% (sharp step).
- **Fixed-$K$ flaw:** Blind to distribution shape. Flat step → prunes plausible words ("people","big","house","cat"); sharp step → admits ill-fitted tail words ("down","a").

### 6. Top-$p$ (Nucleus) Sampling [Holtzman et al. 2019]
Dynamic pool: keep smallest $V^{(p)}$ with $\sum_{w\in V^{(p)}} P(w) \ge p$ (e.g., $p=0.92$ → 9 words for flat distribution, 3 for sharp), renormalize.
- **Adapts to entropy:** Wide pool when next token is unpredictable ($P(w\mid$"The"$)$), narrow when predictable ($P(w\mid$"The","car"$)$). Figure `top_p_sampling.png` contrasts.
- **Code:** `top_p=0.92, top_k=0` disables Top-$K$; often combined as `top_k=50, top_p=0.95` (low-rank guard + dynamic adaptation). `num_return_sequences=3` gives independent samples with same prompt (demo shows three distinct continuations).
- **Practical sweet spot:** Both $K$ and $p$ work; Nucleus is more elegant but they are often used together.

### 7. Self-Consistency — Sample-and-Marginalize for Reasoning (Wang et al. 2022)
Replaces greedy CoT decoding with **diverse sampling + majority vote**: sample $m\!=\!40$ CoT paths $(r_i,a_i)$ via $T\!=\!0.7,k\!=\!40$ (or $T\!=\!0.5$ for UL2), parse $a_i$ after `The answer is`, pick $\arg\max_a \sum \mathbb{1}[a_i=a]$ (Table 1: majority 74.4 ≈ normalized weighted sum, far above unnormalized 59.9). Introduced in [[source-self-consistency-improves-chain-of-thought-reasoning]] as fix to Wei et al. greedy CoT: PaLM 540B GSM8K 56.5→**74.4 (+17.9)**, SVAMP 79.0→86.6, AQuA 35.8→48.3. Outperforms sample-and-rank, beam search (beam 40 →10.2% vs SC 26.9% on AQuA UL2 due to diversity collapse), and prompt-ensemble (+1.5–3% vs +10.6%). Robust to imperfect prompts (random numbers) and zero-shot CoT (43.0→69.2); consistency % correlates with accuracy → uncertainty signal. Costs $m×$ tokens, requires fixed answer set. See [[self-consistency]] for full taxonomy vs greedy/beam.

### 8. Beyond — Training vs Decoding & Modern Extensions
The blog's *Conclusion* stresses via Welleck et al. 2019/2020: **repetition may be a training artifact**, not purely decoding — unlikelihood training can make beam *more* fluent than Top-$p$ by human evaluation, and Top-$K$/$p$ still repeat. No single decoder dominates; choose per task. The *Appendix* points to `GenerationConfig`, streaming, constrained decoding, and the full `generate` API. Post-2020 extensions not in the blog — contrastive search, typical sampling, mirostat, repetition/frequency penalties, grammar-guided/structured decoding, and self-consistency — extend the same logits-reshaping framework.

## How It Works

```
Prompt tokens W0 ──► Transformer LM Head ──► Logits
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
                  Greedy/Beam           Temperature            Top-K / Top-p
                  argmax / B-best       logits/T               Filter & Renormalize
                         │                    │                    │
                         └────────────────────┼────────────────────┘
                                              ▼
                                   P'(w_t | w_<t, W0)
                                              │
                                 w_t ~ or = argmax P' ──► KV-cache update ──► next step until EOS
                                              │
                                   no_repeat_ngram blocks
```

**`transformers` flags mapped in [[source-how-to-generate]]:**

| Flag | Effect |
|------|--------|
| `max_new_tokens=40` | Generation length |
| `num_beams=5` | Beam width (1 = greedy) |
| `early_stopping=True` | Stop when all beams hit EOS |
| `no_repeat_ngram_size=2` | Ban repeating $n$-grams |
| `num_return_sequences=5` | Return top $N$ hypotheses/samples |
| `do_sample=True` | Enable stochastic sampling |
| `temperature=0.6` | Sharpen/flatten |
| `top_k=50` / `top_p=0.92` | Pool truncation (set other to 0 to disable) |
| `pad_token_id=eos_token_id` | GPT-2 padding fix |
| `set_seed(42)` | Reproducible samples |

## Practical Implications
- **Open-ended generation (story, chat, creative):** Prefer `do_sample=True` with `temperature` + `top_p` (≈0.9–0.95) ± `top_k` (40–50). Greedy/beam will be deterministic and loop.
- **Length-predictable / faithfulness-critical (MT, summarization, code, JSON):** Prefer `num_beams=4–8` + `no_repeat_ngram_size=3` or greedy with low $T$; optionally rerank `num_return_sequences`. Beam's higher-probability guarantee matters more than diversity.
- **Debugging repetition:** First try `no_repeat_ngram_size` then consider repetition penalty / frequency penalty (not in blog) or unlikelihood training. The blog shows a 2-gram ban cures the dog prompt but warns against over-blocking.
- **Reproducibility vs diversity:** Fix `set_seed` for eval; remove for production diversity or request `num_return_sequences>1`.
- **Cost:** All decoders share the same prefill + KV-cache decode loop (see [[inference]]); beam multiplies memory/FLOPs by $B$, sampling does not. Choose smallest $B$ that suffices — $5$ beams already produce near-identical hypotheses for open-ended tasks.

## Connections
- Realizes the autoregressive loop inside [[inference]] — sits between **logits → softmax → sampling** and **KV-cache** update.
- Built on the [[transformer]] decoder-only LM head; visualized in [[source-transformer-explainer]] and Tokenization-dependent via [[tokenization]] / [[huggingface]] `AutoTokenizer`.
- Temperature/Top-$p$ also underlie RLHF-served assistants (see [[rlhf]]) where $T$ is tuned for helpfulness vs creativity.
- Failure modes (repetition, incoherence) relate to [[hallucination]] and to [[pretraining]] MLE training objectives.

## Open Questions
- Can decoding alone cure neural text degeneration, or is training-objective reform (unlikelihood, contrastive) necessary? Welleck evidence points to training.
- What is the optimal dynamic schedule for $p$/$K$/$T$ across generation length (e.g., lower $T$ early, higher later)?
- How do modern structured decoding methods (constrained JSON, grammar-guided generation) compose with nucleus sampling without breaking distributional guarantees?

## Sources
- [[source-how-to-generate]]
- [[source-transformer-explainer]]
- [[source-deep-dive-into-llms-like-chatgpt]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
