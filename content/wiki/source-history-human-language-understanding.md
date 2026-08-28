---
type: source-summary
title: "Human Language Understanding & Reasoning"
summary: Christopher D. Manning's Dædalus (Spring 2022, American Academy of Arts & Sciences, AI & Society issue) invited essay — the designated Week 1 History reading for CS224n 2026 — condenses 70 years of NLP into four eras…
status: draft
visibility: public
author: "Christopher D. Manning"
source-type: article
url: "https://www.amacad.org/publication/daedalus/human-language-understanding-reasoning"
date-published: 2022-04-01
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
key-concepts:
  - "[[transformer]]"
  - "[[pretraining]]"
  - "[[self-attention]]"
  - "[[embeddings]]"
  - "[[rnn]]"
  - "[[backpropagation]]"
key-entities:
  - "[[stanford-university]]"
  - "[[google-research]]"
  - "[[openai]]"
---

# Human Language Understanding & Reasoning

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 4 figures on this page were not found in [https://www.amacad.org/publication/daedalus/human-language-understanding-reasoning](https://www.amacad.org/publication/daedalus/human-language-understanding-reasoning): `28.4`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Christopher D. Manning's Dædalus (Spring 2022, American Academy of Arts & Sciences, *AI & Society* issue) invited essay — the designated **Week 1 History** reading for CS224n 2026 — condenses 70 years of NLP into four eras and explains the 2018 self-supervised revolution that produced [[pretraining|pretrained language models]] (PLMs) such as [[bert]] and GPT-3 as the precursor to **foundation models**. Starting from the evolutionary argument that language networks human brains together (individual human cognition ≈ chimpanzee, language only few hundred kyr old, writing ~5 kyr ago), Manning traces how simple neural-network calculations at massive scale, trained via [[backpropagation]] on billions of words of self-supervision, learned syntax and world knowledge through the universal task of predicting masked/next words. The essay is both a history lesson that frames all of CS224n and a 2022 snapshot of the shift from task-specific fine-tuning to prompt-based adaptation.

## Key Takeaways

1. **Four eras periodization (the course backbone):** (1) 1950–1969 machine-translation-as-code-breaking, word-lookup + crude morphology/word-order rules; (2) 1970–1992 hand-built rule-based depth — SHRDLU, LUNAR, SAM, LIFER, GUS with declarative knowledge/procedural separation and modern linguistic theories, deployed for DB querying; (3) 1993–2012 empirical ML reorientation — tens of millions of words, counting models then annotated resources (treebanks, NER, WSD) + supervised ML; (4) 2013–present deep learning — dense vector spaces (hundreds/thousands of dims, proximity = meaning), 2013–2018 supervised neural models, **2018 self-supervised breakthrough** — billions of words, own prediction challenges (next-word / masked-word), repeating billions of times → single large pretrained model (LPLM) adaptable via fine-tuning then prompting. Manning notes the 2018 break is so fundamental the third era could be extended to 2017.
2. **Transformer sketch in one paragraph:** Attention = weighted combination of representations from other positions; per-position query/key/value vectors, query compared to key to compute attention weight, weighted average of values repeated many layers with FFN + LayerNorm + residual → representation above mask predicts word (e.g., *committee*). Emphasizes this "humorless Mad Libs" is universal — every form of linguistic and world knowledge helps predict masked words, so the model assembles broad knowledge; syntactic structure and factual memorization emerge (Manning et al. PNAS 2020).
3. **What LPLMs replaced — concrete 2021 quality:** Traditional pipelined NLP (structure → entities → meaning → execution) replaced by fine-tuned LPLMs. Traces MT: limited constructions → statistical parallel corpora (Google Translate 2006) → NMT 2016 → multilingual [[transformer]] 2020 (single net trained on all languages with language-token, 28.4 BLEU En-De). QA via UnifiedQA on Samsung Note 20 passage answers correctly $1,300/5x/6.9-inch and "no" for 20x. Radiological report summarization (Zhang et al. 2020) generation near-human. NER/sentiment improved via breadth of knowledge.
4. **Distributional vs denotational semantics — Manning's definition of meaning:** Contrast reference/denotational (objects/situations) vs distributional/use theory (contexts). Rejects Bender & Koller 2020 critique that distributional is not semantics: meaning = dense network of connections between linguistic form and other things (objects or linguistic forms), graded not binary. *Shehnai* thought experiment (held instrument vs heard via description vs two textual contexts) illustrates partial meanings. By this definition LPLMs learn meanings plus encyclopedic facts (Lincoln 1809 Kentucky, Beyoncé Destiny's Child) but incomplete, needing sensory augmentation.
5. **Foundation models vision (pre-ChatGPT):** Proposes term from Bommasani et al. 2021 (Stanford HAI): millions of parameters trained copiously via self-supervision adaptable to many tasks. Predicts future: small number of expensive-to-train but easily prompt-adaptable foundation models handle most processing and even robotic control, with risks of concentration of power, bias, safety opacity (200B+ training data inscrutable), and persistent limits in careful logical/causal reasoning — accurate premonition of 2023–2026 LLM era and motivates Weeks 2–3 deep dives.

