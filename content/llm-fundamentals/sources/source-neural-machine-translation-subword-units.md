---
type: source-summary
title: "Neural Machine Translation of Rare Words with Subword Units"
summary: The August 2015 (ACL 2016) Edinburgh paper that introduced Byte Pair Encoding (BPE) to neural machine translation and established subword tokenization as the default solution to open-vocabulary NMT.
status: draft
visibility: public
author: "Rico Sennrich, Barry Haddow, Alexandra Birch"
source-type: paper
url: "https://arxiv.org/abs/1508.07909"
date-published: 2015-08-31
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
key-concepts:
  - "[[tokenization]]"
  - "[[transformer]]"
  - "[[pretraining]]"
  - "[[multilinguality]]"
key-entities:
  - "[[stanford-university]]"
aliases:
  - wiki/source-neural-machine-translation-subword-units
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The August 2015 (ACL 2016) Edinburgh paper that introduced Byte Pair Encoding (BPE) to neural machine translation and established subword tokenization as the default solution to open-vocabulary NMT.</p>
<p class="kb-provenance">Rico Sennrich, Barry Haddow, Alexandra Birch, 2015-08-31. <a href="https://arxiv.org/abs/1508.07909">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
The August 2015 (ACL 2016) Edinburgh paper that introduced **Byte Pair Encoding (BPE)** to neural machine translation and established subword tokenization as the default solution to open-vocabulary NMT. Sennrich et al. show that encoding rare and unseen words as sequences of variable-length subword units (learned via BPE merges) allows a fixed-vocabulary NMT model to translate productively — handling compounding, transliteration, and cognates — without a back-off dictionary. On WMT15 English→German and English→Russian, BPE and character-bigram subword models improve over a large-vocabulary + dictionary baseline by up to **1.1 BLEU (EN-DE)** and **1.3 BLEU (EN-RU)**, with larger gains on rare-word unigram F1 and chrF3.

## Key Takeaways
1. **Open-vocabulary via subwords, not UNK + dictionary:** Word-level NMT with 30k–50k vocab + back-off dictionary fails for 1-to-many mappings (German compounds), unseen word generation, and transliteration. Representing text as subword sequences makes the model itself open-vocabulary and simpler.
2. **BPE adaptation for segmentation:** Initialize vocabulary with characters + `</w>` end-of-word marker; iteratively merge most frequent adjacent pair (`A`,`B` → `AB`) weighted by word frequency, ignoring cross-word boundaries. Final vocab size = initial + `num_merges` (sole hyperparameter). At test time, split into characters then apply learned merges — applicable to any word, no unknown symbols.
3. **Joint vs independent BPE:** Learning BPE on the union of source+target vocabularies (joint BPE) improves consistency (same name segmented similarly in both languages) and yields higher precision/recall on OOVs than independent BPE. For EN–RU with differing alphabets, transliterate Russian to Latin via ISO-9 to learn joint merges, then transliterate back.
4. **Empirical trade-offs:** BPE (59.5k merges, 63k types, 112M tokens vs 100M words) and joint BPE (89.5k merges, 82k types) achieve compact sequences vs characters (550M tokens) while remaining open-vocab, where compound splitting / Morfessor / hyphenation do not. BPE-J90k best on chrF3 and rare F1; char-bigram+50k shortlist best BLEU on EN-DE (25.3). Subwords especially dominate on EN-RU OOV (F1 6.6% → 18.3%) where copying fails.
5. **Sparsity reduction:** Subword units are less sparse than words — frequency rank 50k corresponds to count 60, rank 500k to count 2. Representing the 50k–500k interval via subwords stabilizes unigram F1 versus keeping them as words, where performance collapses until switching to subwords.

## Detailed Notes

### Motivation – three transparent word classes
- Named entities (copy/transliterate: *Barack Obama* → *Барак Обама* / バラク・オバマ)
- Cognates/loanwords (character-level transformations: *claustrophobia* → *Klaustrophobie* → *Клаустрофобия*)
- Morphologically complex words (compositional: *solar system* → *Sonnensystem* = *Sonne+System*)
- Analysis of 100 rare German tokens outside top 50k: 56 compounds, 21 names, 6 loanwords, 5 transparent affixations, etc.

### BPE Algorithm (Algorithm 1)
```python
vocab = {'l o w </w>':5, 'l o w e r </w>':2, 'n e w e s t </w>':6, 'w i d e s t </w>':3}
num_merges = 10
for i in range(num_merges):
    pairs = get_stats(vocab)  # count adjacent pairs weighted by freq
    best = max(pairs, key=pairs.get)
    vocab = merge_vocab(best, vocab)  # regex (?<!\S)bigram(?!\S)
    print(best)
```
- Example merges: `l o → lo`, `lo w → low`, `e r· → er·`
- Guarantees open vocabulary; rare edge case where all occurrences of a symbol merged (e.g., *safeguar* → *safeguard*) not observed; fixable by reversing merges.

