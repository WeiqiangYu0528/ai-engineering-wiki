---
type: concept
title: "ReAct (Reasoning + Acting)"
summary: "ReAct (Yao et al., 2022, Princeton & Google Brain, ICLR 2023) in ReAct: Synergizing Reasoning and Acting in Language Models is the prompting paradigm that synergizes reasoning traces ($\\mathcal{L}$) and actions…"
visibility: public
aliases:
  - "ReAct Prompting"
  - "Reason and Act"
  - "Synergizing Reasoning and Acting"
tags:
  - prompt-engineering
  - agents
  - rag
created: 2026-08-24
updated: 2026-08-24
status: draft
sources:
  - "[[source-react-synergizing-reasoning-and-acting]]"
  - "[[source-promptingguide-techniques-react]]"
  - "[[source-chain-of-thought-prompting-elicits-reasoning]]"
  - "[[source-self-consistency-improves-chain-of-thought-reasoning]]"
related:
  - "[[chain-of-thought]]"
  - "[[self-consistency]]"
  - "[[tool-use]]"
  - "[[retrieval-augmented-generation]]"
  - "[[model-context-protocol]]"
  - "[[reflexion]]"
  - "[[program-aided-language-models]]"
  - "[[thinking-models]]"
  - "[[ai-agents]]"
---

# ReAct (Reasoning + Acting)

## Overview
**ReAct** (Yao et al., 2022, Princeton & Google Brain, ICLR 2023) in [[source-react-synergizing-reasoning-and-acting]] is the **prompting paradigm that synergizes reasoning traces ($\mathcal{L}$) and actions ($\mathcal{A}$)** by augmenting the policy to $\hat{\mathcal{A}}=\mathcal{A}\cup\mathcal{L}$ (thoughts update context without environment observation) and interleaving them: **reason to act** (decompose, plan, handle exceptions, guide retrieval) and **act to reason** (query Wikipedia / ALFWorld / WebShop to gather info). Evaluated with **PaLM-540B** (also GPT-3/LaMDA/UL2) on **HotpotQA/Fever** (Wikipedia API: `search`/`lookup`/`finish`) and **ALFWorld/WebShop** (text decisions), ReAct with only **1–6 few-shot examples** outperforms **CoT, Act, CoT-SC (21-sample), imitation/RL on 100k trajectories** (ALFWorld 71% vs Act 45% vs BUTLER 37%; WebShop 40.0 SR vs IL+RL 28.7; HotpotQA/Fever hybrid ReAct↔CoT-SC best), with **finetuning** (3k ReAct trajectories) making **PaLM-8B ReAct > all 62B prompting** and **62B ReAct > all 540B prompting**. Grounding halves hallucination false-positive (14%→6%) and enables human-in-the-loop thought editing.

## Key Ideas
- **Augmented Action Space $\hat{\mathcal{A}}=\mathcal{A}\cup\mathcal{L}$:** At step $t$, context $c_t=(o_1,a_1,\dots,o_t)$ → $a_t\in\mathcal{A}$ or thought $\hat{a}_t\in\mathcal{L}$ (no observation, just updates $c_{t+1}$). Thoughts serve diverse functions: goal decomposition, commonsense injection, evidence extraction, progress tracking, plan adjustment, search reformulation, synthesis (Figure 1).
- **Two Operating Modes:** *Dense* for QA (alternating thought-action-observation: Thought1 decompose → Search → Thought2 extract → Lookup → Thought3 exception → Search … → Finish) vs *sparse* for decision tasks (model decides when to think around many actions, e.g., ALFWorld/WebShop thoughts only at subgoal boundaries).
- **Grounding over Hallucination:** Pure CoT (Wei et al. 2022) lacks world access and hallucinates (56% of CoT failures vs 0% for ReAct on HotpotQA; false-positive 14% vs 6%); ReAct's Wikipedia/API observations anchor answers, at cost of structural rigidity (higher reasoning-error 47% vs CoT 16% due to repetitive loops and reliance on retrieval).
- **Wikipedia API (Knowledge Tasks):** `search[entity]` → 5 sentences / top-5 suggestions, `lookup[string]` → next sentence containing string (Ctrl+F), `finish[answer]` — intentionally weak (exact-entity only) vs neural retriever to force explicit reasoning-to-retrieve. HotpotQA/Fever question-only (no paragraphs), 6/3 exemplars, CoT-SC 21 samples (temp 0.7) as baseline.
- **Prompt-Only vs Finetuning Scaling:** Prompting: ReAct < CoT on HotpotQA (27.4 vs 29.4) but hybrid best (ReAct→CoT-SC 35.1, CoT-SC→ReAct 34.2 vs supervised SOTA 67.5/89.5). Finetuning on 3k bootstrapped correct ReAct trajectories (Zelikman-style) flips: **PaLM-8B ReAct > all 62B prompting**, **PaLM-62B ReAct > all 540B prompting** — teaching to *act+reason* generalizes better than memorizing facts (Standard/CoT finetuning far worse).
- **Decision Tasks — Outperforming Trained Agents:** 
  - **ALFWorld** (6 task types, >50 steps, 134 unseen): ReAct **71% best-of-6 (57% avg)** vs Act 45%, ReAct-IM (dense Inner Monologue) 53%, BUTLER 37% (IL 100k) — gain 33–90% avg 62% across 6 trials; even worst ReAct (48%) beats best baselines. Sparse thoughts crucial vs IM's state-feedback only.
  - **WebShop** (1.18M products, 500 test): ReAct 66.6/40.0 Score/SR vs Act 62.3/30.1 vs IL 59.9/29.1 vs IL+RL 62.4/28.7 vs human 82.1/59.6 — **+10% SR** via reasoning bridging noisy descriptions ("space-saving ottoman 39x18x18inch blue").
