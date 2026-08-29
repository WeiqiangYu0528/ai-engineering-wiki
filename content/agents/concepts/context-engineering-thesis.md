---
type: synthesis
title: "Context Engineering: One Constraint Seen From Three Layers"
summary: "Anthropic frames context as scarcity, LangChain as an operations problem, CS336 as inference arithmetic; they describe one constraint, and the practical upshot is that prompt decisions are cost decisions."
visibility: public
status: draft
tags:
  - agents
  - inference
created: 2026-08-27
updated: 2026-08-27
sources:
  - "[[source-effective-context-engineering-for-ai-agents]]"
  - "[[source-context-engineering-for-agents-langchain]]"
  - "[[source-cs336-lecture10-inference]]"
  - "[[source-prompt-caching]]"
  - "[[source-promptingguide-guides-context-engineering-guide]]"
  - "[[source-building-effective-agents]]"
related:
  - "[[context-engineering]]"
  - "[[prompt-caching]]"
  - "[[context-caching]]"
  - "[[inference]]"
  - "[[ai-agents]]"
  - "[[deep-agents]]"
  - "[[self-attention]]"
aliases:
  - wiki/context-engineering-thesis
---

<aside class="kb-header kb-type-synthesis" aria-label="Page information">
<p class="kb-type">Synthesis</p>
<p class="kb-summary">Anthropic frames context as scarcity, LangChain as an operations problem, CS336 as inference arithmetic; they describe one constraint, and the practical upshot is that prompt decisions are cost decisions.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/agents/concepts/deep-agents">Deep Agents</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/agents/concepts/context-engineering">Context Engineering</a></li><li><a href="/inference/concepts/prompt-caching">Prompt Caching</a></li><li><a href="/inference/concepts/context-caching">Context Caching</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/agents/concepts/ai-agents">AI Agents</a></li><li><a href="/agents/concepts/deep-agents">Deep Agents</a></li><li><a href="/llm-fundamentals/concepts/self-attention">Self-Attention Mechanism</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/agents/sources/source-effective-context-engineering-for-ai-agents">Effective Context Engineering for AI Agents</a></li><li><a href="/agents/sources/source-context-engineering-for-agents-langchain">Context Engineering for Agents</a></li><li><a href="/inference/sources/source-cs336-lecture10-inference">CS336 Lecture 10 — Inference: Systems for Fast Autoregressive Generation (Percy Liang, Wed Apr 29)</a></li><li><a href="/inference/sources/source-prompt-caching">Prompt caching — Anthropic Claude Platform</a></li><li><a href="/agents/sources/source-promptingguide-guides-context-engineering-guide">Context Engineering Guide — Prompt Engineering Guide (DAIR.AI)</a></li><li><a href="/agents/sources/source-building-effective-agents">Building effective agents</a></li></ul></nav>
</aside>

## Thesis

Three sources in this vault describe context engineering and appear to be doing different
things. Anthropic argues from scarcity: attention is a finite budget and long contexts rot.
LangChain gives an operational taxonomy: write, select, compress, isolate. CS336 never uses
the phrase, and instead derives the cost of a token from memory bandwidth and KV-cache size.
**These are one constraint observed at three altitudes, and the useful consequence is that
what looks like a prompting decision is an inference-cost decision.** Anyone treating
context engineering as a writing skill is optimising the wrong quantity.

## The three framings

**Scarcity (Anthropic).** [[source-effective-context-engineering-for-ai-agents]] gives the
governing idea recorded on [[context-engineering]]: an attention budget with $n^2$ cost,
context rot as windows grow, and the instruction to assemble "the smallest high-signal set"
of tokens at the right altitude — specific enough to constrain, general enough to
generalise. Its long-horizon triad is compaction, structured note-taking, and sub-agents.

**Operations (LangChain).** [[source-context-engineering-for-agents-langchain]] supplies the
four verbs — write, select, compress, isolate — and maps each to a concrete mechanism:
scratchpads and checkpoints, retrieval over tools, auto-compaction and pruning, sandboxes
and sub-agent isolation. It quantifies why isolation matters, reporting a 15× cost effect on
that page. This is the same problem stated as a set of moves rather than a principle.

**Arithmetic (CS336).** [[source-cs336-lecture10-inference]] explains *why* the budget is
finite and why the moves cost what they cost: decoding is memory-bandwidth bound, the KV
cache grows linearly in sequence length and dominates memory at long context, and
arithmetic intensity — not FLOPs — determines throughput. The $n^2$ in Anthropic's framing
and the 15× in LangChain's both bottom out here.

## Why the third layer changes the advice

Read only the first two and you will conclude that context should be short because models
get confused. Read the third and a sharper rule appears: **context is expensive in a
specific, asymmetric way, and the asymmetry is exploitable.**

- **Prefix position is not neutral.** [[source-prompt-caching]] makes cache reuse depend on
  an exact prefix match, with reads walking back over a bounded window of breakpoints. So
  the stable parts of a context belong at the front and the volatile parts at the back —
  a *layout* decision with an order-of-magnitude price attached (that page records Opus
  going from \$5 to \$0.50 per unit on a cache read). Putting today's date near the top of a
  system prompt invalidates the cache on every new day.
- **Compaction is not free summarisation.** It rewrites the prefix, so it discards the cache
  along with the tokens. Its true cost is the re-prefill, which is why the compaction
  triggers described on [[context-engineering]] fire near the limit rather than continuously.
- **Sub-agents are a memory-bandwidth trick.** A specialist that explores 10k tokens and
  returns 1–2k keeps the orchestrator's KV cache small. LangChain's 15× and Anthropic's
  triad are describing the same mechanism from the outside.
- **Just-in-time retrieval beats pre-loading** for the reason [[inference]] gives, not
  merely to avoid confusion: a file path costs a handful of tokens and defers the bandwidth
  cost until the content is actually needed.

## The disagreement worth noticing

Anthropic and LangChain are complementary but not identical in emphasis, and
[[context-engineering]] records this: Anthropic argues from scarcity, treating every token
as spend; LangChain assumes you will fill the window and focuses on managing what is in it.
The scarcity view leads to smaller, more curated contexts; the operational view leads to
larger contexts with better machinery around them. [[source-building-effective-agents]]
sides with scarcity in its own way — its recommendation to prefer the simplest sufficient
pattern, and to reach for an agent only when the steps are genuinely unpredictable, is a
context-budget argument in disguise.

## What follows for reading this wiki

[[prompt-caching]] and [[context-caching]] read as vendor-feature pages and are really the
economics of the above. [[deep-agents]] and [[ai-agents]] describe architectures whose main
differentiator is how they manage context across a long run. And [[self-attention]] is where
the $n^2$ comes from — the top of this chain is joined to the bottom.

## Open questions

- Where is the crossover between compaction and sub-agent isolation? Both control context
  growth; neither source gives a rule for choosing, and the cache cost of compaction argues
  it should not be the default.
- Does "context rot" survive as a distinct phenomenon once cache economics and KV-cache
  pressure are accounted for, or is it partly a description of their symptoms? Nothing in
  this vault isolates the two.
- No source here measures retrieval quality against context length on the *same* task, so
  the trade between just-in-time retrieval and pre-loading remains argued rather than
  measured. A candidate experiment for the reading queue.

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
