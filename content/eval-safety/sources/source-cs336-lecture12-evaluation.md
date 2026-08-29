---
type: source-summary
title: "CS336 Lecture 12 — Evaluation: What Makes a Model 'Good'? (Percy Liang, Wed May 6)"
summary: The Spring 2026 CS336 Lecture 12 (Percy Liang, May 6, lecture12.py trace) closes the training arc — "we've covered everything for training an LM; what data do you train on?
status: draft
visibility: public
author: "Percy Liang (Stanford CS336)"
source-type: article
url: "https://cs336.stanford.edu/lectures/?trace=lecture_12"
date-published: 2026-05-06
date-ingested: 2026-08-26
tags:
  - eval-safety
  - llm-fundamentals
key-concepts:
  - "[[evaluation]]"
  - "[[rag-evaluation]]"
  - "[[trustworthiness-in-llms]]"
  - "[[alignment]]"
  - "[[inference]]"
key-entities:
  - "[[stanford-university]]"
  - "[[openai]]"
  - "[[anthropic]]"
aliases:
  - wiki/source-cs336-lecture12-evaluation
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">The Spring 2026 CS336 Lecture 12 (Percy Liang, May 6, lecture12.py trace) closes the training arc — "we've covered everything for training an LM; what data do you train on?</p>
<p class="kb-provenance">Percy Liang (Stanford CS336), 2026-05-06. <a href="https://cs336.stanford.edu/lectures/?trace=lecture_12">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 4 of 17 figures on this page were not found in [https://cs336.stanford.edu/lectures/?trace=lecture_12](https://cs336.stanford.edu/lectures/?trace=lecture_12): `2.5`, `2.3`, `15.9`, `43.9%`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

The **Spring 2026 CS336 Lecture 12 (Percy Liang, May 6, `lecture_12.py` trace)** closes the training arc — *"we've covered everything for training an LM; what data do you train on? Before that, what behavior do we want?"* — with a full **evaluation taxonomy** that treats "good" as `abstract construct → concrete metric` and shows why no single benchmark suffices. The edtrace walks seven blocks: **perplexity** (Penn Treebank → WikiText-103 → 1BW, GPT-2 zero-shot OOD), **exam benchmarks** (MMLU → MMLU-Pro → GPQA → Humanity's Last Exam HLE, 2.5k questions, $500K prize), **chat benchmarks** (Chatbot Arena ELO + AlpacaEval 805 + WildBench 1k, with judge biases), **agentic benchmarks** (SWE-Bench 2.3k, TerminalBench 229, CyBench 40 CTF, MLE-Bench 75 Kaggle + deep-agent scaffolds), **pure reasoning** (ARC-AGI 1/2/3), **safety** (HarmBench 510, AIR-Bench 314/5694, GCG jailbreaks), plus cross-cutting **realism** (GDPVal 44 occupations, MedHELM 121 tasks/29 clinicians, Clio) and **validity** (contamination, dataset quality, Docent). The through-line is *methods vs models vs agents* — choose the game and state its rules.

## Key Takeaways
1. **Core challenge is construct→metric mapping**: `abstract good → concrete accuracy` is non-trivial and shapes AI development. Four evaluation consumers want different answers: (a) buyer choosing model A vs B for customer-service, (b) researcher probing raw capability/intelligence, (c) policymaker assessing business/harm tradeoffs, (d) developer iterating on feedback. Each needs different realism/difficulty/validity knobs.
2. **Perplexity is smooth but insufficient**: LM `p(x)` evaluated as `(1/p(D))^{1/|D|}` still underpins scaling laws; classic progression Penn Treebank (WSJ) → WikiText-103 → 1BW shows CNN+LSTM 51.3→30.0. GPT-2 zero-shot OOD on WebText (40GB) transfers better to small PTB than 1BW. Perplexity assumes *all tokens matter equally* (`Stanford was founded in 1885` — `founded` may be irrelevant) → conditional `p(response|prompt)` is relevance-weighted alternative. Cloze (LAMBADA, HellaSwag) are perplexity-in-disguise; leaderboards requiring `log_prob = LM(test)` must trust valid distributions (sum to 1) unlike downstream `response→accuracy`.
3. **Exam benchmarks escalate with saturation**: **MMLU** (57 subjects, 15.9k MCQs, "knowledge not language understanding", 5-shot `"...about [subject]"` scoring A/B/C/D): GPT-3 43.9% → **MMLU-Pro** (cleaned, 4→10 choices, CoT eval) drops accuracy 16–33% to de-saturate → **GPQA** (61 Upwork PhDs, 65% expert vs 34% non-expert+Google vs 39% GPT-4) google-proofs difficulty → **HLE** (2.5k multimodal MCQ+short-answer, $500K, frontier-filtered multi-review) pushes hardness further. Trend: MCQs can be arbitrarily hard but drift from real open-ended usage.
4. **Chat = open-ended evaluation with judge problems**: Example `beet+goat-cheese herbs` shows no single correct answer. **Chatbot Arena** (LMSYS): random Internet user → two anonymized models → pairwise vote → Bradley-Terry ELO `p(A beats B)=1/(1+10^{(ELO_B-ELO_A)/400)`; strengths: real prompts, dynamic model/prompt set, same-prompt-not-required; weaknesses: population bias/spam, style vs correctness conflation, correctness unverifiable, sycophancy. **AlpacaEval** (2023, 805 instructions, win-rate vs GPT-4 Preview): cheap minutes-scale loop, high Arena correlation, but length-gaming → **LC win rate** via regression de-bias (AlpacaEval 2.0) and evaluator-circularity risk. **WildBench** (1,024 / 1M conversations, GPT-4 judge + checklist CoT) correlates well — rubric/checklist improves reliability for human *or* LLM judge.
5. **Agentic benchmarks: evaluate system = LM + scaffold**: **SWE-Bench** 2,294 tasks/12 Python repos (issue→PR, unit-test grading) → **TerminalBench** 229 crowdsourced terminal tasks (universal, 89 in TB2.0, human-time vs results plots) → **CyBench** 40 CTF (first-solve-time difficulty, agent diagram) → **MLE-Bench** 75 Kaggle comps (model training + data wrangling). Scaffolds matter as much as LM: explicit todo planning, hierarchical sub-agent delegation (clean context), persistent file memory, extreme context-engineering — Phil Schmid's deep-agent diagram referenced. Evaluating agents = evaluating scaffold+LM jointly.
6. **Pure reasoning isolated via ARC-AGI**: Goal: disentangle reasoning from knowledge (memorization helpless). **ARC-AGI-1 (2019)** 100% human-solvable, pretrained LMs flat → **ARC-AGI-2 (Mar 2025)** multi-step, o1/o3 "take off" → **ARC-AGI-3 (Mar 2026)** interactive environments; results plots show reasoning-model inflection. Constrains to *human* reasoning — superhuman not yet tested.
7. **Safety is contextual, not monolithic**: **HarmBench** 510 behaviors violating laws/norms, **AIR-Bench** 314 risks/5,694 prompts taxonomy-aligned to regulations/company policies (figure overview), **HELM Safety** integration noted. **GCG** greedy coordinate gradient jailbreaks auto-optimize prompts that transfer Llama→GPT-4 (example figures). Dual-use (Mythos cyber-agent → hack vs pen-test) frames risk.
8. **Realism vs privacy, validity vs scale — the field's current frontiers**: **Realism**: GDPVal (OpenAI, 44 occupations / 9 GDP sectors, 14-year pros) and MedHELM (121 clinical tasks, 29 clinicians, private+public mix) — prior medical exams were too synthetic; Clio (Anthropic) uses LM to mine real user patterns privately. **Validity**: (a) *train-test overlap* — pre-foundation fixed splits vs Internet training opacity; detection via exchangeability (Carlini), reporting norms, fresh scrapes (LiveCodeBench), private evals (personal code/writings); (b) *quality* — SWE-Bench → SWE-Bench Verified, Platinum benchmarks, insufficient tests/trivial-agent artifacts (arXiv 2507.02825), **Docent** LLM agent-trace inspection. **Methods vs models**: pre-foundation evaluated *methods* (fixed splits); today evaluate *models/systems* (anything goes); exception Karpathy nanogpt speedrun (fixed data/compute→val loss) — innovation vs deployment utility distinction; either way, *define the rules*.

## Detailed Notes

### Framing (what_is_good)
- Mechanical illusion `prompts→responses→accuracy` → deep shaping of development; four leaderboards compared: **Artificial Analysis** (accuracy only), **+cost** (Pareto), **Arena ELO** (human preference), **OpenRouter rankings** (actual paid use) — each answers different "good."

### Perplexity Block
- Definition + train/test split orthodoxy → GPT-2 OOD evaluation; perplexity figure panel; three claims: *all you need* (if `p=t` then solve `p(solution|problem)` → AGI by pushing perplexity), *more than you need* (irrelevant token penalty, conditional perp fix), *in disguise* (LAMBADA/HellaSwag). Warning box contrasts `log_prob` leaderboards (needs valid distribution) vs `response` accuracy.

### Exam Block (exam_benchmarks)
- MMLU stats + image + llm-stats/HELM links; MMLU-Pro changes (1 page figure) + HELM caps link; GPQA authoring pipeline (Upwork PhDs, Google-proof) + image/results; HLE prize pipeline (2500, multimodal, $500K, frontier-filtered stages) + 3 figures + results. Summary slide lists three bullets (harder → saturation, MCQs can be arbitrarily hard, misses open-ended).

### Chat Block (chat_benchmarks)
- Beet-salad example setup + "how to evaluate open-ended?" → Arena data collection diagram (arena-beets), ELO math, leaderboard image; 6 properties (pros/cons) + "don't need same prompts" + "dynamic." AlpacaEval: 805, vs baseline, gaming → regression fix, correlation images; WildBench: 1,024/1M, checklist judge, HELM WildBench.

### Agentic Block (agentic_benchmarks)
- Definition `Agent = LM + scaffold` (tool use, iteration over time) → per-benchmark figures: SWE-Bench, TerminalBench (+human-time, results), CyBench (+agent diagram, results), MLE-Bench (two figures). Scaffold figure from Phil Schmid (todo, hierarchical, memory, extreme context engineering). Summary 3 bullets.

### Reasoning Block (pure_reasoning_benchmarks)
- ARC-AGI website link, 100% human-solvable claim, three generations with images + results; comment "pretrained LMs didn't move needle, reasoning models (o1/o3) take off"; ARC-AGI-3 interactive + results.

### Safety Block (safety_benchmarks)
- Crash-test image, HarmBench 510 + HELM link, AIR-Bench 314/5694 + overview png + HELM link, jailbreaking GCG with transfer examples (Llama→GPT-4), "What is safety?" contextual variation + dual-use Mythos framing.

### Realism (realism)
- Ecological validity definition; exam far from real vs Arena uncontrolled; GDPVal figure + 44 occupations; MedHELM overview + 121/29 stats + HELM link; Clio table.

### Validity (validity)
- Four routes to handle overlap, dataset-quality fixes with x.com/arxiv figures, Docent link.

### Meta-frame (how_to_think_about_evaluation)
- Four evaluation questions (purchase, raw capability, societal assessment, dev feedback); historical shift methods→models/systems (ImageNet/SQuAD cf Internet training); nanogpt speedrun figure + post; takeaway slide: "no one true evaluation; state rules; consider difficulty/realism/validity."

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 2 of 3 passages in this section could not be located in the stored source ([https://cs336.stanford.edu/lectures/?trace=lecture_12](https://cs336.stanford.edu/lectures/?trace=lecture_12)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "There is no one true evaluation; choose the evaluation depending on what you're trying to measure. Clearly state the rules of the game (methods versus models versus agents)." — Takeaways

> "Evaluation might appear mechanical — define prompts → get responses → compute accuracy — but actually, evaluation is a deep topic which shapes the development of AI." — what_is_good

> "Perplexity is all you need (more faith than science) — if p=t then solve all tasks via p(solution|problem) — so by pushing down perplexity we will eventually reach AGI." — perplexity provocation

## Concepts Introduced or Referenced
- [[evaluation]] — Master taxonomy: perplexity→exams→chat→agentic→reasoning→safety→realism→validity; methods vs models distinction.
- [[trustworthiness-in-llms]] — Shares dimensions: knowledge (MMLU/HLE), truthfulness-adjacent, safety (HarmBench/AIR-Bench), fairness/robustness parallels.
- [[rag-evaluation]] / [[rag-faithfulness]] — Per-conditional perplexity and retrieval grounding echo faithfulness concerns; SWE-Bench verified ties to RAG verification.
- [[alignment]] — Arena preference = RLHF signal; GCG jailbreaks directly test harmlessness; GDPVal/MedHELM ground helpfulness in real professions.
- [[inference]] — Through Arena latency realism and RL sampling evaluation costs.
- [[reasoning-llms]] / [[thinking-models]] — ARC-AGI as pure reasoning probe; inference-time reasoning traces amplify agentic benchmark gains.

## Critical Assessment
- **Strengths**: Only CS336 source that unifies *all* evaluation families in one code-grounded trace — from 51.3→30.0 perplexity history through $500K HLE to 75-Kaggle MLE-Bench — with explicit consumer/use-case framing (buyer vs researcher vs policymaker vs developer) rarely separated elsewhere. Contamination/validity section is most actionable in the CB: four concrete routes plus SWE-Bench Verified and Docent inspection. Difficulty/realism/validity triad at close is clean rubric for choosing any benchmark.
- **Weaknesses**: edtrace `lecture_12.py` renders figures via `image(...)` URLs — raw `.py` omits visual data (MMLU-Pro drop, GPQA radar, HLE pipeline, Arena ELO curve, GCG examples, GDPVal occupation grid) that must be seen in trace viewer or slides; lecture is *breadth* over *depth* — no case study dissects a single metric's failure mode end-to-end (unlike Lecture 10's arithmetic-intensity derivation or Lecture 11's µP proof). Fresh-eval timestamp warning is brief despite being a major reproducibility trap.
- **Relation to wiki**: Upgrades [[evaluation]] from MMLU/HELM+process/LLM-as-judge framing to **seven-benchmark + realism/validity** taxonomy; complements [[source-helm]] (holistic 42-scenario) and [[source-mmlu]] / AlpacaEval: An Automatic Evaluator for Instruction-following Language Models (single-benchmark deep dives) by placing them on one spectrum; contamination discussion extends [[source-challenges-nlp-benchmarking]] (Ruder) saturation/Goodhart lens; agentic taxonomy directly feeds [[ai-agents]] / [[deep-agents]] scaffolding discussion.

---

**Source:** CS336 Lecture 12 — Evaluation: What Makes a Model 'Good'? (Percy Liang, Wed May 6) by Percy Liang (Stanford CS336) — <https://cs336.stanford.edu/lectures/?trace=lecture_12>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