- **Design Properties (Section 2):** Intuitive (humans just write thoughts atop actions, no format tuning), general (QA/WebShop/ALFWorld), performant/robust (1–6 examples), human-aligned/controllable (interpretable $r$ vs $obs$, thought editing Figure 5 for correction).

## How It Works
**Trajectory format (from paper, HotPotQA example):**
```
Question: What is the elevation range for area that eastern sector of Colorado orogeny extends into?
Thought 1: I need to search Colorado orogeny, find eastern sector area, then its elevation.
Action 1: Search[Colorado orogeny]
Observation 1: The Colorado orogeny was an episode of mountain building in Colorado...
Thought 2: It does not mention eastern sector. So I need to Lookup[eastern sector].
Observation 2: The eastern sector extends into the High Plains and is called the Central Plains orogeny.
Thought 3: Need to search High Plains and find elevation.
Action 3: Search[High Plains] → Observation 3: ambiguous (two regions)
Thought 4: Search[High Plains (United States)]
Observation 4: High Plains rise in elevation from around 1,800 to 7,000 ft...
Thought 5: Answer is 1,800 to 7,000 ft.
Action 5: Finish[1,800 to 7,000 ft]
```
Thoughts decompose, extract, perform commonsense/arithmetic (`1844 < 1989`), guide reformulation, synthesize — all free-form language over $c_t$.

