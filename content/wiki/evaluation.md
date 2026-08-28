---
type: concept
title: "Evaluation"
summary: Evaluation (benchmarking) is the systematic measurement of language model capabilities, limitations, and risks beyond single-metric accuracy.
visibility: public
aliases:
  - "Benchmarking"
  - "LLM Evaluation"
  - "Holistic Evaluation"
tags:
  - eval-safety
  - llm-fundamentals
created: 2026-08-25
updated: 2026-08-26
status: draft
sources:
  - "[[source-mmlu]]"
  - "[[source-helm]]"
  - "[[source-challenges-nlp-benchmarking]]"
  - "AlpacaEval: An Automatic Evaluator for Instruction-following Language Models"
  - "[[source-lets-verify-step-by-step]]"
  - "[[source-scaling-test-time-compute]]"
  - "[[source-cs336-lecture12-evaluation]]"
  - "[[source-cs336-lecture10-inference]]"
related:
  - "[[trustworthiness-in-llms]]"
  - "[[rag-evaluation]]"
  - "[[rag-faithfulness]]"
  - "[[reasoning-llms]]"
  - "[[thinking-models]]"
  - "[[alignment]]"
  - "[[inference]]"
  - "[[scaling-laws]]"
  - "[[ai-agents]]"
  - "[[pretraining]]"
---

# Evaluation

## Overview
**Evaluation** (benchmarking) is the systematic measurement of language model capabilities, limitations, and risks beyond single-metric accuracy. The transition from narrow benchmarks (GLUE, SuperGLUE, HellaSwag) to **holistic, multitask, and process-level evaluation** — exemplified by **MMLU** (Hendrycks et al. 2021, 57 subjects) in [[source-mmlu]] and **HELM** (Liang et al. 2022, 42 scenarios × 7 metrics) in [[source-helm]] — reflects the need to assess breadth of knowledge, calibration, robustness, fairness, and efficiency as models scale. [[source-challenges-nlp-benchmarking]] supplies the theoretical grounding: benchmarks are "telescopes" that saturate fast and Goodhart themselves, so metric design, downstream alignment, fine-grained breakdowns, long-tail coverage, and living versioned collections are mandatory. Recent extensions cover **process supervision** ([[source-lets-verify-step-by-step]]), **test-time compute-optimal scaling** ([[source-scaling-test-time-compute]]), and **LLM-as-judge win-rate evaluation** (AlpacaEval: An Automatic Evaluator for Instruction-following Language Models) — redefining evaluation from answer correctness to stepwise reasoning quality, compute-aware benchmarking, and cheap automatic preference measurement. **CS336 Lecture 12** [[source-cs336-lecture12-evaluation]] provides the systems-level taxonomy that unifies these threads: `abstract construct → concrete metric` across **perplexity → exams → chat → agentic → reasoning → safety**, plus cross-cutting **realism** and **validity**.

