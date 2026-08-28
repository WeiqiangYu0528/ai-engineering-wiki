---
type: source-summary
title: "Because we have LLMs, we Can and Should Pursue Agentic Interpretability"
summary: "The June 2025 position paper by Been Kim et al. (Google DeepMind, arXiv 2506.12152, CS224n Week 8 Tue – Interpretability, Been Kim) argues that the LLM era unlocks a new interpretability paradigm: agentic…"
status: draft
visibility: public
author: "Been Kim, John Hewitt, Neel Nanda, Noah Fiedel, Oyvind Tafjord (Google DeepMind)"
source-type: paper
url: "https://arxiv.org/abs/2506.12152"
date-published: 2025-06-13
date-ingested: 2026-08-25
tags:
  - eval-safety
  - agents
  - llm-fundamentals
key-concepts:
  - "[[interpretability]]"
  - "[[ai-ethics]]"
  - "[[evaluation]]"
  - "[[alignment]]"
key-entities:
  - "[[google-research]]"
---

# Because we have LLMs, we Can and Should Pursue Agentic Interpretability

## Summary
The June 2025 position paper by Been Kim et al. (Google DeepMind, arXiv 2506.12152, CS224n Week 8 Tue – Interpretability, Been Kim) argues that the LLM era unlocks a new interpretability paradigm: **agentic interpretability**. Defined as *a multi-turn conversation where the LLM proactively assists human understanding by building a mental model of the user, which in turn lets the human build a better mental model of the LLM*, it contrasts with traditional **inspective interpretability** (opening the black box: probing, circuits, saliency). The paper contends that because LLMs can now converse coherently and model context, we should co-opt them as cooperative teachers — analogous to a teacher evaluated by student comprehension — especially while models remain largely cooperative and not yet predominantly superhuman. It maps opportunities, trade-offs, and evaluation challenges for this human-entangled-in-the-loop approach and is paired in CS224n with Been Kim's essay *The Pareto Frontier of Human-Centered AI* (Medium, 2025) on evaluation complexity in human-centered AI.

## Key Takeaways
1. **Definition & three pillars**: Agentic interpretability = **proactive assistance** (model takes initiative, not just answers queries) + **multi-turn interaction** (iterative refinement) + **mutual mental model** (model infers user knowledge/confusion; user builds model of model). Mental models draw on Johnson-Laird, Norman, HCI and Theory-of-Mind literature.
2. **Why now**: LLMs' coherent contextual conversation makes this feasible; many opaque behaviors (e.g., single-token jailbreak sensitivity) may involve superhuman or counter-intuitive knowledge that single-turn artifacts cannot convey.
3. **Not for all cases**: By prioritizing interactivity, agentic interpretability **trades completeness for interaction** – less suitable for high-stakes safety audits of potentially deceptive/misaligned models where exhaustive circuit-level guarantees are needed. [[evaluation]] and mechanistic interpretability remain essential there ([[source-helm]] incompleteness argument applies).
4. **Three concrete opportunities**:
   - **Model-trainer model / meta-model collaborator**: Train a meta-model on project history (experiments, code, discussions) that converses with developers, proposes hypotheses, and debugs with awareness of their ZPD.
   - **Teaching superhuman knowledge**: Leverage Vygotsky's Zone of Proximal Development (ZPD) to scaffold new concepts (e.g., `super_chess_37`), as in AlphaZero→grandmaster transfer (Schut et al. 2025) and neologism learning (Hewitt et al. 2025).
   - **Agentic mechanistic interpretability**: "Open-model surgery" – researchers ablate/amplify circuits while conversing with the model to explain behavioral changes, akin to awake brain surgery; forces deceptive models to maintain coherence under intervention.
