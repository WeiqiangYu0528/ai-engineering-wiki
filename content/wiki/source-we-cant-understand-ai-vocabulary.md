---
type: source-summary
title: "We Can't Understand AI Using our Existing Vocabulary"
summary: The Feb 2025 position paper by Hewitt, Geirhos, and Kim (Google DeepMind, arXiv 2502.07586, CS224n Week 8 Tue — Been Kim required) argues interpretability is a communication problem between humans and machines who…
status: draft
visibility: public
author: "John Hewitt, Robert Geirhos, Been Kim"
source-type: paper
url: "https://arxiv.org/abs/2502.07586"
date-published: 2025-02-11
date-ingested: 2026-08-26
tags:
  - eval-safety
  - llm-fundamentals
key-concepts:
  - "[[interpretability]]"
  - "[[ai-ethics]]"
  - "[[evaluation]]"
key-entities:
  - "[[google-research]]"
---

# We Can't Understand AI Using our Existing Vocabulary

## Summary
The Feb 2025 position paper by Hewitt, Geirhos, and Kim (Google DeepMind, arXiv 2502.07586, CS224n Week 8 Tue — Been Kim required) argues interpretability is a **communication problem** between humans and machines who **conceptualize the world differently** (spaces H and M, with H−M, M−H, H∩M in Fig 2). Because of this gap, we cannot rely on existing human vocabulary; we must deliberately develop **neologisms** — new words that reference precise human concepts to teach machines, or machine concepts humans need to learn. Successful neologisms hit a **useful level of abstraction** (not too mechanistic/detailed nor too behavioral/high-level), lessen **confirmation bias/anthropomorphism**, enable **compositionality** with natural language, and provide a **human interface for control**. Rebuts four alternative views (scale will auto-converge; existing words suffice; exhaustive circuit map; no abstraction needed). Proof-of-concept **neologism embedding learning** freezes Gemma, adds new token embedding w∉V, and optimizes preference loss (DPO/APO) on datasets exemplifying human concepts (length, diversity) and machine concept (good_M). Shows length neologism `ensure_w^h` makes long generations succeed where prompting fails; diversity neologism dramatically improves exploration in number-guessing; good_M captures model's idiosyncratic quality notion (3.8 vs 3.2 self-score).

## Key Takeaways
1. **Conceptualization Difference is premise**: Machine sentiment ≠ human sentiment; even seemingly shared H∩M concepts diverge on inspection. AlphaGo move 37 vs Lee Sedol Game 2 (Wired 2016) had underlying M−H concept still not understood; AlphaZero superhuman chess concepts were alien yet **teachable** to 4 top grandmasters via `[[source-bridging-human-ai-knowledge-gap-alphazero]]` (Schut 2023) — proof such concepts are learnable but need referencing.
2. **Abstraction problem**: Forward-pass program is maximally precise but not *understanding*; behavioral input-output map ("AlphaZero doesn't mind material") is understandable but insufficient for control/trust. Neologisms live in middle (Fig 3) — between mechanistic (closer to circuits) and behavioral benchmarking — balancing reusability (broadly applicable like "house") vs informativeness (discriminative like "doomscroll" vs "vibe").
3. **Three problems motivate neologisms**: conceptualization difference (cannot reference concisely, do not yet understand), abstraction (which level?), confirmation bias (humans want to see human-like sentiment neuron). Neologisms solve **referencing** (concise name) while understanding remains to be built within **proximity/ZPD** (Vygotsky 1978) — targeted at learners who can stretch.
4. **Why neologisms help** (five mechanisms): (a) concisely reference new learnable concepts in proximity zone (e.g., Dutch "Gezelligheid", Korean "Jeong" untranslatable without paragraph), (b) moderate useful abstraction via dual pressures (applicability vs informativeness), (c) lessen bias by labeling `sentiment_M` not `sentiment` (reminds difference), (d) enable compositionality — finite symbols → infinite meanings; combine taught words together, (e) provide natural language control interface — use expressive tools of language rather than internal representation surgery (SAEs, probes).
5. **Proof-of-concept works while preserving model**: Neologism embedding learning adds w to tokenizer/embedding E ∈ R^{d×|V|} → E_w ∈ R^d, keeps θ frozen, so without w model identical (Fig4 guarantee). Optimizes `min_{E_w} E_D[L(x,y_c,y_r)]` where x contains w prompt ("Ensure_w^h length ≥600"). Trained on LIMA (Zhou 2023) with preference pairs from teacher Gemini 1.5 Pro or self-scored Gemma. Length: base Gemma *never* satisfies 400-600/600-1000 constraints, neologism largely does (Fig5). Diversity: training on k-th vs (k-1)th Gemini response; toy guessing 1-9: ideal uniform 69% in 10 guesses, Gemma baseline biased to 5/7 → ~20% in 100 guesses, with `diverse_w^h` dramatically more varied → far fewer samples needed (Fig6). Good_M: sample k Gemma responses per LIMA instruction, score with Gemma, train `good_w^m` on "Give me response you think is good_w^m" — achieves 3.8 vs 3.2 (bias to 4) and interestingly "extremely not good_w^m" triggers refusals.
6. **Alternative views rebutted**: (3.1) Scale auto-convergence false — adversarial sensitivity (one-token jailbreak) persists, superhuman (AlphaFold/Go) will *widen* gap. (3.2) Existing vocab sufficient via long description — possible but not concise/compositional (house without word). Wittgenstein limits of language = limits of world. (3.3) Exhaustive circuit map — not scalable, neuroscience shows c. elegans connectome (Cook 2019) insufficient for understanding. (3.4) No abstraction/mechanistic gold standard — which level (layers/circuits/units/code/silicon/atoms) arbitrary; mechanistic alone is one-way street, misses proximity/composition.