## Key Ideas
- **From linguistic to knowledge-intensive**: GLUE (Wang 2018) and SuperGLUE saturated within a year because they tested narrow linguistic commonsense. **MMLU** shifted to 15,908 expert-level multiple-choice questions across STEM/humanities/social sciences/professional domains, evaluating knowledge *extracted during pretraining* via zero/few-shot prompting. GPT-3 175B reached only 43.9% (random 25%, expert 89.8%), with **lopsidedness** (69% US Foreign Policy vs 26% College Chemistry) and **miscalibration** (gap up to 24%) — establishing enduring headroom.
- **Holistic desiderata (HELM)**: **Accuracy alone is insufficient**. HELM evaluates every scenario on 7 families: accuracy (Exact Match, F1, RR@10/NDCG@10, ROUGE-2), calibration (ECE), robustness (perturbations: lowercase, misspellings, extra spaces), fairness (counterfactual demographic swaps, performance disparities), bias (demographic representation, stereotypical associations), toxicity (Perspective API), efficiency (FLOPs/latency). Low inter-metric correlation (accuracy vs calibration r≈0.2) proves metrics non-redundant; **no model Pareto-dominates**.
- **Standardization vs ad hoc prompting**: MMLU fixed prompt format (`"The following are multiple choice questions (with answers) about [subject]." + exemplars + "Answer:"` scoring A/B/C/D probabilities); HELM standardized 5 in-context exemplars per scenario. Without standardization, **prompt formulation dominates rankings** — HELM shows multiple-choice *separate vs joint* and generation vs probability scoring dramatically changes leaderboards. Standardization enables apples-to-apples while explicitly reporting brittleness.
- **Process vs outcome evaluation**: [[source-lets-verify-step-by-step]] demonstrates that **outcome-only evaluation (final answer correct) hides reasoning errors** — solutions can reach correct answer via wrong steps (false positives). **Process supervision (PRM)** evaluating each step's correctness localizes first error, provides richer signal, and yields **78.2% vs 72.4% ORM vs 69.6% majority** on MATH via best-of-N. Neutral labels handle ambiguous steps. This shifts evaluation granularity from answer to **chain-of-thought trace**.
- **Test-time compute-aware evaluation**: [[source-scaling-test-time-compute]] introduces **compute-optimal benchmarking** — evaluation must account for inference budget and **difficulty-adaptive strategy**. Best-of-N, beam search, lookahead (MCTS-like), and sequential revisions exhibit **difficulty-dependent optimality**: beam search wins at low budget and medium difficulty (L3–L4) but **overoptimizes** (degrades) on easy questions at high budget due to PRM exploitation (repetitive suffixes, collapsed 1–2 step solutions); easy questions favor sequential revisions. Adaptive allocation per difficulty bin yields **>4× efficiency** over fixed best-of-N, and in FLOPs-matched comparisons small model + optimal test-time compute can **outperform 14× larger model** when inference/pretraining token ratio Y<<X.
- **Benchmarking theory: saturation, artefacts, Goodhart (Ruder 2021)**: A benchmark = datasets + metrics + aggregation; "datasets are the telescopes of our field" (Joshi). GLUE/SuperGLUE/SQuAD 2.0 hit superhuman within ~1 year (vs 15+ for MNIST/Switchboard) while annotation artefacts surfaced quickly (SNLI hypothesis-only heuristics, SQuAD adversarial sentences) — saturation ≠ solved. Metrics matter: 82% of 2019–20 MT papers still report BLEU only despite 108 alternatives (Marie et al.); decade-scale directional metrics (WER, BLEU) mislead in the near-term application regime — match metric to error costs, task, language. Design for downstream use case (ID + OOD + non-English), evaluate fine-grained (ExplainaBoard per-bucket breakdowns, CheckList behavioral tests), aggregate wisely (geometric mean for exponential quantities; DynaBench user-weighted accuracy/throughput/memory/fairness/robustness), respect the long tail (larger ≠ uniformly better per example; significance testing; multiple annotations; inter-annotator agreement as ceiling), and maintain a **large, versioned, community-curated living collection** (GEM/Dynabench template) — "when a measure becomes a target, it ceases to be a good measure" (Goodhart).
- **LLM-as-judge win rates (AlpacaEval)**: AlpacaEval: An Automatic Evaluator for Instruction-following Language Models operationalizes cheap automatic preference evaluation: 805 AlpacaFarm instructions → model responses → GPT-4 pairwise auto-annotator vs baseline (Davinci003 → GPT-4 Preview 11/06 in v2.0) → **win rate** and **length-controlled (LC) win rate** (logistic regression regressing out length to counter GPT-4's verbosity bias). High correlation with human leaderboards at minutes-scale cost makes it the standard fast iteration loop for [[instruction-tuning]]/[[rlhf]]/[[direct-preference-optimization]] sweeps. Documented failure modes are themselves instructive: verbosity gaming (why LC exists), **evaluator circularity** (LC may favor models distilled from the annotator's own outputs), simple single-turn distribution, no safety/toxicity/hallucination coverage — a live demonstration of Ruder's Goodhart warning inside a modern leaderboard.
- **CS336 evaluation taxonomy and frontier (Lecture 12)** [[source-cs336-lecture12-evaluation]]: A single trace organizes seven families: (1) **Perplexity** `(1/p(D))^{1/|D|}` and conditional `p(response|prompt)` (Penn Treebank→WikiText-103→1BW, GPT-2 zero-shot OOD, LAMBADA/HellaSwag as cloze perplexity); (2) **Exams** MMLU (57×MCQ, 43.9% GPT-3) → MMLU-Pro (4→10 choices, -16–33%) → GPQA (61 PhDs, 65% expert/34% no-expert+Google/39% GPT-4) → **HLE** (2.5k multimodal, $500K, frontier-filtered); (3) **Chat** Chatbot Arena pairwise ELO `p=1/(1+10^{Δ/400})` vs AlpacaEval 805 win rate vs WildBench 1k checklist judge — with explicit style/correctness conflation and sycophancy risks; (4) **Agentic** SWE-Bench (2.3k/12 repos PR+tests) → TerminalBench 229 → CyBench 40 CTF (first-solve time) → MLE-Bench 75 Kaggle, scaffold=`LM+todo+hierarchical+memory` (Phil Schmid deep-agent pattern); (5) **Pure reasoning** ARC-AGI 1/2/3 (human 100% → o1/o3 inflection → interactive); (6) **Safety** HarmBench 510 + AIR-Bench 314/5694 + GCG transfer jailbreaks + dual-use framing; (7) **Realism/validity** GDPVal 44 occupations/9 GDP sectors, MedHELM 121/29, Clio private pattern-mining, plus contamination routes (exchangeability, fresh scrapes, private evals) and quality fixes (SWE-Bench Verified, Platinum, Docent trace inspection). Framing maxim: *no one true evaluation — state the game (methods vs models vs agents) and its rules; difficulty × realism × validity*.

