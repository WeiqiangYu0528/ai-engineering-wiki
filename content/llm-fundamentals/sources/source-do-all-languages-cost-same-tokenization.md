---
type: source-summary
title: "Do All Languages Cost the Same? Tokenization in the Era of Commercial Language Models"
summary: The EMNLP 2023 paper by Ahia et al. (CMU/UW/AI2) that quantifies multilingual tokenization unfairness in the commercial Language-Model-as-a-Service era.
status: draft
visibility: public
author: "Orevaoghene Ahia, Sachin Kumar, Hila Gonen, Jungo Kasai, David R. Mortensen, Noah A. Smith, Yulia Tsvetkov"
source-type: paper
url: "https://aclanthology.org/2023.emnlp-main.614/"
date-published: 2023-12-01
date-ingested: 2026-08-25
tags:
  - llm-fundamentals
  - eval-safety
key-concepts:
  - "[[tokenization]]"
  - "[[multilinguality]]"
  - "[[evaluation]]"
key-entities:
  - "[[openai]]"
  - "[[huggingface]]"
aliases:
  - wiki/source-do-all-languages-cost-same-tokenization
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The EMNLP 2023 paper by Ahia et al. (CMU/UW/AI2) that quantifies multilingual tokenization unfairness in the commercial Language-Model-as-a-Service era.</p>
<p class="kb-provenance">Orevaoghene Ahia, Sachin Kumar, Hila Gonen, Jungo Kasai, David R. Mortensen, Noah A. Smith, Yulia Tsvetkov, 2023-12-01. <a href="https://aclanthology.org/2023.emnlp-main.614/">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
The EMNLP 2023 paper by Ahia et al. (CMU/UW/AI2) that quantifies **multilingual tokenization unfairness** in the commercial **Language-Model-as-a-Service** era. Analyzing OpenAI's API (cl100k_base / p50k_base, etc.) and other tokenizers on 22 typologically diverse languages with parallel corpora (FLORES-200) and 5 multilingual benchmarks, the authors show that subword tokenizers over-fragment non-Latin and low-resource scripts: the same information can require **up to 5× more tokens** (e.g., Telugu, Amharic, Bengali vs English), causing **proportional API cost inflation**, **reduced effective context window** (few-shot examples no longer fit in 4,096 tokens), and **lower in-context learning utility**. The cost burden is regressive — speakers of the most fragmented languages tend to live in regions where APIs are least affordable — exacerbating the digital divide. The paper advocates for parity-aware pricing and tokenizer design.

