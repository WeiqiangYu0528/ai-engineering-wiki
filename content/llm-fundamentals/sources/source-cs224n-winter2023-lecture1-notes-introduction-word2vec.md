---
type: source-summary
title: "CS224N Winter 2023 Lecture Notes 1 (Draft): Introduction and Word2Vec"
summary: Draft Note 1 (John Hewitt, Manning & Hewitt, Winter 2023, 13 pages, cs224nwinter2023lecture1notesdraft.pdf) is the course's narrative introduction to NLP and to the "fundamental, beautiful idea" of representing words as…
status: draft
visibility: public
author: "John Hewitt (Christopher Manning, John Hewitt instructors)"
source-type: article
url: "https://web.stanford.edu/class/cs224n/readings/cs224n_winter2023_lecture1_notes_draft.pdf"
date-published: 2023-01-01
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
  - rag
key-concepts:
  - "[[word2vec]]"
  - "[[embeddings]]"
  - "[[tokenization]]"
  - "[[pretraining]]"
  - "[[transformer]]"
key-entities:
  - "[[stanford-university]]"
aliases:
  - wiki/source-cs224n-winter2023-lecture1-notes-introduction-word2vec
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">Draft Note 1 (John Hewitt, Manning &amp; Hewitt, Winter 2023, 13 pages, cs224nwinter2023lecture1notesdraft.pdf) is the course's narrative introduction to NLP and to the "fundamental, beautiful idea" of representing words as…</p>
<p class="kb-provenance">John Hewitt (Christopher Manning, John Hewitt instructors), 2023-01-01. <a href="https://web.stanford.edu/class/cs224n/readings/cs224n_winter2023_lecture1_notes_draft.pdf">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 5 of 20 figures on this page were not found in [https://web.stanford.edu/class/cs224n/readings/cs224n_winter2023_lecture1_notes_draft.pdf](https://web.stanford.edu/class/cs224n/readings/cs224n_winter2023_lecture1_notes_draft.pdf): `60%`, `2.5`, `50.8%`, `14×180`, `55.4%`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

Draft Note 1 (John Hewitt, Manning & Hewitt, Winter 2023, 13 pages, `cs224n_winter2023_lecture1_notes_draft.pdf`) is the course's narrative introduction to NLP and to the "fundamental, beautiful idea" of representing words as low-dimensional real-valued vectors learned from distributional signal. It frames NLP as building systems that understand/generate human language against the backdrop that human children acquire language with exceptional sample/compute efficiency we still cannot match, surveys applications (MT, QA/IR, summarization) and dual-use/bias concerns, then dives into **representing words**: signifier vs signified (Zuko/tea/coffee/drink similarity thought experiment), discrete one-hot failure (hotel/motel orthogonal, WordNet incompleteness), distributional hypothesis (Firth 1957), and a full **Word2Vec** development — Skip-gram likelihood `L=∏∏P(w_{t+j}|w_t)` with softmax `P(o|c)=exp(u_o^T v_c)/Σ_V exp(u_w^T v_c)`, two vectors per word (`v` center, `u` outside), window `m`, CBOW variant, Huffman/negative-sampling approximations, subsampling (`P(w)=1-√(t/f(w))`), SGD optimization, two-vector averaging, and linear regularities (`king-man+woman≈queen`, `Paris-France+Italy≈Rome`) measured by the 19,544-question analogy test (discussed with caveats: exact-match penalizes synonyms, polysemy unresolved). Closes with implementation pointers (lr 0.025→0 linearly, 1–3 epochs, DistBelief Adagrad, word2vec C code billions words/hour, 1.4M entity vectors on 100B words) and forward pointers to phrase compositionality and contextual embeddings.

## Key Takeaways

1. **Why representation is the central NLP problem — and why word vectors are the first answer.** Notes argue the open problem is *how to represent language* for robust processing/generation, not just scaling models. Child language acquisition (sample/compute efficient, multimodal feedback) vs. modern NLP (needs huge data/compute, still not child-like) motivates deep learning as "toolkit for representing wild variety of natural language." Word meaning complexity is illustrated via Zuko/tea generic vs specific, and coffee/drink similarity judgments — grounding distributional semantics before formalism.
2. **Fullest textual derivation of Word2Vec gradients and optimization tradeoffs in the CS224N canon.** Likelihood `L(θ)=∏_{t=1}^T ∏_{-m≤j≤m,j≠0} P(w_{t+j}|w_t;θ)` → `J(θ)=-1/T log L` with `P(o|c)=exp(u_o^T v_c)/Σ_V exp(u_w^T v_c)` (§3). Two-vector trick (`v` center, `u` context) eases optimization; CBOW averages context vectors (bag-of-words, order-invariant, fastest, syntactic-best) vs Skip-gram predicts context from center (slower, semantic-best 55% vs 24% at 640D/320M per 1301.3781 Table 3). Complexity `O=E·T·Q` with `Q=N·D+N·D·H+H·V` (NNLM) vs `N·D+D·logV` (CBOW, Eq.4) vs `C·(D+D·logV)` (Skip-gram, Eq.5). Huffman hierarchical softmax (Huffman tree `~log Unigram_perplexity(V)`, ~2× vs balanced at 1M vocab) and **negative sampling** (`J_neg=-log σ(u_o^T v_c) - Σ_{k} log σ(-u_k^T v_c)`, σ sigmoid, `k=5-20` small / 2-5 large, noise `U^{3/4}/Z`, §3.3) are derived as softmax approximations.
3. **Subsampling of frequent words is derived, not just stated.** Frequent words ("the","a","in" hundreds of millions) provide less info (France-Paris vs France-the). Frequent vectors stabilize after few million examples. Solution: discard `w_i` with `P(w_i)=1-√(t/f(w_i))`, `t≈1e-5` — aggressively subsamples >t while preserving ranking (§3.3, Eq.5 of Mikolov NIPS 2013), heuristically chosen, 2–10× speedup and better rare vectors. Combined with random window sampling `R∼[1,C]` that down-weights distant words — both sparsify updates.
4. **Linear regularities and their limits are taught with correct caveats.** Vectors exhibit `king-man+woman≈queen`, analogy test `X=vec(biggest)-vec(big)+vec(small) → smallest` nearest cosine (discard query words). Notes explicitly warn: exact-match metric penalizes synonyms, so ~60% ceiling understates quality; static type-level vectors cannot handle polysemy ("bank" river vs finance) — previews contextual [[transformer]] embeddings as successor; 10-example averaging adds ~10% semantic gain (1301.3781 §5).
5. **Bridges to practice and to the next frontier.** Single-CPU CBOW-300 on 783M words ~1 day (36% total), Skip-gram ~3 days (53%), 1 epoch on 2× data ≈ 3 epochs on 1× (Table 5); DistBelief parallel CBOW-1000/Skip-1000 reach 63.7%/65.6% on 6B in 2–2.5 days ×125-140 cores vs NNLM-100 50.8% at 14×180 core-days (1301.3781 Tables 4-6). MSR Sentence Completion 58.9% with Skip-gram+RNNLM (SOTA over 55.4% RNNLM-only). Plus phrase additive compositionality (`Russia+river≈Volga River`, `Germany+capital≈Berlin` via 1310.4546) and code release `word2vec` (billions words/hour) point toward scaling and composition — notes end by motivating artificial neural networks for NLP (window classification precursor).

## Detailed Notes

### §1 Introduction to NLP (pages 1-3)

- **Definition**: field focused on automatic systems that understand/generate human languages.
- **Humans and language**: communicative device for sharing/storage of complex ideas, uniquely human intelligence (Manning 2022); evolved to be learnable/useful — both object of study and enabler for human interaction (e.g., vision-grounded dialogue).
- **Language and machines**: children acquire with exceptional sample/compute efficiency (rich multimodality, feedback) vs. modern NLP still far behind; representation is the fundamental open problem.
- **Applications (1.3)**: MT (ubiquitous but fails 7000 languages, long text, contextual correctness); QA/IR (information-seeking, provenance, interactive dialogue — fastest evolving); Summarization/analysis (market research, opinion, surveillance dual-use); speech-to-text noted as out-of-scope (covered in 224S) and convergence.
- **Trust considerations**: tools work for ~1–100 languages, fail marginalized dialects/accents; biases (race/gender/religion) reflected/amplified; need good science + trustworthy systems.

### §2 Representing Words (pages 3-4)

- **Signifier/signified (2.1)**: "Zuko makes the tea for his uncle." — Zuko sign → entity, tea sign → instance vs generic (likes to make tea). Coffee/drink similarity judgment: which is "more like" tea? Both carry degrees of similarity (people vs determiners) — word meaning endlessly complex, discrete symbols must express continuous nuance while retaining transfer.
- **Discrete one-hot (2.2)**: hotel/motel as indices, `hotel=[0...1...0]` dim ~500k, orthogonal — search fails (Seattle motel vs hotel). WordNet (synsets + hypernyms `panda.n.01 → ... → organism → entity`) incomplete, subjective, stale (missing wicked/badass/ninja/bombest), can't grade similarity.
- **Distributional semantics (2.3)**: Firth 1957 "You shall know a word..."; word's contexts (fixed window) define meaning; banking contexts quoted: government debt ... banking crises (2009), unified banking regulation, shot in the arm — these define banking.

### §3 Word2Vec (§3, pages 5-11 + appendix)

- **Skip-gram likelihood** (pages 5-6): Corpus `w^(1)..w^(T)` length T, vocab V ~1M (30k ablation), `v_w` (center/input) `u_w` (outside/output) `∈ R^D` (D 50-1000), window `m` (4+4 best). Likelihood `L(θ)=∏_t ∏_{-m≤j≤m,j≠0} P(w_{t+j}|w_t)`, `J(θ)=-1/T Σ Σ log P`. Softmax `P(o|c)=exp(u_o^T v_c)/Σ_{w∈V} exp(u_w^T v_c)` — single "correct" label per step, normalization over V is bottleneck.
- **CBOW** (§3, slide-like): averages `N` context vectors (bag-of-words, order invariant) to predict middle word; shared projection `Q=N·D+D·logV`; best 4 future +4 history.
- **Skip-gram detail** (§3.2, Eq.5): current word predicts up to `C=10` each side, random `R∈[1,C]` → `2R` classifications, distant down-weighted.
- **Complexity** (§2, O=E·T·Q): NNLM `Q=N·D+N·D·H+H·V` (Eq.2), RNNLM `Q=H·H+H·V` (Eq.3), CBOW/Skip-gram as above (Eq.4-5). Hidden layer dominates; removing it buys data scaling.
- **Hierarchical softmax** (§2.1): Huffman binary tree `~log2(Unigram_perplexity(V))` (~2× vs balanced at 1M vocab) — frequency-based classes.
- **Negative sampling** (§3.3, Eq. in NIPS 2013 `J_neg`): replaces each `log P` with `log σ(u_o^T v_c)+ Σ_k E[log σ(-u_k^T v_c)]`, `k=5-20` small else 2-5, noise `U^{3/4}` (NCE variant needing only samples, not probabilities). Main difference vs NCE explained.
- **Subsampling** (§2.3 Eq.5 of NIPS paper quoted): `P(w_i)=1-√(t/f(w_i))` `t=1e-5` — preserves ranking, aggressively drops frequent.
- **Two vectors** (§3.4): easier optimization; average both at end; single-vector helps a bit.

### §4 Linear Regularities & Evaluation (pages 9-10)

- 19,544 questions (8869 semantic: common capital, all capitals, currency, city-in-state, man-woman + 9 syntactic: adjective→adverb, opposite, comparative, superlative, present participle, nationality adjective, past tense, plural nouns/verbs) built by pairing manually curated word pairs (Table 1). Evaluation `X=vec(biggest)-vec(big)+vec(small)` nearest cosine → "smallest", discard inputs; synonyms counted wrong — ceilings ~60% but qualitative rich; 10-example averaging +10% absolute semantic.
- Static vectors can't handle polysemy → contextual embeddings ([[transformer]]) successor.

### §5 Practical & Scale (pages 10-11, Tables)

- SGD lr 0.025→0 linearly; 1–3 epochs; DistBelief Adagrad 50-100 replicas; `word2vec` C code billions words/hour; >1.4M entity vectors on >100B words.
- Results: Tables 2-6 of 1301.3781 summarized; MSR Sentence Completion 58.9% Skip-gram+RNNLM (SOTA over 55.4%); other tasks (LRA, SemEval-2012 Task 2 +50% Spearman, sentiment, paraphrase, KB completion).
- Phrase compositionality (`Russia+river≈Volga`) noted as 1310.4546 additive property (log context distribution product).

### Appendix

Full gradient derivations: chain rule through dot products and softmax, `∂J/∂v_c = Σ_j (p_j - y_j) u_j` etc., window-level sum, interactive exercises — preserved in PDF but truncated here for brevity; see PDF binary for full derivation.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 8 passages in this section could not be located in the stored source ([https://web.stanford.edu/class/cs224n/readings/cs224n_winter2023_lecture1_notes_draft.pdf](https://web.stanford.edu/class/cs224n/readings/cs224n_winter2023_lecture1_notes_draft.pdf)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "This note introduces the field of Natural Language Processing (NLP) briefly, and then discusses word 2vec and the fundamental, beautiful idea of representing words as low-dimensional real-valued vectors learned from distributional signal." — Summary

> "Human children, interacting with a rich multi-modality world and various forms of feedback, acquire language with exceptional sample efficiency (not observing that much language) and compute efficiency (brains are efficient computing machines!)" — §1.2 Language and machines

> "Consider the sentence Zuko makes the tea for his uncle. The word Zuko is a sign, a symbol that represents an entity Zuko in some (real or imagined) world." — §2.1 Signifier and signified

> "You shall know a word by the company it keeps (J. R. Firth 1957: 11)" — Distributional semantics

> "Note: speech (or sign)-to-text ... is a massive and useful application, but one we'll largely avoid in this course." — §1.3 applications note

> "In all aspects of NLP, most existing tools work for precious few (usually one, maybe up to 100) of the world's roughly 7000 languages, and fail disproportionately much on lesser-spoken and/or marginalized dialects" — §1.3

> "The word embedding problem attempts to isolate a piece of that challenge: representing the meaning of words." — §2 intro

> "vector('King') - vector('Man') + vector('Woman') results in a vector that is closest to the vector representation of the word Queen" — Linguistic regularities (citing Mikolov 2013c)

## Concepts Introduced or Referenced

- [[word2vec]] — Most narrative derivation of Skip-gram/CBOW, softmax, NEG, subsampling, two vectors, complexity accounting; this note is the primary text source for those derivations.
- [[embeddings]] — Grounds embeddings as solution to discrete representation problem; distributed representations isolate word-meaning subproblem before full language representation via deep learning.
- [[tokenization]] — One-hot vocab `~500k`, 1-of-V encoding vs. subword fix for OOV (polysemy critique anticipates BPE).
- [[pretraining]] — Word2Vec as early self-supervised pretraining (self-supervised next/context prediction on raw text, 6B tokens) → transfers to downstream (sentiment, paraphrase, KB completion); foreshadows LLM pretraining.
- [[retrieval-augmented-generation]] — Banking IR example and dense similarity search; word vectors as retrieval embeddings before DPR.
- [[transformer]] / [[self-attention]] — Explicitly motivates successors: static vectors cannot handle polysemy → contextual embeddings via self-attention remove type-level limitation.
- [[pretraining]] / [[scaling-laws]] — 50-100D vectors underfit at large data (Table 2: 50D 23% even at 783M) — dim and data must scale together, anticipating Chinchilla.

## Critical Assessment

**Strengths:** Best single narrative arc in CS224N for a newcomer: starts from philosophy of language (Zuko example makes signifier/signified concrete) → practical failure modes (WordNet/one-hot search) → distributional fix with banking contexts → full math (likelihood → softmax → two vectors → CBOW/Skip-gram → complexity `O=E·T·Q`) → optimization reality (SGD, sparse updates) → engineering tricks (subsampling `1-√(t/f)`, Huffman, NEG with `U^{3/4}`) → evaluation caveats (exact-match penalty, polysemy) → scale results (DistBelief days vs. weeks) and code release. Cold-start readability higher than papers because gradients are walked through with interactive sessions and appendix.

**Limitations / Gaps:** As draft (Winter 2023), cross-references like "Note 1: Introduction and Word 2Vec 1 2 3" have pagination artifacts from PDF extraction; formulas are interleaved across pages and here condensed — full appendix needed for authoritative gradients; does not cover GloVe (handled in Notes Part II) or modern subword tokenizers beyond noting OOV; additive phrase compositionality is mentioned only as forward pointer, not derived (needs Mikolov 1310.4546). Figures (banking t-SNE, analogy tables) are images not extractable.

**Contradictions / Notes vs. existing wiki:** Complements [[source-efficient-estimation-of-word-representations-in-vector-space]] (1301.3781) — that paper's results are without NEG/subsampling and thus lower total accuracy (53.3% Skip-gram 300D/783M) than the draft's cited NEG+subsampling numbers (61%) — together explain progression; no contradiction but wiki should note pre-NEG vs post-NEG baselines; draft's child-acquisition framing aligns with Manning 2022 citation that earlier winter notes lacked.

---

**Source:** CS224N Winter 2023 Lecture Notes 1 (Draft): Introduction and Word2Vec by John Hewitt (Christopher Manning, John Hewitt instructors) — <https://web.stanford.edu/class/cs224n/readings/cs224n_winter2023_lecture1_notes_draft.pdf>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
