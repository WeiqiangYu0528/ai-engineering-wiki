---
type: source-summary
title: "Contextual Word Representations: A Contextual Introduction"
summary: Noah Smith's (UW/AllenAI) invited Communications of the ACM (June 2020) introductory essay — intentionally non-mathematical, non-algorithmic — tracing how NLP moved from discrete word integers to static distributional…
status: verified
visibility: public
author: "Noah A. Smith (University of Washington / Allen Institute for AI)"
source-type: paper
url: "https://arxiv.org/abs/1902.06006"
date-published: 2020-04-17
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
  - rag
key-concepts:
  - "[[embeddings]]"
  - "[[word2vec]]"
  - "[[bert]]"
  - "[[tokenization]]"
  - "[[pretraining]]"
key-entities:
  - "[[stanford-university]]"
verified-by: agent
verified-on: 2026-08-27
---

# Contextual Word Representations: A Contextual Introduction

## Summary
Noah Smith's (UW/AllenAI) invited ***Communications of the ACM*** (June 2020) introductory essay — intentionally non-mathematical, non-algorithmic — tracing how NLP moved from discrete word integers to static distributional vectors and finally to **contextual word (token) vectors**. It frames Word2Vec/ELMo/BERT as successive refinements of Firth's *distributional hypothesis* ("words similar if they occur in similar contexts"), explains why type-level vectors fail on polysemy (`bank`, `get` → 30+ senses, `gin` disambiguation), and presents **ELMo** (Peters et al. 2018a) as the inflection point: bidirectional LSTM language models produce per-token vectors conditioned on full left+right sentence context, yielding 4–16% relative error reductions across QA/SRL/NER/coreference and foreshadowing BERT/GPT-2/RoBERTa/T5/XLM/XLNet. Smith closes with cautionary notes on bias, syntax/semantics beyond words, and evaluation limits, plus explicit pointers to future low-resource and efficiency directions.