## Detailed Notes

### Evolutionary Framing (§1–2)
- Individual brain intelligence modest vs chimpanzee/bonobo tool use/planning/better short-term memory (de Waal 2017); language's power is networking brains.
- Timeline: prosimian/monkey/ape ancestor ~65M yr, human-chimp split ~6M yr, language few hundred kyr (Pagel 2017), writing ~5 kyr → bronze age to smartphones in few thousand years via high-fidelity code.
- NLP born with MT; Georgetown-IBM demo Jan 1954 (Hutchins 2004) precedes coining "AI" 1956 — Motivates Week1 history slide deck.

### Era Snapshots with Exemplars
- **Era 1** tag: Cold War scientific translation, code-breaking analogy, comically small data/compute.
- **Era 2** systems surveyed in Barr AI Magazine 1980 and deployed Harris IJCAI 1979 12 commercial Robot DB queries; linguistic knowledge explosion separates declarative vs procedural.
- **Era 3** early counting: "what people *capture* — evenly balanced between locations (city/town/fort) and metaphorical notions (imagination/attention/essence)" illustrates count limits; Carroll & Charniak 1992 WS on learning probabilistic dependency grammars from corpora largely failed → turn to treebanks/supervised labels.
- **Era 4**: vector space fix — longer contexts, generalization via proximity not symbol identity; self-supervision (successive next word or masked phrase) billions of repetitions accumulates knowledge deployable to QA/classification.

### Transformer Technical Summary (§3)
- Vectors of real numbers, learned via back-propagation of errors (differential calculus) from prediction task to word representations.
- Architecture: many Q/K/V calculations per layer + fully connected layer + normalization + residual, repeated many layers depth; final mask position vector captures original word.

### Evaluation and Applications (§4–5)
- French Le Monde passage (Trenet "Fou chantant" 1930s Johnny Hess duo) → "Singing Madman" excellent translation cited as quality marker.
- UnifiedQA (Khashabi et al. EMNLP 2020) QA examples verbatim.
- Radiology findings → impression table: findings list (right IJ sheath, SVC, endotracheal tube between clavicular heads, enteric tube side port at GE junction, mediastinal drains, left thoracostomy, low lung volumes, retrocardiac airspace disease, small left pleural effusion) → radiologist vs system impression near identical.

### Philosophical Interlude (§6)
- Formal distributional semantics header Boleda & Herbelot Computational Linguistics 2016; critique Bender & Koller ACL 2020 "Climbing towards NLU."
- *Shehnai* example with two literary citations (An Atlas of Impossible Longing) + definitional elaborations (Indian oboe, holes like recorder + multiple reeds + flared end) show networks not subsets.