5. **Alternative views addressed**: (a) If models are deceptive, agentic methods fail completeness – use inspective methods (Shah 2025, Sharkey 2025, Olah 2020). (b) Not devaluing traditional methods – inspective artifacts become components inside agentic loops; Doshi-Velez & Kim rigor remains. (c) Consensus artifact worry – solution is **generated meeting-note summary report** iteratively refined with human.
6. **Evaluation is human-entangled-in-the-loop**: Humans' responses are integral to the algorithm, not external feedback, making reproducibility, controlled comparison, and isolation of variables hard. Trajectories vary wildly with user background and LLM stochasticity (prompt engineering brittleness). Superhuman concepts may exceed single-user validation capacity.
7. **Two evaluation proxy families** (with formalization `f:(x,y)↦c`):
   - **Case improve** (make model do what we want, human concept `f`): measure whether model-assisted insight yields `M' ≻ M` on `f(x,M(x))` under similarity constraint – concrete but conflates interpretability with model improvement.
   - **Case learn** (learn machine concept): **simulatability** – human predicts `ĉ = f(x,y)` vs ground truth `c` on held-out examples (e.g., predict model's notion of "good" or neuron-1383 firing); if unverifiable, fall back to **application-grounded** end-task (Elo gain).
   - **Challenges**: models lack meta-understanding of own failures (like native speakers cannot articulate grammar); LLM-as-human proxy proposed for cheap signal; expensive human eval still ultimate.

## Detailed Notes

### What is agentic interpretability? (Sec 2)
- Term **agentic** = Merriam-Webster 2020s sense: making decisions, taking actions, reasoning on its own; here: *proactively building mental model of user to help understanding*.
- **Mental model** – implicit (context memory: "you said you're unfamiliar with gravitational waves") vs explicit (maintained knowledge graph of understood/confused concepts, Hahn et al. 2024). Necessity argued via expert-team literature (Cannon-Bowers): stateless LLM requiring repeated reminders is inefficient; human's model of machine also intrinsically valuable to "keep up" as models outpace us, mitigating opacity-driven exclusion (Van Dijk 2005).
- **Figure 1** contrast: agentic (conversation loop, mutual models) vs inspective (artifact).
- Distinction from [[ai-agents]] / [[deep-agents]]: agency here is explanatory, not task-execution, though overlaps with deep research agent patterns.

### Opportunities (Sec 2.2)
- **Model trainer model**: Extends automated evaluation, red-teaming, prompt-tuning, automated interpretability (Rott Shaham 2024, Sado 2023) from prescribed routines to dialogic partnership.
- **ZPD + neologism learning**: New token e.g., `machine_good` disambiguates human vs machine semantics; Socratic dialogue scaffolds from known to unknown frontier.
- **Deception detection**: Extended dialogue raises cognitive load for deceiver; internal manipulation exposes inconsistencies – interrogation analogy.

### Challenges & Trade-offs (Sec 4)
- **Human-entangled-in-the-loop** vs human-in-the-loop: reproducibility hard; LLM as proxy suggested.
- **Variance**: Even expert cohort diverges (visual vs textual learner); LLM semantic variance compounds.
- **Inefficiency for completeness**: Cannot exhaustively enumerate circuits; governing equation extraction possible but slower than direct internal modification.
- **Hill-climbing difficulty**: No functionally-grounded evaluation without human; low-temp seed control insufficient due to semantic variance; Grosse influence-function style optimization hard.

### Evaluation (Sec 5)
- Notation `x` input, `y` output (text/multimodal), `f` concept function human- or model-defined.
- **Case improve** examples: "my understanding of this code base is poor; you should include documentation in my system prompt" → improved `M'`. Need to define metric `f` and gap `M'–M`.
- **Case learn** examples: flowery-language notion of good, superhuman chess concept 23, neuron 1383.
- **Models don't know why they behave**: Co-discovery via hypotheticals ("Given x', what is y' and c'?").
- Human vs machine concept boundary blurry (e.g., model quality score is human-prompted) – choose evaluation by scientific interest, not taxonomy.
- **Expensive replication**: Propose LLM-simulated user as fast proxy.

### Related Work (Sec 6)
- **Cognitive science**: Mental models, grounding (Clark & Schaefer 1991), Rational Speech Acts – recursive speaker reasoning, pedagogy/scaffolding, Marr levels – agentic likely computational-level.
- **HCI**: XAI interfaces (Abdul 2018), interactive ML (Amershi 2014), human-AI collaboration (Bansal 2021/2024), Cai et al. 2019 iterative exploration.

### Connection to Pareto Frontier essay
- Been Kim's companion Medium essay *The Pareto Frontier of Human-Centered AI* (2025) frames broader dilemma: human evaluation paralyzed by complexity, multi-objective trade-offs (performance vs personalization vs fairness). Agentic interpretability is one frontier point – optimizing for teachability/learnability, not just accuracy.

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 4 passages in this section could not be located in the stored source ([https://arxiv.org/abs/2506.12152](https://arxiv.org/abs/2506.12152)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "A method pursues agentic interpretability if it proactively assists human understanding in a multi-turn interactive process by developing and leveraging a mental model of the user, which in turn enables humans to develop better mental models of the LLM."

> "Agentic interpretability may trade off completeness for interactivity, making it less suitable for high-stakes safety situations with potentially deceptive models, but leverages a cooperative model to discover potentially superhuman concepts."

> "Humans are not merely in-the-loop but interwoven… We call this human-entangled-in-the-loop; humans' responses are integral to the algorithm itself."

> "Without major breakthroughs in interpretability, human understanding risks being outpaced by rapid LLM advancements."

## Concepts Introduced or Referenced
- [[interpretability]] — Core new paradigm; contrasts inspective vs agentic; teaching superhuman knowledge as frontier.
- [[ai-ethics]] — Window of cooperation before deception; exclusion risks of opacity; need to keep up.
- [[evaluation]] — Human-entangled evaluation challenges, proxy metrics, simulatability; complements [[source-helm]] holistic view.
- [[alignment]] — Deception/faking (Greenblatt 2024) as limit of agentic methods; alignment tax not discussed but relevant.
- [[ai-agents]] / [[deep-agents]] — Overlap in proactive, multi-turn agency; but explanatory vs task agency.

## Critical Assessment
**Strengths**: Timely synthesis of dispersed ideas (CoT, Socratic teaching, automated interpretability) into coherent framework; honest about trade-offs and evaluation hardness; concrete, testable examples (meta-model, AlphaZero, open surgery) bridge vision to experiments; leverages SoTA LLMs as both subject and tool, creating virtuous cycle. Pairs well with [[evaluation]]: HELM showed single-metric incompleteness; agentic adds interaction dimension.

**Weaknesses**: Position paper, no new experiments; relies on assumption of current cooperativeness that may not hold for frontier deceptive models; mental model construct risks anthropomorphizing – no evidence LLMs form faithful user models vs pattern-matching; evaluation proxies remain vague (no threshold for "good" simulatability). Contradiction potential with mechanistic interpretability's exhaustive guarantees – paper acknowledges but under-specifies hybrid integration.

**Gaps / Links**: Needs empirical validation of ZPD-guided teaching (neologism 2025 citations are preprints); no discussion of cost/latency of multi-turn vs single artifact; missing link to [[rag-evaluation]] faithfulness per-step evaluation which shares process-supervision spirit.

---

**Source:** Because we have LLMs, we Can and Should Pursue Agentic Interpretability by Been Kim, John Hewitt, Neel Nanda, Noah Fiedel, Oyvind Tafjord (Google DeepMind) — <https://arxiv.org/abs/2506.12152>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