## How It Works

### MMLU Pipeline
```
57 subjects × curated MCQ (≥100/test each)
  → dev 5 per subject for few-shot prompt
  → prompt: "The following are ... about [subject].\nQuestion: ...\nA) ...\nAnswer:"
  → model probabilities over A/B/C/D → accuracy per subject
  → aggregate: average weighted, discipline breakdown, calibration (confidence vs accuracy per subject)
```

### HELM Taxonomy
```
Scenarios (42) = Tasks (QA 9 incl. MMLU, IR 2, Summ 2, SA 1, ToxDet 1, Misc RAFT 11) × Domains × Languages
  + Adaptation: fixed 5-shot prompting (generation or probability)
  + Metrics (7 families) → per-scenario table + meta-analysis
Targeted evaluations: Language (BLiMP, The Pile BPB), Knowledge (WikiFact), Reasoning (synthetic symbolic, bAbI), Memorization (verbatim extraction), Disinformation (TruthfulQA), Bias (BBQ), Toxicity (RealToxicityPrompts)
```

### Process Evaluation (PRM)
```
Generator samples N solutions (newline-delimited steps)
  → PRM scores each step (single forward pass, product of step correctness probs)
  → aggregation: product (Lightman) or last-step (Snell) → solution score
  → best-of-N (weighted: marginalize same final answers) vs beam search (keep top N/M per step, expand M continuations)
```

### Compute-Optimal Strategy (Snell)
```
For each MATH problem, estimate difficulty: pass@1 via 2048 samples → 5 quantile bins (oracle)
  → model-predicted difficulty via averaged PRM scores (deployment proxy, 2-fold CV)
  → sweep strategies (parallel N vs sequential revisions vs beam M/k)
  → select θ* per (difficulty bin, budget N) maximizing accuracy
  → at test time, estimate bin → allocate budget accordingly
```

### AlpacaEval LLM-as-Judge Loop
```
805 eval instructions (AlpacaFarm set)
  → model generates responses (config: model + template)
  → GPT-4 annotator compares pairwise vs reference baseline (v2.0: GPT-4 Preview 11/06)
  → win rate = % preferred over baseline
  → LC win rate = logistic regression preference ~ model + length_diff,
    evaluated at equal length (counterfactual de-biasing)
  → leaderboard: community + verified splits; PR-based submission
```

### CS336 Evaluation Suite (Lecture 12) — Seven Benchmark Families + Validity
```
Perplexity: p(D)^(1/|D|) → conditional p(response|prompt) → cloze (LAMBADA/HellaSwag)
Exams: MMLU 57×MCQ → MMLU-Pro 10-way → GPQA google-proof → HLE 2.5k multimodal ($500K prize)
Chat: Arena ELO 1/(1+10^{Δ/400}) (real prompts, style-conflated) ↔ AlpacaEval 805 win/LC ↔ WildBench 1k checklist
Agentic: SWE-Bench 2.3k PR → TerminalBench 229 → CyBench 40 CTF → MLE-Bench 75 Kaggle
         (Agent = LM + scaffold: todo, hierarchical sub-agents, persistent memory, extreme context eng.)
Reasoning: ARC-AGI-1 (human 100%) → 2 (o1/o3 jump) → 3 (interactive)
Safety: HarmBench 510 → AIR-Bench 314/5694 (regulation taxonomy) → GCG jailbreak → dual-use
Realism: GDPVal 44 occ/9 sectors (14yr pros) → MedHELM 121/29 → Clio (private mining)
Validity: overlap (exchangeability/LiveCodeBench/Private) + quality (Platinum/Docent)
```

> CS336 framing (Lecture 12): *Evaluation consumer matters* — buyer (A vs B for customer-service), researcher (raw capability), policymaker (harm/benefit), developer (iteration signal) each need different difficulty/realism/validity. History: pre-foundation evaluated *methods* (fixed splits); today evaluate *models/systems* (anything goes) except speedruns (Karpathy nanogpt fixed data+compute→val loss). Either way, "define the rules of the game."