### Future (§7–8)
- Beyond text: knowledge-graph neural nets (Logan et al. ACL 2019; Guu et al. REALM), multimodal DALL·E (Ramesh et al. 2021 zero-shot text→image via paired images/text) as early multimodal foundation model; convergence to few models premise.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 4 of 5 passages in this section could not be located in the stored source ([https://www.amacad.org/publication/daedalus/human-language-understanding-reasoning](https://www.amacad.org/publication/daedalus/human-language-understanding-reasoning)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "The last decade has yielded dramatic and quite surprising breakthroughs in natural language processing through the use of simple artificial neural network computations, replicated on a very large scale and trained over exceedingly large amounts of data."

> "Once humans developed language, the power of communication quickly led to the ascendancy of Homo sapiens over other creatures, even though we are not as strong as an elephant nor as fast as a cheetah."

> "Meaning arises from understanding the network of connections between a linguistic form and other things, whether they be objects in the world or other linguistic forms. If we possess a dense network of connections, then we have a good sense of the meaning of the linguistic form."

> "A single such large pretrained language model (LPLM) can be deployed for many particular NLP tasks with only a small amount of further instruction."

> "We have proposed the term *foundation models* for the general class of models with millions of parameters trained on copious data via self-supervision that can then easily be adapted to perform a wide range of downstream tasks." — citing Bommasani et al. 2021

## Concepts Introduced or Referenced
- [[transformer]] — Dominant architecture since 2017 whose attention mechanism Manning sketches; the technical substrate of LPLMs/foundation models.
- [[self-attention]] — Core "query/key/value" weighted combination, repeated many layers; the specific mechanism described in Fig. 1 of essay.
- [[pretraining]] — Self-supervised next-word/masked-word at billion-scale that creates universal LPLM; the 2018 break that redefines eras.
- [[embeddings]] — Dense vector space representation where proximity encodes meaning/syntax; Era 4 prerequisite.
- [[rnn]] — Pre-2017 sequential alternative whose limitations motivated Transformer; contrasted via Era chronology.
- [[backpropagation]] — Differential calculus learning procedure by which vectors are learned from prediction errors; links to Rumelhart et al. 1986.

## Critical Assessment
- **Strengths:** Most concise 14-page synthesis of NLP history by the field's central figure (Stanford SAIL director, ACL president, co-author of the two canonical textbooks) with first-hand perspective; four-era framing is pedagogically durable and echoed verbatim in CS224n 2026 Lecture 01 history slides ([https://www.amacad.org/publication/daedalus/human-language-understanding-reasoning](https://www.amacad.org/publication/daedalus/human-language-understanding-reasoning)); bridges technical (attention equations) and humanistic (evolutionary linguistics) gracefully; foundation-models framing 6 months before ChatGPT proved prescient; openly licensed CC BY-NC 4.0.
- **Limitations:** 2022 snapshot predates RLHF/ChatGPT, scaling laws (Chinchilla), 128K+ contexts, and post-foundation-model alignment/safety literature — must be read alongside [[source-training-compute-optimal-large-language-models]] and [[source-training-language-models-to-follow-instructions-with-human-feedback]] for post-2022 view; MT/QA examples are anecdotal not benchmark numbers; philosophical defense of distributional semantics is brief and dialectical rather than decisive.
- **For CS224n ingest:** Ideal Week 1 anchor — provides narrative spine that makes Week 2 backprop/RNN and Week 3 Transformer technical details meaningful as the "how" behind the history's "what." No contradictions with existing wiki; complements [[source-contextual-word-representations-a-contextual-introduction]] (Noah Smith 2020) which covers word-embedding→ELMo→BERT technical lineage where Manning provides sociotechnical arc.

---

**Source:** Human Language Understanding & Reasoning by Christopher D. Manning — <https://www.amacad.org/publication/daedalus/human-language-understanding-reasoning>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
