---
type: concept
title: "Interpretability"
summary: Interpretability (explainability) is the capacity to understand, predict, and steer a model's behavior — from individual predictions to emergent capabilities — at a level useful for debugging, auditing, and human…
visibility: public
aliases:
  - Explainability
  - Agentic Interpretability
  - Mechanistic Interpretability
  - wiki/interpretability
tags:
  - eval-safety
  - llm-fundamentals
created: 2026-08-25
updated: 2026-08-25
status: draft
sources:
  - "[[source-agentic-interpretability]]"
  - "The Pareto Frontier of Human-Centered AI"
  - "[[source-we-cant-understand-ai-vocabulary]]"
  - "[[source-neologism-learning]]"
  - "[[source-bridging-human-ai-knowledge-gap-alphazero]]"
  - "[[source-helm]]"
  - "[[source-lets-verify-step-by-step]]"
related:
  - "[[evaluation]]"
  - "[[alignment]]"
  - "[[trustworthiness-in-llms]]"
  - "[[ai-ethics]]"
  - "[[multimodal-ai]]"
  - "[[reasoning-llms]]"
  - "[[llm-bias]]"
---

<aside class="kb-header kb-type-concept" aria-label="Page information">
<p class="kb-type">Concept</p>
<p class="kb-summary">Interpretability (explainability) is the capacity to understand, predict, and steer a model's behavior — from individual predictions to emergent capabilities — at a level useful for debugging, auditing, and human…</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/eval-safety/concepts/prompt-injection">Prompt Injection</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li><li><a href="/fine-tuning/concepts/alignment">AI Alignment</a></li><li><a href="/eval-safety/concepts/trustworthiness-in-llms">Trustworthiness in LLMs</a></li><li><a href="/eval-safety/concepts/ai-ethics">AI Ethics</a></li><li><a href="/multimodal/concepts/multimodal-ai">Multimodal AI</a></li><li><a href="/agents/concepts/reasoning-llms">Reasoning LLMs</a></li><li><a href="/eval-safety/concepts/llm-bias">LLM Bias</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/eval-safety/sources/source-agentic-interpretability">Because we have LLMs, we Can and Should Pursue Agentic Interpretability</a></li><li><a href="/eval-safety/sources/source-we-cant-understand-ai-vocabulary">We Can't Understand AI Using our Existing Vocabulary</a></li><li><a href="/eval-safety/sources/source-neologism-learning">Neologism Learning for Controllability and Self-Verbalization</a></li><li><a href="/eval-safety/sources/source-bridging-human-ai-knowledge-gap-alphazero">Bridging the human–AI knowledge gap through concept discovery and transfer in AlphaZero</a></li><li><a href="/eval-safety/sources/source-helm">Holistic Evaluation of Language Models (HELM)</a></li><li><a href="/eval-safety/sources/source-lets-verify-step-by-step">Let's Verify Step by Step</a></li></ul></nav>
</aside>

## Overview
**Interpretability** (explainability) is the capacity to understand, predict, and steer a model's behavior — from individual predictions to emergent capabilities — at a level useful for debugging, auditing, and human learning. Traditional **inspective interpretability** (probe classifiers, saliency, influence functions, circuits) treats the model as a black box to open, producing static artifacts (highlighted tokens, important training points, mechanisms). The June 2025 DeepMind position paper [[source-agentic-interpretability]] argues the LLM era enables a complementary paradigm: **agentic interpretability** — a multi-turn conversation where the LLM proactively assists understanding by modeling the user, which in turn lets the user model the LLM. While inspective methods aim for **completeness** (exhaustive circuit enumeration for safety), agentic methods optimize for **teachability** of potentially superhuman concepts, trading completeness for interactivity — a Pareto trade-off highlighted in Been Kim's companion essay *The Pareto Frontier of Human-Centered AI*.

## Key Ideas
- **Two paradigms, one frontier**: 
  - *Inspective*: static artifacts (LIME/SHAP highlights, TCAV concept vectors, probing, circuit finding [Olah 2020, Nanda 2023]); enables consensus documents but single-turn, stateless.
  - *Agentic* (Kim et al. 2025): **proactive + multi-turn + mutual mental model**. Definition: method pursues agentic interpretability iff it proactively assists human understanding in multi-turn interaction by developing mental model of user, enabling human to develop better model of LLM. Draws on Johnson-Laird (mental models), Norman (HCI), Theory of Mind, Grounding (Clark & Schaefer), RSA recursive reasoning, Vygotsky ZPD.