### Evaluation Setup
- Data: WMT15 EN→DE 4.2M pairs/100M tokens, EN→RU 2.6M/50M; Moses tokenized/truecased; dev newstest2013, test newstest2014/2015; metrics BLEU (mteval-v13a.pl), chrF3 (character n-gram F3, better for out-of-English human correlation), unigram F1 (clipped precision/recall).
- Model: Groundhog (Bahdanau et al. 2015) bidirectional GRU encoder, hidden 1000, embedding 620, shortlist τ=30k, Adadelta batch 80, train ~7 days, last 4 checkpoints continued with fixed embeddings 12h, 2 clipping thresholds (5.0/1.0) ensembled (8 models), beam 12 length-normalized, fast-align bilingual dictionary filtered softmax (K=30k, K′=10).

### Results
- EN→DE newstest2015: WUnk 20.6/22.8 BLEU, WDict 22.0/24.2 (50.5/52.4 chrF3), C2-50k 22.8/25.3 (51.9/53.5), BPE-60k 21.5/24.5 (52.0/53.9), **BPE-J90k 22.8/24.7 (51.7/54.1)**; unigram F1 all 58.1→58.5, rare 36.8→41.8, OOV 36.8 (copy) vs 33.6 (joint) – subwords higher recall.
- EN→RU: phrase-based 24.3 BLEU, WUnk 18.8/22.4, WDict 19.1/22.8, C2-50k 20.9/24.1, BPE-60k 20.5/23.6, BPE-J90k 20.4/24.1; chrF3 +2.0 over WDict; rare F1 26.5→29.7, OOV 6.6→18.3.

### Analysis
- **Frequency-rank plot (Figures 2–3):** All systems degrade for lower frequency; WDict spike for OOV EN-DE due to names copying; 500k vocab systems switch to subword beyond rank 500k and recover; subwords less sparse → reducing shortlist from 500k→50k improves stability.
- **Manual examples:** *health research institutes* → *Gesundheitsforschungsinstitute* – WDict deletes *health*, subwords produce correct despite oversplitting (*Fo|rs|ch|un|g*) or non-morpheme boundary (*Forsch|ungsinstitu|ten* vs *Forschungs|instituten*). *asinine situation* → plausible loan *Asinin-Situation* due sparsity. EN→RU *Mirzayeva* transliterated correctly, *rakfisk* → *ракфиска* – BPE-60k error (*pra|f|isk*) traced to inconsistent segmentation pair `p|rak|ri|ti` → `пра|крит|и` mis-learned *rak→pra*, joint BPE consistent correct.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 2 passages in this section could not be located in the stored source ([https://arxiv.org/abs/1508.07909](https://arxiv.org/abs/1508.07909)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "We show that open-vocabulary neural machine translation is possible by encoding (rare) words via subword units. We find our architecture simpler and more effective than using large vocabularies and back-off dictionaries." — Sennrich et al.

> "Frequent character n-grams (or whole words) are eventually merged into a single symbol, thus BPE requires no shortlist. The final symbol vocabulary size is equal to the size of the initial vocabulary, plus the number of merge operations – the latter is the only hyperparameter of the algorithm."

## Concepts Introduced or Referenced
- [[tokenization]] — Foundational BPE algorithm, joint vs independent BPE, SentencePiece successor, multilingual cost implications (links to [[multilinguality]] and [[source-do-all-languages-cost-same-tokenization]]).
- [[transformer]] — BPE became the standard tokenizer for original Transformer (WMT 2014 EN-DE 37k joint BPE) and all modern LLMs (see [[self-attention]] sequence length/compression trade-off).
- [[pretraining]] — Subword vocab size determines embedding matrix $V \times d_{\text{model}}$ and sequence length vs compute.
- [[multilinguality]] — Consistent segmentation across languages critical for transliteration; precursor to XLM-R's SentencePiece unigram on raw text.

## Critical Assessment
- **Strengths:** Elegant, minimal, data-driven; requires only frequency counts; unifies compression and linguistic plausibility; robust to oversplitting; open-source subword-nmt widely adopted; direct predecessor to SentencePiece and tiktoken.
- **Limitations:** Greedy frequency merges not linguistically optimal (morpheme boundaries not guaranteed); vocab size heuristic; independent BPE inconsistency across languages; later work shows Unigram LM (Kudo 2018) can outperform BPE on some tasks; does not address script byte-length inequity quantified in Ahia et al. 2023.
- **Contradictions/Updates:** Original paper's NMT was GRU-based; Transformer later adopted same BPE with larger vocabs (32k–256k). XLM-R (Conneau et al. 2019) replaces language-specific BPE+tokenization with SentencePiece on raw text, 250k vocab, and shows joint BPE insights still hold but need scale.

---

**Source:** Neural Machine Translation of Rare Words with Subword Units by Rico Sennrich, Barry Haddow, Alexandra Birch — <https://arxiv.org/abs/1508.07909>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
