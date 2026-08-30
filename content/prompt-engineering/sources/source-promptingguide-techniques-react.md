---
type: source-summary
title: "Prompt Engineering Guide — ReAct Prompting"
summary: "This comprehensive chapter covers Yao et al. (2022) ReAct: Synergizing Reasoning and Acting in Language Models."
status: verified
visibility: public
author: "DAIR.AI (Elvis Saravia et al.) — based on Yao et al. (2022)"
source-type: article
url: "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/react.en.mdx"
date-published: 2022-10-01
date-ingested: 2026-08-24
tags:
  - prompt-engineering
  - agents
key-concepts:
  - "[[react]]"
  - "[[tool-use]]"
  - "[[prompt-engineering]]"
key-entities:
  - "[[openai]]"
verified-by: agent
verified-on: 2026-08-27
aliases:
  - wiki/source-promptingguide-techniques-react
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">This comprehensive chapter covers Yao et al. (2022) ReAct: Synergizing Reasoning and Acting in Language Models.</p>
<p class="kb-provenance">DAIR.AI (Elvis Saravia et al.) — based on Yao et al. (2022), 2022-10-01. <a href="https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/react.en.mdx">Original source</a></p>
<p class="kb-trust kb-status-verified"><a href="/trust">Verified by agent - every figure checked against the stored source</a> <span>checked by an automated agent on 2026-08-27</span></p>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Summary
This comprehensive chapter covers Yao et al. (2022) *ReAct: Synergizing Reasoning and Acting in Language Models*. ReAct interleaves verbal reasoning traces (Thought) with task-specific actions (Act) that interact with external environments — e.g., Wikipedia Search/Lookup — yielding observations (Obs) that ground next thoughts. The guide explains why pure CoT hallucinates, shows ReAct prompt structure with multi-step Thought-Act-Obs trajectories (HotPotQA example: Colorado orogeny → High Plains → 1,800–7,000 ft), reports PaLM-540B results on HotPotQA/Fever and AlfWorld/WebShop, and provides a runnable LangChain `zero-shot-react-description` agent demo (Serper Search + LLM-math) answering Harry Styles’ age^0.23.

## Key Takeaways
1. **Reason + Act synergy:** `Thought` tracks/updates plans and handles exceptions; `Act` retrieves info or manipulates environment; loop until `Finish[answer]`.
2. **Grounding fixes hallucination:** CoT without tools hallucinates facts; ReAct grounds reasoning in retrieved observations — most powerful when combined (ReAct+CoT+Self-Consistency beats either alone).
3. **Task-dependent prompting:** Knowledge-intensive QA uses dense Thoughts per lookup; decision tasks (ALFWorld/WebShop) use sparse Thoughts around many actions.
4. **Empirical wins + limits:** ReAct > Act everywhere; ReAct > CoT on Fever but < CoT on HotPotQA (structural constraints, retrieval dependence); best is hybrid adaptive switching. On AlfWorld/WebShop, reasoning-augmented ReAct beats Act but still far from human experts.
5. **LangChain operationalization:** Modern agents abstract ReAct — `initialize_agent(..., agent="zero-shot-react-description")` with `google-serper` + `llm-math` tools auto-generates Thought/Action/Observation loops.

## Detailed Notes

### Motivation
- CoT excels at arithmetic/commonsense reasoning but lacks world access → fact hallucination, error propagation, stale knowledge.
- ReAct inspiration: human interplay of reasoning to plan and acting to gather evidence.

### How It Works
- **Trajectory format (few-shot exemplars):** `Question → Thought 1 → Action 1 (Search[...]/Lookup[...]) → Observation 1 → Thought 2 → ... → Finish[answer]`
- **Construction:** Sample cases from training set (e.g., HotPotQA), manually compose ReAct trajectories as few-shot exemplars; thoughts serve distinct roles: decomposing questions, extracting info, commonsense/arithmetic, guiding search formulation, synthesizing answer.
- **HotPotQA example (HotpotQA):**
  ```
  Q: What is the elevation range for area that eastern sector of Colorado orogeny extends into?
  Thought 1: need Search[Colorado orogeny]...
  Observation 1: Colorado orogeny in Colorado...
  Thought 2: need Lookup[eastern sector] → Observation 2: extends into High Plains (Central Plains orogeny)
  Thought 3-4: Search High Plains → disambiguate High Plains (United States) → Observation 4: 1,800–7,000 ft
  Finish[1,800–7,000 ft]
  ```