## Practical Implications
- **Model selection requires trade-off analysis**: HELM shows instruction-tuned models (InstructGPT) gain accuracy but lose calibration and fairness vs base models; Cohere gains ROUGE but increases toxicity under adversarial prompts. Use HELM's multi-metric profile, not single leaderboard, for application-specific selection — e.g., healthcare needs calibration + fairness > raw MMLU.
- **Mitigating measurement gaming**: Standardized prompting reduces prompt hacking, but contamination remains (MMLU questions likely in pretraining; Lightman includes 4.5K MATH test in training → must evaluate on held-out 500). Always audit accuracy vs log-prob correlation and run OOD fresh exams (Lightman 234 recent STEM problems; Snell OOD validation) before deployment claims.
- **From retrieval to verification**: For [[rag-evaluation]] and [[trustworthiness-in-llms]], HELM's IR scenarios (MS MARCO) and memorization/copyright metrics directly apply; process evaluation suggests evaluating *faithfulness per reasoning step* (akin to RAG faithfulness per chunk) catches hallucinations earlier than final-answer F1.
- **Cost-aware deployment**: HELM efficiency + Snell FLOPs analysis (pretraining 6ND vs inference 2NY) guides **smaller model + test-time compute vs larger model** decisions. If expecting many inference tokens (Y/X large), pretraining larger model amortizes better, especially for hard tasks where small model pass@1 ≈ 0. For sparse inference, invest in verifier-guided search/revisions on smaller model for 4× savings.
- **Active learning for evaluation data**: Lightman's convincing wrong-answer surfacing (2.6× data efficiency via PRM-ranked selection) applies beyond math — for any verifier, label budget should prioritize high-scoring failures, not uniform sampling.
- **Ruder's checklist as engineering gate**: before trusting any benchmark number — (1) is the metric suited to the task/language/error costs? (2) does the distribution match the real use case (ID + OOD + languages)? (3) is there a fine-grained breakdown (per-bucket, behavioral tests)? (4) significance testing + inter-annotator ceiling reported? (5) is the benchmark versioned/living or already Goodharted? CS336 adds: also state *methods vs models vs agents* rules and report efficiency (latency/cost) alongside accuracy — Artificial Analysis +cost and OpenRouter paid-use track the buyer's objective, not just Arena ELO.
- **Two-speed evaluation workflow**: AlpacaEval (minutes, ~$5) for inner-loop iteration on instruction tuning; HELM/MMLU/TrustLLM multi-metric suites as outer-loop release gates. Never let LC win rate alone justify deployment claims — its known biases (length, distillation circularity, simple prompts) require the holistic complement.
- **CS336 agentic & realism implications**: Test the *scaffold+LM* system, not LM alone — Todo/hierarchical/memory variants can dominate model choice (SWE-Bench vs TerminalBench vs CyBench rankings diverge). For ecological validity, prefer **GDPVal/MedHELM** over exams when deploying to professions (healthcare, legal, enterprise); expect Realism↔Privacy tension — Clio-style private mining may be needed for real distribution without leakage.
- **Validity as lifecycle**: Run overlap checks before every release (exchangeability, confidence-interval reporting, LiveCodeBench fresh scrape, plus private held-out), and budget for re-annotation (Platinum/Verified) — insufficient tests / trivial-agent exploits (2507.02825) are common at current benchmark scale. Use **Docent** (LLM trace inspection) to catch agentic cheating.