## Key Takeaways
1. **From discrete integers → word vectors → contextual token vectors — a deliberately staged narrative.** §1–2 define token vs type, then discrete integer codes (arbitrary, no similarity). §3 motivates vectors over integers via three NLP uses (document classification, translation evidence, generation) and Smith's food-word fill-in-the-blank (`S. will eat anything, but V. hates __ → peas/sprouts/chicken`) — shared evidence requires shared similarity, which integers destroy. Features (one-hot, WordNet, surface attributes like capitalization) are successive vector enrichments before distributional learning.
2. **Distributional vectors operationalize Firth (1957) at scale.** §4 introduces Brown clustering (56M tweets hierarchy), count-based context vectors (Fig 2: `astronomers/bodies/objects` cosine via raw co-occurrence), and dimensionality reduction (LSA/Hill etc.) that trades interpretability for compressed distributed representations with linear regularities (`man:woman :: king:queen`). Scaling limits (observable contexts explode) pushed SGD + word2vec (Mikolov et al. 2013) + DistBelief; Smith explicitly maps static vectors to the pre-ELMo world where type-level vectors (word2vec, GloVe, char-based Ling et al. 2015, multilingual Faruqui & Dyer 2014) are pretrained then fixed or fine-tuned for downstream neural nets.
3. **Contextual vectors solve the polysemy problem by modeling tokens, not types.** §5 is the pivot: prior work requires one vector to capture all senses (ELMo's 30+ senses of `get`; `gin` as liquor/trap/machine/game); token vectors instead ask only `what does gin mean in "I use two parts gin to one part vermouth"?` → `vodka` becomes near under contextual similarity. Mechanistically: start from type vectors → pass through neural sequence model that maps arbitrary-length left and/or right contexts to a fixed-length "context vector" — ELMo does this with two LSTMs (forward to sentence start, backward to sentence end). Training objective = **language modeling** (predict next word from history) via RNN LMs (Sundermeyer et al. 2012; Goldberg 2017), whose context states become the token vectors.
4. **ELMo's empirical sweep — rare uniform gains across 4+ benchmarks.** §5 "Why exciting?": ELMo vs static vectors — SQuAD 9% relative error reduction, OntoNotes SRL 16%, CoNLL-2003 NER 4%, OntoNotes coreference 10% (plus text-classification via Howard & Ruder 2018/ULMFiT). BERT (Devlin et al. 2019) then delivers additional 45% relative over ELMo on QA and 7% on SRL; on SWAG (Zellers et al. 2018) ELMo +5% over static, BERT +66% over ELMo — showing the headroom of masked LM over LM.
5. **Cautionary notes and what's next — bias, compositionality, evaluation.** §6–7: (a) vectors inherit corpus biases (`doctor↔male`, `nurse↔female`; Bolukbasi et al. 2016, Caliskan et al. 2017) and contextualization offers new mitigation paths; (b) language is more than words — syntax/semantics/pragmatics beyond token vectors remain; (c) NLP ≠ single benchmark — progress measures debated. Future (§7): multi-stage finetuning protocols, low-resource languages/genres (Mulcaire et al. 2019 polyglot), cheaper variational pre-training (Gururangan et al. 2019), probing linguistic generalizations (Goldberg 2019 BERT syntax; Liu et al. 2019a transferability).

## Detailed Notes

### §1 Preliminaries — Token vs Type (§1)
- Token = observed instance (13 tokens in first paragraph sentence; end-of-sentence `.` separate). Type = abstract distinct word (11 types, 10 case-insensitive). Corpus = collection counting tokens per type.

### §2 Discrete Words
- Strings → integers (arbitrary/alphabetical/corpus-order, up to 2³²). Data-structure view (Lisp gensym), fast equality, vocabulary expansion, but no meaning.

### §3 Words as Vectors — Why Integers Fail (§3, Fig 4)
- Three uses needing similarity: doc classification (`delightful → positive` but `S. will eat ...` counterexample shows context dependence), translation evidence (`cucumber → concombre`), generation. OOV `blicket` motivates sharing.
- Two epistemologies: rationalist (hand-built WordNet hyponymy/synonymy, syntactic categories) vs empiricist (corpus-driven), usually intertwined.
- Vector dimensions as features: one-hot (discrete equivalent), class membership (days of week), morphological (know/known/knew), surface (capitalization, length, digits), semantic magnitudes (weight: elephant 12,000 vs cat 9 — `purple`/`throw` nonsense). Static features handle OOV via surface form.

### §4 Distributional Vectors (§4, Figs 1–3)
- Firth: distributional hypothesis. Brown et al. (1992) clustering → interpretable hierarchy (e.g., 00110 prefix clusters of similarly-spelled variants + hashtags from 56M tweets, Owoputi et al. 2013).
- Raw count vectors: dimensions = every other word's within-window frequency (example `astronomers`/`bodies`/`objects` from science news; cosine 0 vs 0.134 vs 0.306 shows bodies→objects). High dimension → redundancy → dimensionality reduction (SVD) → distributed representations (§4 fn5: distributional ≠ distributed — orthogonal terms!).
- Vector-space semantics: Turney & Pantel (2010) survey, analogy arithmetic; compressed vectors evaluated via nearest neighbors, often semantically correct.
- Scaling: distributed vectors as learned parameters optimized via (stochastic) gradient descent → word2vec's fast stochastic optimization + industry pre-training at billion-token scale.
- Advances enumerated: neural net feeding (Collobert et al. 2011 — pretrained/finetuned/scratch), retrofitting to WordNet (Faruqui et al. 2015), bilingual alignment (Faruqui & Dyer 2014), char-based (Ling et al. 2015 — morphology + spelling variants like `would/wud/wld/wouldd/whould`).

### §5 Contextual Vectors — ELMo & Beyond (§5, Fig 5)
- Type vectors must capture all senses → harder than necessary; contextual token vectors (e.g., two `a` in Smith's first sentence get different vectors; `plant` as vegetation vs factory) condition on specific token context → near neighbours are context-appropriate substitutions.
- ELMo (Peters et al. 2018a) insights: (1) arbitrary-length context → single vector via neural sequence model (LSTM) on both sides; lookup table → neural composition. (2) Language modeling (Sundermeyer et al. 2012 RNN LM) as scalable unsupervised objective; ELMo concatenates forward/backward LM states. Visualized as Fig 5 contextual cloud vs Fig 3 static.
- Successor survey (2019 snapshot, all post-conception): GPT-2 (Radford et al. 2019), RoBERTa (Liu et al. 2019b), T5 (Raffel et al. 2019), XLM (Lample & Conneau 2019), XLNet (Yang et al. 2019). Distinguishes BERT's cloze+NSP objective (Devlin et al. 2019 fn11) from ELMo's LM.
- Open questions at writing: relative merits of architectures, role of finetuning (Dai & Le 2015 assumed necessary), dataset scale effects, ELMo vs BERT vs ULMFiT.

### §6–8 Caution / Next Steps / Reading
- Bias: corpus bias → vector bias; active debiasing research.
- Beyond words: syntax/semantics/pragmatics + contextual vectors' surprising help with parsing.
- Evaluation: benchmarks incomplete, controversial, need human + automatic; NLP progress measurement itself research.
- Next: iterative finetuning cascades, low-resource/polyglot, compute-efficient pre-training, linguistic probing.
- Reading list: Bender (2013) / Bender & Lascarides (2019) linguistics; Eisenstein (2019, ch 14) math treatment; original Peters et al. 2018a / Devlin et al. 2019.

## Notable Quotes
> "After reading this document, you should have a general understanding of word vectors (also known as word embeddings): why they exist, what problems they solve, where they come from, how they have changed over time, and what some of the open questions about them are." — Abstract

> "Where might this information about similarity come from? There are two strands of thought ... One suggests that humans ... know this information ... An example ... is WordNet. ... The other suggests that the information resides in artifacts such as text corpora." — §3

> "An important idea in linguistics is that words ... that can be used in similar ways are likely to have related meanings (Firth, 1957) ... we are taking a distributional view of word meaning." — §4

> "With hindsight, we can now see that by representing word types independent of context, we were solving a problem that was harder than it needed to be." — §5

> "If every word token is going to have its own vector, then the vector should depend on an arbitrarily long context of nearby words." — §5

> "Whether the development of contextual word vectors completely solves the challenge of ambiguous words remains to be seen." — §5

> "Like any engineered artifact, a computer program is likely to reflect the perspective of its builders. ... If the text corpus signals associations ... these associations should be expected to persist in the word vectors." — §6

> "A full explanation of the differences in the learning algorithms, particularly the neural network architectures, is out of scope ... it's fair to say that the space of possible learners for contextual word vectors has not yet been fully explored." — §5

## Concepts Introduced or Referenced
- [[embeddings]] — Evolution discrete → static distributed → contextual vectors; distributional vs distributed distinction (fn5); retrofitting/bilingual/char variants.
- [[word2vec]] — As canonical static distributional learner (Mikolov et al. 2013) that enabled billion-token pretraining via stochastic optimization; stepping stone to contextual.
- [[bert]] — Successor to ELMo; Devlin et al. 2019 innovations (deep bidirectional encoder, Cloze/MLM + NSP) vs ELMo's shallow concat LSTM LM.
- [[tokenization]] — Word token identification, English whitespace/punctuation assumption, token vs type counting — precursor to subword.
- [[pretraining]] — Language modeling as unsupervised pre-training for contextual vectors; ELMo's large-corpus pre-training → token-vector reuse vs BERT's masked LM.
- [[transformer]] / [[self-attention]] — Implicit successors (GPT-2, BERT, RoBERTa, T5, XLNet) listed as contextual vector descendants at essay's close.

## Critical Assessment
**Strengths:** Rare synthesis that is both historically grounded (Firth → Brown → LSA → word2vec → ELMo) and pedagogically accessible without math; clearly articulates *why* contextualization helps (polysemy, OOV, context-specific substitution) with memorable examples (food fill-in-the-blank, `gin`/`vodka`, `blicket`); accurately forecasts 2019–2020 trajectory (BERT/RoBERTa/T5 benefits) despite 2020 cutoff; honest about bias/evaluation limits.

**Limitations / Gaps:** Pre-Transformer bias — ELMo (LSTM) centric; Transformer/self-attention mechanics not explained (intentionally non-mathematical). By 2026, its successor list stops at XLNet (2019) — missing GPT-3 scaling, Chinchilla/Llama 3 data regimes, and instruction tuning. No quantitative detail on ELMo vs BERT ablation (e.g., masking 80/10/10, NSP) — defer to [[source-bert-pre-training-of-deep-bidirectional-transformers]].

**Contradictions / Notes vs. existing wiki:** No contradiction — complements [[source-efficient-estimation-of-word-representations-in-vector-space]] (static Word2Vec) and [[source-bert-pre-training-of-deep-bidirectional-transformers]] (ELMo→BERT transition) by providing the narrative bridge. Existing [[embeddings]] page distinguishes static vs contextual but lacks the discrete→static historical arc (Brown, LSA, Firth) this source supplies. The bias discussion enriches [[llm-bias]] / [[trustworthiness-in-llms]] lineage.

## Sources
- Paper PDF: https://arxiv.org/pdf/1902.06006.pdf
- Saved raw: [https://arxiv.org/abs/1902.06006](https://arxiv.org/abs/1902.06006)
- Published: *Communications of the ACM*, June 2020 (expanded invited version)

---

**Source:** Contextual Word Representations: A Contextual Introduction by Noah A. Smith (University of Washington / Allen Institute for AI) — <https://arxiv.org/abs/1902.06006>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