## Key Takeaways
1. **Fragmentation is script- and Unicode-driven, not just data imbalance:** Popular LM tokenizers (BPE/Unigram on bytes) disproportionately favor Latin-script / Indo-European languages. Among supported languages, token-length variance for identical content reaches 5×. Heavily affected: Indic non-Latin scripts (Telugu, Tamil, Bengali, Hindi), Amharic (Ge'ez), Burmese, Thai. Root causes include larger UTF-8 bytes per character (e.g., 3 bytes for Telugu vs 1 for English) plus tokenizer byte-fallback and morphology, not solely pretraining data share.
2. **Cost disparity is linear in fragmentation:** Commercial APIs charge per token (e.g., ChatGPT $0.002/1K tokens at publication). Estimated cost for same task: **4–5× higher prompting+generation cost for Telugu/Amharic** on XLSUM, XFACT, CROSSUM vs English; Figure 16 and granular family-script analysis (Figure 4) show consistent bias cheaper for Latin, expensive for non-Latin. XLSUM up to 4× more for Telugu/Amharic.
3. **Utility penalty via context limits:** ChatGPT max 4,096 tokens; fragmented languages pack less information per window. Figure 6: Telugu and Amharic struggle to fit even **one** in-context example for majority of test instances → forced zero-shot, while English fits multiple shots. Evaluation on ChatGPT and BLOOMZ k-shot (0→k) shows consistent performance gains with more shots for all languages where fitting is possible, implying fragmented languages lose the ICL benefit entirely — reduced model utility directly caused by tokenization.
4. **Regressive socio-economic impact:** Languages costing more and performing worse are spoken by populations with lower GDP per capita / HDI — users who can afford least are charged most for poorest service. Correlates cost/fragmentation with World Bank indicators, highlighting equity concern for vendors.

## Detailed Notes

### Motivation & Related Work
- LMs shifted from open research prototypes to closed paid APIs (Abdalla et al. 2023); LM-as-a-Service (Sun et al. 2022). Majority claim multilingual capabilities (Ouyang et al. 2022; Kasai et al. 2023; Lai et al. 2023) yet tokenizer details determine effective cost/utility.
- Subword tokenizers: BPE (Sennrich et al. 2016), SentencePiece Unigram (Kudo 2018), WordPiece (Song et al. 2020) — data-driven frequency-based merges on characters/bytes. Prior work on disproportionate fragmentation (Zhang et al. 2022a; Rust et al. 2021; Muller et al. 2021) and pretraining bias (Ács 2019) — this paper extends to commercial cost framing.

### Experimental Setup (Section 3)
- **Languages:** 22 typologically diverse covering families/scripts and resource levels: English, Danish, German (Germanic Latin); French, Spanish (Romance Latin); Arabic, Hebrew (Semitic); Russian, Bulgarian (Cyrillic); Greek; Chinese, Japanese, Korean (CJK); Hindi, Bengali, Tamil, Telugu, Urdu (Indic/Ge'ez); Thai, Vietnamese; Swahili, Amharic; Turkish. Grouped for analysis.
- **Tasks/Datasets:** 5 multilingual benchmarks with parallel/comparable test sets for same-information comparison: XLSUM, XFACT, CROSSUM, XCOPA, XStoryCloze etc. Stats table provided.
- **Models/Tokenizers:** OpenAI cl100k_base (GPT-4/ChatGPT), p50k_base (GPT-3), r50k_base, plus BLOOMZ, mBERT, XLM-R SentencePiece 250k etc. Compare fragmentation; ICL experiments ChatGPT (gpt-3.5-turbo) and BLOOMZ.

### RQ1 Fragmentation (§4.1)
- Method: FLORES-200 parallel sentences, count avg tokens to convey same sentence across languages, normalized to English. Large variance: some languages 5×.
- Finding: cl100k_base relatively better than older p50k but still 1.5–4× disparity; XLM-R 250K SentencePiece more equitable but variance remains. Not solely high-resource bias — script/Unicode bytes matter.
- Figure 2 fragmentation rates across tokenizers; Figure 16 cost; Figure 4 family-script granular.

### RQ2 Cost (§4.2)
- Estimate cost per language as function of avg sequence length. Cheaper for Indo-European/Latin, expensive many non-Latin. Indic mid-resource non-Latin close to 5× vs English. Report relative experiment costs across tasks due required zero-shot for some languages. XLSUM 4× prompting+generation Telugu/Amharic; similar XFACT/CROSSUM Figure 11.

### RQ3 Model Utility (§4.3-4.4, Figures 6-7)
- Context limit illustration: token budget 4096, plot number of few-shot examples that fit. Telugu/Amharic only zero-shot for majority.
- Measure ChatGPT/BLOOMZ k-shot performance vs metric; focus relative improvement within language as k increases, not absolute cross-language. Most languages improve zero→1→k; Telugu, Thai cannot fit 1 → no gain. Suggests could have benefited if tokenization equitable.

### RQ4 Socio-economics
- Correlate fragmentation/cost with GDP, affordability proxies. Region map/socio factors cropped figure (Figure in extended). Indication regressive pricing.

### Discussion (§5) & Recommendations
- **Transparency:** Vendors should publish per-language fragmentation rates and limitations.
- **Pricing:** Rethink: character/byte-normalized pricing, language-sensitive equalized cost per information, or decouple from tokenizer; alternatives explored.
- **Technical:** More equitable tokenizers — bytes-level without script bias, parity-aware BPE, script-balanced vocab training, per-script normalization, enlarge non-Latin vocab rather than byte fallback.
- **Community:** Include token-length-adjusted metrics when claiming multilingual capabilities.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 3 passages in this section could not be located in the stored source ([https://aclanthology.org/2023.emnlp-main.614/](https://aclanthology.org/2023.emnlp-main.614/)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "What constitutes a token, however, is training data and model dependent with a large variance in the number of tokens required to convey the same information in different languages."

> "Languages that are more heavily segmented have predictably higher costs of usage. Overall, we see that the API costs are biased towards (i.e., cheaper for) Indo-European and Latin script languages and against many non-Latin script languages. In most mid-resourced Indic languages with non-Latin scripts, we see close to a 5× increase in cost compared to English."

> "These speakers tend to also come from regions where the APIs are less affordable, to begin with ... users who likely cannot afford high API costs are charged more for poorer service, hindering uniform accessibility."

## Concepts Introduced or Referenced
- [[tokenization]] — BPE, SentencePiece Unigram, WordPiece; byte vs character; script-based fragmentation, 5× cost multiplier, context-window penalty; links to [[source-neural-machine-translation-subword-units]] (origin) and [[source-unsupervised-cross-lingual-representation-learning]] (XLM-R 250K still imperfect).
- [[multilinguality]] — Fairness across languages/scripts, cost vs performance correlation, cross-lingual transfer inequity; complements XLM-R's curse of multilinguality.
- [[evaluation]] — Multilingual benchmarks XLSUM, XStoryCloze, XCOPA, XFACT; ICL few-shot methodology; socioeconomic correlation.
- [[inference]] — API pricing models, effective context length (4096), token-based billing vs character/byte billing.
- [[llm-bias]] — Economic bias, digital divide, affordability.

## Critical Assessment
- **Strengths:** First to frame tokenization as fairness/pricing issue in commercial era; systematic across 22 languages, 5 tasks, multiple tokenizers with parallel data controls; combines cost, utility, and socioeconomic lenses; clear visualizations (fragmentation, cost, socio factors); actionable recommendations for vendors and community.
- **Limitations:** Analyses tied to 2023 API versions/pricing (may have changed but disparity structural); task coverage 5 benchmarks may not generalize to all use cases; model evaluations focus ChatGPT/BLOOMZ — newer long-context models partially mitigate but not eliminate fragmentation; does not propose a single optimal tokenizer, acknowledges trade-offs (larger vocab helps but memory/softmax cost). Complements XLM-R paper: even 250K vocab not sufficient for parity.
- **Relation to other sources:** Builds directly on Sennrich et al. 2016 BPE and Kudo 2018 SentencePiece; Ahia et al. show Sennrich's method — while solving OOV — introduced new inequity at global scale when vocab size/cost fixed. XLM-R attempted to address via SentencePiece on raw text + large 250K vocab but still exhibits variance (Ahia includes XLM-R tokenizer for comparison).

---

**Source:** Do All Languages Cost the Same? Tokenization in the Era of Commercial Language Models by Orevaoghene Ahia, Sachin Kumar, Hila Gonen, Jungo Kasai, David R. Mortensen, Noah A. Smith, Yulia Tsvetkov — <https://aclanthology.org/2023.emnlp-main.614/>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