**Decision Tasks — Sparse Thoughts (ALFWorld/WebShop):**
```
Goal: examine paper under desklamp
Thought: I need to find paper then desklamp; paper likely on coffeetable, desklamp on desk/shelf.
Action: go to coffeetable 1 → Obs: paper 2 → take paper 2
Thought: Got paper, now need desklamp; check desks one by one.
Action: go to desk 1 → Obs: desklamp 1 → use desklamp 1
→ sparse thoughts only at subgoal boundaries, not every step (paper Section 2).

Finetuning: 3k correct ReAct trajectories (thoughts+actions+obs) bootstrapped from PaLM-540B → finetune PaLM-8B/62B to decode full trajectories conditioned on question (Appendix B.1).

Human-in-the-loop: Figure 5 shows thought editing on ALFWorld to correct behavior on the fly (e.g., fixing location hypothesis).

**Modern operationalization (LangChain):**
```python
llm = OpenAI(model_name="text-davinci-003", temperature=0)
tools = load_tools(["google-serper", "llm-math"], llm=llm)
agent = initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)
agent.run("Who is Olivia Wilde's boyfriend? What is his current age raised to 0.23 power?")
# Trace: Search Olivia Wilde boyfriend → Harry Styles → Search Harry Styles age → 29 → Calculator 29^0.23 → 2.169...
```
`zero-shot-react-description` embeds tool descriptions in system prompt, removing need for few-shot trajectories (paper used few-shot; modern uses zero-shot tool descriptions).

## Practical Implications
- **When to use:** Knowledge-intensive QA (HotpotQA, Fever) where grounding halves hallucination (14%→6% false-positive) and decision-making (ALFWorld 71% vs 45%, WebShop +10% SR) where iterative evidence gathering is required — but note prompting ReAct < CoT on HotpotQA alone (27.4 vs 29.4) due to rigidity; hybrid ReAct↔CoT-SC (fall back when one fails) is best overall (34–35% EM) and finetuned ReAct dominates (PaLM-8B finetuned > all 62B prompting).
- **Tool/API design:** Define Search/Lookup/Finish (or MCP tools) with clear JSON schemas; constrain via [[tool-use]] [[structured-outputs]] `strict:true` to avoid format drift; Wikipedia API example is intentionally weak (exact-entity) to force reasoning — modern retrievers would be stronger but need same thought-guided reformulation.
- **Failure modes (Table 2):** *Reasoning error* 47% (including repetitive loops where model repeats previous thoughts/actions — greedy decoding suboptimal), *non-informative search* 23% (derails and hard to recover), *hallucination* 0% for ReAct (vs 56% for CoT) but still possible via bad retrieval. Mitigate with query reformulation prompts (`maybe I can search/look up x instead`), fallback to CoT (ReAct→CoT-SC), self-consistency voting, or finetuning on correct trajectories.
- **Cost/latency:** Each Thought-Act-Obs step is an LLM call + tool latency (HotpotQA 5–7 steps, ALFWorld >50 steps, WebShop multiple searches); budget timeout accordingly; consider [[model-context-protocol]] for standardized servers and [[prompt-caching]] for repeated prefixes (tools→system→messages).
- **Finetuning vs prompting trade-off:** Prompting is lower-bound (context-length ceiling for large action spaces); with 3k human-correct ReAct trajectories, finetuning small models generalizes better than prompting large ones — invest in high-quality trajectory annotation for production.
- **Human-in-the-loop:** Thoughts are interpretable and editable (Figure 5) — monitor $r$ vs $obs$ to distinguish internal vs external knowledge and correct on the fly, improving trustworthiness.
- **Security:** Tool outputs are untrusted — sanitize before feeding back to prevent [[prompt-injection]]; ReAct's interleaving increases injection surface.

## Connections
- Core pattern for [[tool-use]] and [[model-context-protocol]] agents; standardized in [[claude-code]]-style harnesses and [[agent-components]] planning/tools/memory loop (ReAct is the canonical Thought-Act-Obs loop).
- Direct predecessor to [[reflexion]] (adds Evaluator + Self-Reflection verbal memory on top of ReAct trajectories) and to [[program-aided-language-models]] (Action = code execution) and [[automatic-reasoning-and-tool-use]] (retrieved tool library).
- Extends [[chain-of-thought]] (reason-only) with acting — Wei's CoT is static black-box, ReAct interleaves $r$ with $obs$ to handle exceptions and maintain working memory (Vygotsky inner speech). Hybrid ReAct+[[self-consistency]] (CoT-SC 21 samples, majority vote) is best prompting.
- Mitigates [[hallucination]] by grounding (retrieved facts vs internal), at cost of retrieval brittleness (23% search errors) — complements [[retrieval-augmented-generation]] and [[rag-faithfulness]].
- Shares lineage with [[thinking-models]] but grounds reasoning in environment vs pure internal deliberation; Inner Monologue (Huang 2022b) is dense state-feedback only — ReAct sparse diverse reasoning wins 71 vs 53.
- Generalizes to [[ai-agents]] and [[deep-agents]] (orchestrator/sub-agents) where reasoning guides acting and acting gathers info — the synergistic loop described in Section 2.

> [!NOTE] Complementarity
> [[source-chain-of-thought-prompting-elicits-reasoning]] (CoT) and [[source-self-consistency-improves-chain-of-thought-reasoning]] (CoT-SC) are reasoning-only; [[source-react-synergizing-reasoning-and-acting]] shows ReAct alone < CoT on HotpotQA (27.4 vs 29.4) but ReAct+CoT-SC (35.1) > either alone, and finetuned ReAct dominates. The three form a progression: CoT (internal) → CoT-SC (sampled internal) → ReAct (grounded interleaved) → hybrid.

## Open Questions
- How to learn an adaptive controller that switches between ReAct and pure CoT per question rather than fixed ReAct→CoT-SC / CoT-SC→ReAct heuristics (paper's 7/5 step limit and n/2 majority)?
- How to make retrieval robust — query rewriting, multi-source fusion, confidence-aware backtracking — when 23% searches are non-informative and repetitive loops occur?
- Can ReAct trajectories be scaled beyond 3k bootstrapped examples to multi-task finetuning + RL (as paper suggests) to internalize tool-use policy and handle larger action spaces beyond in-context length limits?
- Does synergy generalize beyond Wikipedia/ALFWorld/WebShop to noisy real-world APIs where tool definitions are less clean?

## Sources
- [[source-react-synergizing-reasoning-and-acting]]
- [[source-promptingguide-techniques-react]]
- [[source-chain-of-thought-prompting-elicits-reasoning]]
- [[source-self-consistency-improves-chain-of-thought-reasoning]]

## Sources
- [[source-promptingguide-techniques-react]]

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