## Detailed Notes

### Framing history
- Continues Kim's M/H Venn (Kim 2022) and agentic interpretability agenda (Kim et al. 2506.12152). Positions against pure probing/saliency interpretability that searches for human correlates: Lakretz 2019, Hewitt & Manning 2019 linguistic probes; Burns 2023 truth directions — useful but prone to anthropomorphizing.
- Wittgenstein epigraph motivates linguistic relativism: language expansion expands world.

### Neologism desiderata
- **Reusability** → not too exacting (e.g., word for exact chair placement useless). Analogous to full mechanistic; too low-level not reusable.
- **Informativeness** → not too vague (few words like "thing"). Analogous to behavioral only.
- **Proximity** → must be within ZPD: between what learner can do alone vs with guidance. Schut et al.'s elite grandmasters exemplify proximity for chess; for LMs, neologisms target developers/users who can stretch.
- **Participation** → must plug into natural language grammar, combine (houseboat), enable prompting flexibility.

### Method formulation (Sec 5.1-5.2)
- Formal: p_θ LM over V, embeddings E∈R^{d×|V|}. Add w∉V → V'=V∪{w}, E_w new. Dataset D={(x_i,y_{i,c},y_{i,r})} strings over V' containing w. Example "Ensure_w^h that length ≥600" vs chosen meeting length, rejected not. Loss L = DPO (Rafailov 2024) or APO variant (D'Oosterlinck 2024, App A): `-logσ(β log p_θ(y_c|x)/p_θ(y_r|x) + β log p_{θ0}(y_c|x)/p_{θ0}(y_r|x)) - logσ(β log p_θ(y_c|x)/p_{θ0}(y_c|x))`.
- Neologism for H→M vs M→H: same optimization, direction differs conceptually — H→M teaches machine desired human behavior; M→H captures machine behavior to then query w to understand (contrast chosen/rejected machine-scored).
- Merits vs soft prompting (Lester 2021; Bailey 2023 bug not feature): soft prompt prepends to *all* inputs, not interpretable, not user-controlled; neologism participated as natural token, user chooses when/context, guarantee unchanged when not used, composable. Vs full finetune/LoRA (Hu 2022): lightweight, no model drift for non-users.

### Experiments reproduced in detail
- **Length**: 2 constraints 400-600, 600-1000. Base failure illustrates prior mismatch.
- **Diversity**: teacher conditioning on up to 4 previous responses to generate kth different; captures inference-time scaling need (Brown 2024). Evaluation narrow but shows control knob.
- **Good_M**: self-preference pipeline similar to RLHF reward but distilled into token, not weight update. Effect modest (0.6 points) but qualitatively distinct (effusive vs refusal).

### Fit to other interpretability (Sec4)
- **Feature attribution** (Sundararajan, Lundberg, Selvaraju, Shrikumar, Smilkov): critics show can't distinguish trained vs untrained (Adebayo 2018); alternative hypothesis is metric incapable of machine concept, not attribution truly same — neologism perspective reframes.
- **Concept discovery** (Bau, Ghorbani, Fel, Lang, Rane, Schut): naming attempts lack systematic reusability/composition; could be foundations for neologism learning.
- **Faithfulness** (Lipton, Doshi-Velez & Kim): neologisms don't solve but provide new eval — success if control validated (e.g., good_M but short → high quality short easily checked).
- **Probing/representation engineering** (Alain & Bengio, Ettinger, Shi; Zou): shows simple accessibility of complex concepts; engineering steers. Useful for M∩H but question when/where to apply remains.

### Teaching superhuman
- Explicitly cites Schut et al. 2023/2025; neologism learning extends from puzzles to language where prototypes insufficient.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 3 of 5 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2502.07586](https://arxiv.org/abs/2502.07586)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Die Grenzen meiner Sprache bedeuten die Grenzen meiner Welt (The limits of my language are the limits of my world)" — Wittgenstein, epigraph

> "We cannot rely on our existing vocabulary... Instead, we should strive to develop neologisms: new words that represent precise human concepts that we want to teach machines, or machine concepts that we need to learn."

> "A machine’s notion of sentiment is different from a human notion of sentiment. Likewise for high-quality code, or topic."

> "Even something as simple as a 'sentiment neuron,' if given its own new word, reminds us that this sentiment-like concept of the machine is likely dissimilar from what we call sentiment..."

> "Successful words in a language strike useful levels of abstraction: they’re not too exacting and low-level... [nor] too high-level... Erring too high-level is alike to only doing behavioral testing."

## Concepts Introduced or Referenced
- [[interpretability]] — Central: defines interpretability as communication problem; proposes neologisms at mid-abstraction between mechanistic and behavioral; provides proof-of-concept embedding method.
- [[ai-ethics]] — Anthropomorphism/confirmation bias mitigation; notes if safety concepts already found they'd be used instead of RLHF data — relevant to TrustLLM/bias eval.
- [[evaluation]] — Reframes faithfulness evaluation via control success; parallels simulatability in `[[source-agentic-interpretability]]` Case Learn; critiques current metrics' blindness to machine concepts.
- [[multimodal-ai]] — Chess example hints at multimodal neologisms; brief but connects to teaching superhuman cross-modal grounding.
- [[alignment]] — H→M neologisms are alternative to RLHF (Ouyang 2022) for communicating values efficiently; compositionality enables pluralistic values.
- [[in-context-learning]] — Contrasted with neologism via embedding; diversity via conditioning anticipates inference-time scaling.

## Critical Assessment
**Strengths**: Elegant, broad, philosophically grounded (Wittgenstein, Vygotsky ZPD) yet concrete proof-of-concept with frozen-model guarantee — rare position paper with working mechanism; addresses confirmation bias directly via naming (`sentiment_M`); enables compositionality naturally; pairs well with Schut (needs naming) and agentic interpretability (teaching framework).

**Weaknesses**: Position heavy; proof-of-concept small-scale (Gemma on LIMA, narrow length/diversity/good), not compared to strong baselines like prompt engineering with longer instructions or LoRA; diversity experiment toyish (guessing 1-9). No evaluation of faithfulness of good_M — does "good" reflect model's internal preference or scoring artifact? Compositionality claimed but not demonstrated here (demonstrated in follow-up `[[source-neologism-learning]]`).

**Gaps / Links**: Needs systematic evaluation of abstraction optimum; missing hybrid with inspective tools (how to choose where to probe for M→H extraction). Links to `[[source-neologism-learning]]` (full evaluation, self-verbalization, machine-only synonyms, multi-neologism composition) and `[[source-bridging-human-ai-knowledge-gap-alphazero]]` (source of teachable concepts). Contradiction potential with mechanistic gold standard (Olah 2022) — explicitly addressed but tension remains for safety-critical auditing where exhaustive guarantees needed; paper acknowledges but under-specifies when abstraction suffices.

**Reproducibility**: Method lightweight (single embedding) easily replicable; but preference construction via Gemini teacher introduces teacher bias not ablated.

---

**Source:** We Can't Understand AI Using our Existing Vocabulary by John Hewitt, Robert Geirhos, Been Kim — <https://arxiv.org/abs/2502.07586>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