- **Why now**: LLMs' coherent conversation makes this feasible; opaque behaviors (single-token jailbreak, superhuman chess strategy) resist single artifact. Window of **cooperativeness** — current models largely non-deceptive — is opportunity before severe misalignment; history shows opacity deepens divides if not addressed early (Van Dijk 2005).
- **Mental models are central**: Implicit (context memory: "you're unfamiliar with string theory, goal casual conversation") vs explicit (knowledge graph of understood/confused). Necessity: stateless helper requires constant reminders; human's model of machine is distinct goal — to "keep up" as models outpace cognition, not just to fix end-task.
- **Opportunities**:
  1. **Model-trainer meta-model**: Train on project history (experiments, code, discussions) → converses, suggests hypotheses, debugs with awareness of developer's ZPD — evolves current automated eval/red-teaming/prompt-tuning from prescribed routines to dialogic partnership.
  2. **Teaching superhuman knowledge**: Via ZPD scaffolding + **neologism learning** ([[source-we-cant-understand-ai-vocabulary]]: add token `machine_good` ≠ human `good`; [[source-neologism-learning]] closes 92% of base→concept behavior gap on Gemma-3-4B-IT and shows models **self-verbalize** learned tokens, surfacing **machine-only synonyms** like "lack" for brevity) teach AlphaZero grandmasters ([[source-bridging-human-ai-knowledge-gap-alphazero]]): concept vectors excavated by convex optimization over AZ's latent space (policy-value net + MCTS dynamic concepts), filtered by **teachability** (student-AI improvement) + **novelty** (spectral rank of AZ vs human games — layers 19/23 show AZ encodes features humans don't); all four world-champion grandmasters improved (+0.85 puzzles, SE 0.12) via prototype puzzles.
  3. **Agentic mechanistic interpretability**: "Open-model surgery" — ablate/amplify circuits while conversing to explain changes, akin to awake brain surgery; forces deceptive model to maintain coherence under intervention, exposing inconsistencies.
- **Trade-offs**: *Inefficient for completeness* — circuit finding exhaustive is harder via conversation than direct intervention; *hard to hill-climb* — no functionally-grounded eval without human; human-induced variance (visual vs textual learners) + LLM semantic variance → vast trajectory space.
- **Evaluation is human-entangled-in-the-loop** (beyond human-in-the-loop): human responses are algorithm integral, breaking reproducibility and controlled comparison. Superhuman concepts may exceed single-user validation.
- **Pareto frontier framing** (The Pareto Frontier of Human-Centered AI, Kim Medium 2025): Human-centered AI is multi-objective — performance, personalization, fairness etc. are not jointly optimizable and the path is "paralyzed by complexity" (human-eval cost, value pluralism); agentic interpretability is a point on frontier prioritizing **learnability/teachability**, distinct from HELM's multi-metric Pareto (no model dominates accuracy/calibration/fairness/efficiency). Neologism learning is the concrete mechanism for the teachability point; AlphaZero transfer proves M−H concepts are superhuman yet within elite ZPD.

## How It Works
```
Inspective:   model ──instrument──► artifact (saliency, circuit, concept) ──► human critiques ── consensus
                (one-shot, stateless)

Agentic:      human ⇄ LLM (proactive, multi-turn, mental-model-aware) ⇄ human builds model of LLM
               │  Implicit/explicit user model (What does user know? What is ZPD?)
               │  ─► tailored explanations, quizzes, hypotheses, circuit manipulations
               │  ◄─ human questions, misconceptions, goals
               └──► summary report / meeting note (artifact for consensus, iteratively refined)
Evaluation proxies:
  Case IMPROVE (human concept f): Does insight yield M' s.t. avg f(x,M'(x)) > f(x,M(x))? (e.g., add docs to prompt)
  Case LEARN (machine concept f = f_M(x,y)): simulatability = human predicts ĉ = f_M(x,y) on held-out vs true c
       ├─ verifiable: flowery-language notion of good, neuron-1383 fire, chess concept 23
       └─ unverifiable: application-grounded (Elo gain)
  Challenges: Models lack meta-understanding (can't articulate own long-context failure); LLM-as-human proxy for cheap signal; expensive human eval ultimate.
```