## Connections
- [[source-challenges-nlp-benchmarking]] provides the pre-LLM theory that HELM later implements: multi-metric desiderata, standardization, living versioned collections, downstream-use-case alignment; its Goodhart/saturation framing explains MMLU's 2025 saturation and motivates dynamic evaluation. **CS336 Lecture 12** extends this with *methods vs models* history and four contamination routes, closing the loop from Ruder→HELM→modern fresh/private evals.
- Generalizes [[rag-evaluation]] (retriever vs generator faithfulness) and [[rag-faithfulness]] (per-chunk adherence) into broader evaluation; HELM's robustness and counterfactual fairness overlap with [[llm-bias]] and [[adversarial-prompting]]; Ruder's EfficientQA example ties retrieval efficiency directly to benchmark design. CS336's conditional perplexity `p(response|prompt)` frames retrieval-augmented relevance as evaluation choice.
- Grounds [[trustworthiness-in-llms]] 6 dimensions: MMLU truthfulness/knowledge, HELM safety/fairness/robustness/privacy, process supervision's alignment via interpretable reasoning; AlpacaEval explicitly excludes safety — TrustLLM fills that slice. CS336's **HarmBench/AIR-Bench/GCG** provide the safety coverage AlpacaEval omits.
- Feeds [[alignment]] diagnostics: MMLU Professional Law/Moral Scenarios failures and HELM toxicity/bias gaps directly measure Helpful/Honest/Harmless gaps; Lightman's **negative alignment tax** (safer PRM also more capable) challenges assumption that safety costs capability. CS336's Arena preference signal is the RLHF reward source, with noted sycophancy/style biases.
- Scales with [[scaling-laws]] (Kaplan/Chinchilla N/D/C) and [[inference]] (decoding strategies, KV cache); Snell explicitly trades pretraining FLOPs for test-time generations, complementing Chinchilla's optimal N∝C^0.5; Ruder notes living collections structurally favor large general models amortized via fine-tuning/distillation. CS336's **GDPVal/Artificial Analysis +cost / OpenRouter** adds the deployment-economics layer to that tradeoff.
- Enables [[thinking-models]] and [[reasoning-llms]] benchmarking: PRM provides dense reward for RL (RLVR) and inference scaling (best-of-N, beam, revisions); compute-optimal routing is prerequisite for production hybrid thinking (low→medium→high). CS336's **ARC-AGI** isolates reasoning from knowledge, exposing where thinking models still gap.
- AlpacaEval: An Automatic Evaluator for Instruction-following Language Models inherits its eval set from [[source-alpacafarm]] (simulated RLHF at ~1% human cost) and exemplifies the LLM-as-judge paradigm later used by MT-Bench/Arena; its LC-win-rate fix is a case study in metric iteration as Ruder prescribes. CS336 contrasts it with **WildBench checklist** and **Clio private mining** as next-iteration realism fixes.
- Directly references [[ai-agents]] / [[pretraining]]: SWE-Bench, TerminalBench, CyBench, MLE-Bench are *agentic* evaluations (agent = LM + scaffold); data quality (Docent/Platinum/GDPVal sourcing) determines [[pretraining]] distribution validity.

## Open Questions
- Can evaluation remain uncontaminated as benchmarks saturate (MMLU >90% by 2025 frontier models) without dynamic generation? Need **living benchmarks** (HELM ethos) with fresh exams and synthetic tasks — how to maintain backward comparability? CS336's four routes (exchangeability, reporting norms, LiveCodeBench freshness, private evals) are partial — timestamp-copying and Internet-memory still leak.
- How to define "correct step" for non-verifiable domains (creative writing, nuanced legal advice) where process supervision ill-defined — can PRM paradigm extend beyond math/code with low false-positive rate?
- Difficulty estimation cost: Snell's predicted bins need 2,048 samples + verifier scoring — does net 4× gain survive after subtracting estimation overhead in online deployment? Need amortized or classifier-based routing without sampling.
- Overoptimization: Snell shows verifier exploitation at high budgets; HELM shows prompt sensitivity — how to regularize verifiers (ensembles, step-length penalties) to maintain monotonic scaling?
- What single intervention improves multiple HELM dimensions jointly without regression — does retrieval grounding (RAG) + constitutional tuning dominate?
- Can LLM-as-judge circularity be broken (judge ≠ any model family being ranked; ensembles of annotators; human calibration refresh) before win-rate leaderboards fully Goodhart, or is human-anchored periodic recalibration unavoidable? WildBench checklists and Clio private mining are CS336's partial answers.
- Can **agentic benchmark validity** keep pace with scaffold evolution? SWE-Bench Verified/Platinum fix today's insufficient tests and trivial-agent exploits — but deep-agent scaffolds (hierarchical delegation, 1M context) create new cheating surfaces that Docent-style LLM trace inspection must continuously audit.
- How to jointly optimize **realism × difficulty × validity** without Goodharting the realism metric itself? GDPVal's paid professional + OpenRouter usage + Arena ELO each optimize a different "good" — what aggregation (à la HELM's user-weighted DynaBench) preserves incentives?

## Sources
- [[source-mmlu]]
- [[source-helm]]
- [[source-challenges-nlp-benchmarking]] — Benchmarking theory: saturation, metric design, living collections.
- AlpacaEval: An Automatic Evaluator for Instruction-following Language Models — LLM-as-judge win rates, LC debiasing, fast iteration loop.
- [[source-lets-verify-step-by-step]]
- [[source-scaling-test-time-compute]]
- [[source-cs336-lecture12-evaluation]]
- [[source-cs336-lecture10-inference]]
- [[source-promptingguide-research-trustworthiness-in-llms]] (TrustLLM complement)

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