### Results

#### Knowledge-Intensive (PaLM-540B)
- **HotPotQA/Fever table (REACT1):**
  - ReAct > Act on both.
  - Fever: ReAct > CoT (grounding helps verification).
  - HotPotQA: ReAct < CoT (over-constrained structure, brittle retrieval).
- **Error analysis:** CoT → hallucination; ReAct → reduced flexibility, derailed by non-informative search results, difficulty recovering.
- **Hybrid best:** Adaptive ReAct ↔ CoT+SC switching outperforms all.

#### Decision-Making (ALFWorld text game, WebShop shopping)
- Sparse thoughts, many actions; example ALFWorld ReAct trace shown (REACT2).
- ReAct >> Act (Act fails to decompose goals into subgoals).
- Still well below expert human; reasoning helps but prompting alone insufficient.

### LangChain ReAct Demo
```python
from langchain.llms import OpenAI
from langchain.agents import load_tools, initialize_agent
llm = OpenAI(model_name="text-davinci-003", temperature=0)
tools = load_tools(["google-serper", "llm-math"], llm=llm)
agent = initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)
agent.run("Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?")
# Trace: Search Olivia Wilde boyfriend → Harry Styles → Search Harry Styles age → 29 → Calculator 29^0.23 → 2.169...
```
- Note: `zero-shot-react-description` uses tool descriptions in system prompt; no few-shot exemplars needed (unlike paper’s few-shot ReAct).

## Notable Quotes
> "Generating reasoning traces allow the model to induce, track, and update action plans, and even handle exceptions. The action step allows to interface with and gather information from external sources such as knowledge bases or environments."

> "ReAct can retrieve information to support reasoning, while reasoning helps to target what to retrieve next."

> "Best approach uses ReAct combined with chain-of-thought (CoT) that allows use of both internal knowledge and external information obtained during reasoning."

## Concepts Introduced or Referenced
- [[react]] — Interleaved Thought-Act-Obs prompting for grounded reasoning and tool use.
- [[tool-use]] — Search, Lookup, Calculator as tools; LangChain as harness — precursor to [[model-context-protocol]].
- [[prompt-engineering]] — Few-shot trajectory exemplars as prompt construction.
- [[hallucination]] — Motivation: grounding to curb factual hallucination.
- [[thinking-models]] — Shares CoT lineage (Wei et al. 2022) but adds environment coupling.

## Critical Assessment
- **Strengths:** Most thorough chapter in batch — clear motivation, step-level prompt anatomy, disaggregated results with honest error analysis, and a runnable LangChain example that operationalizes the paper.
- **Weaknesses:** HotPotQA/Fever figure not reproduced numerically in guide; ALFWorld/WebShop results summarized qualitatively (“outperforms”) without numbers; LangChain code pinned to deprecated `text-davinci-003`/`langchain.llms`; no discussion of latency/cost of multiple search steps or security of `google-serper`; YouTube embed is superficial.
- **Contradictions:** Finding that ReAct < CoT on HotPotQA nuances the “tools always help” narrative — highlights structural overhead vs pure reasoning. Complements [[program-aided-language-models]] (tool = interpreter) and anticipates [[reflexion]] (which adds reflection on ReAct trajectories).
- **Next steps:** Add modern equivalents (OpenAI function calling, MCP Wikipedia server), hybrid controller logic, and retry/reformulation strategy when observations are uninformative.

## Sources
- Original MDX: https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/react.en.mdx
- Saved raw: [https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/react.en.mdx](https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/react.en.mdx)
- Primary paper: Yao et al. (2022) — https://arxiv.org/abs/2210.03629
- Notebook: https://github.com/dair-ai/Prompt-Engineering-Guide/blob/main/notebooks/react.ipynb

---

**Source:** Prompt Engineering Guide — ReAct Prompting by DAIR.AI (Elvis Saravia et al.) — based on Yao et al. (2022) — <https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/techniques/react.en.mdx>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `verified` — Claims and quotations on this page were checked against the cited source (agent). See [[trust]] for methodology.