## Practical Implications
- **When to use which**: For **high-stakes safety audits** (deception, hidden goals, Marks 2025) use inspective/mechanistic (complete, exhaustive). For **integration, debugging, and teaching** (model development cycles, onboarding, superhuman knowledge transfer) use agentic while models cooperative — start now. Hybrid: use inspective tools *inside* agentic loop (e.g., open surgery converses about probed circuits).
- **Build mental-model awareness**: Log user knowledge state across turns (explicit graph or implicit context) rather than stateless prompts; tailor explanations to ZPD — too easy bores, too hard fails. Use neologisms to disambiguate human vs machine semantics.
- **Design for variance**: Expect diverse trajectories; evaluate with cohort, not single user; use low-temp seeds for reproducibility but acknowledge semantic variance remains. Report distribution, not point estimate.
- **Produce artifacts**: End each dialogue with **iteratively refined summary report** to enable sharing/consensus — don't rely on ephemeral chat. This also enables HELM-style standardization.
- **Measure correctly**: For improve-case, track end-task gain *and* distance `M'–M` constraint (can't swap model). For learn-case, measure held-out simulatability accuracy, not self-report confidence. Complement with application-grounded metrics (debugging speedup, Elo). Use LLM proxies for iteration, human cohorts for validation per Doshi-Velez & Kim 2017 / Hoffman 2018 rigor.
- **Failure modes**: If model is deceptive, agentic explanations may mislead — monitor coherence under intervention; high cognitive load of sustained deception is signal.

## Connections
- Extends [[evaluation]]: HELM (Sec 4) showed accuracy alone insufficient and incompleteness is inherent; agentic adds interaction dimension and human-entangled evaluation challenges (Krippendorff α ~0.34 in Chameleon human eval illustrates subjectivity).
- Complements [[alignment]]: Deception (Greenblatt 2024 alignment faking) is limit of agentic; inspective needed for auditing. Alignment tax discussion parallels completeness vs interactivity trade-off.
- Informs [[trustworthiness-in-llms]] (truthfulness, safety, fairness): agentic can teach machine ethics concepts but needs verification; trust requires both inspective guarantees and agentic teachability.
- Grounds [[multimodal-ai]]: PCA modality gaps (MoT Fig 7) are interpretability diagnostics that motivated architecture; multimodal concepts are superhuman (e.g., cross-modal grounding) amenable to agentic teaching.
- Enables [[reasoning-llms]] / [[thinking-models]]: Verifying step-by-step reasoning (Lightman PRM) is inspective; agentic can converse about reasoning traces.
- Related to [[ai-ethics]]: Keeping humans in understanding loop mitigates exclusion; Pareto frontier explicitly handles multi-objective societal trade-offs.
- Empirical leg from [[source-neologism-learning]]: language-native control (frozen model + trained token) sits between inspective surgery and agentic dialogue — no forward-pass change yet 92% concept-gap closure; machine-only synonyms (e.g., "unrivaled" → flattery) are direct evidence of M−H divergence that motivates this whole framing.

## Open Questions
- How to faithfully evaluate if a human truly grasps superhuman concept vs mimicking predictions? Simulatability may be necessary but not sufficient.
- Can LLM-as-proxy evaluation be trusted when model itself doesn't know why it behaves (introspection gap)? Co-discovery via hypotheticals may help but is unproven — though [[source-neologism-learning]]'s self-verbalizations (validated by plug-in steering, 83% gap closure) show partial, behaviorally-checkable introspection exists.
- How to hybridize: what inspective artifacts best feed agentic dialogue, and when does conversation hurt vs help completeness? Formal Pareto characterization needed.
- Mental model fidelity: do LLMs truly model users or pattern-match conversation? Metrics for user-model accuracy lacking.
- Scaling: does agentic effectiveness degrade as model knowledge becomes increasingly superhuman and ZPD widens beyond human reach?

## Sources
- [[source-agentic-interpretability]] — Primary definition, opportunities, evaluation framework, human-entangled challenge.
- The Pareto Frontier of Human-Centered AI — Multi-objective frontier framing; human-eval paralysis; teachability as deliberate frontier point.
- [[source-we-cant-understand-ai-vocabulary]] — Interpretability as communication problem; neologism desiderata; H/M concept spaces.
- [[source-neologism-learning]] — Empirical validation: 92% control, self-verbalization, machine-only synonyms, compositionality.
- [[source-bridging-human-ai-knowledge-gap-alphazero]] — End-to-end M−H discovery + grandmaster transfer; teachability/novelty filters.
- [[source-helm]] — Holistic multi-metric incompleteness, standardization vs brittleness, living benchmark ethos.
- [[source-lets-verify-step-by-step]] — Process supervision (PRM) as inspective step-level evaluation, application-grounded complement.

<nav class="kb-next" aria-label="Next in this reading path"><p>Next in this reading path: <a href="/eval-safety/concepts/ai-ethics">AI Ethics</a></p></nav>

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
