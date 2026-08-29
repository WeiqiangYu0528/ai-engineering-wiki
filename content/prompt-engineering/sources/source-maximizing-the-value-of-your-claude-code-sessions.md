---
type: source-summary
title: "Maximizing the value of your Claude Code sessions"
summary: A comprehensive engineering guide by Lydia Hallie from Anthropic on optimizing agentic coding sessions in Claude Code.
status: draft
visibility: public
author: "Lydia Hallie (Anthropic)"
source-type: article
url: "https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions"
date-published: 2026-08-14
date-ingested: 2026-08-23
tags:
  - prompt-engineering
  - agents
  - inference
  - mlops
key-concepts:
  - "[[claude-code]]"
  - "[[prompt-engineering]]"
  - "[[inference]]"
  - "[[tool-use]]"
key-entities:
  - "[[anthropic]]"
aliases:
  - wiki/source-maximizing-the-value-of-your-claude-code-sessions
---

<aside class="kb-header kb-type-source-summary" aria-label="Page information">
<p class="kb-type">Reading note</p>
<p class="kb-summary">A comprehensive engineering guide by Lydia Hallie from Anthropic on optimizing agentic coding sessions in Claude Code.</p>
<p class="kb-provenance">Lydia Hallie (Anthropic), 2026-08-14. <a href="https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions">Original source</a></p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
</aside>

## Summary

> [!WARNING] Correction — figures not found in the stored source
> 1 of 2 figures on this page were not found in [https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions](https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions): `10%`. They may be correct — slide charts and images are invisible to text extraction, and some figures are derived rather than quoted — but this page's own source does not evidence them. Checked 2026-08-27 by `tools/verify_sources.py`.

A comprehensive engineering guide by Lydia Hallie from [[anthropic]] on optimizing agentic coding sessions in **Claude Code**. The article breaks down the economics of token consumption, GPU inference costs, **prompt caching mechanics**, and practical context engineering techniques (such as subagent delegation, `@-mention` file attachments, and context compaction) to minimize unnecessary token expenditures and maximize coding session throughput.

## Key Takeaways
1. **Inference Economics & Asymmetry:** Output decoding costs ~5x input prefilling because autoregressive decoding generates tokens sequentially (keeping GPUs busy per token), while prefill processes inputs in parallel.
2. **Prompt Caching Economics (0.1x Reads):** Reading from the prompt cache costs only 10% of full input pricing. Claude Code caches the prefix (tool definitions $\to$ system prompt $\to$ `CLAUDE.md` $\to$ conversation history). Appending new tool outputs to the end preserves cache hits; modifying the prefix (e.g. switching `/model`, changing `/effort`, or running `/compact`) busts the cache and forces full-price re-prefills.
3. **Context Accumulation Over Turns:** Every file read and bash command output is sent on every subsequent turn. One 40-turn session costs substantially more than the same work split across multiple clean sessions.
4. **Subagent Context Isolation:** Offloading high-output, noisy tasks (such as grepping logs or large test suite runs) to subagents keeps the main conversation context pristine, returning only final summaries.
5. **Practical Context Optimization Rules:**
   - Run `/clear` between distinct tasks.
   - Use `@-mention` syntax (e.g. `@utils.test.ts`) to attach files directly in prompt 1, eliminating a tool `Read` roundtrip.
   - Configure quiet flags in `CLAUDE.md` (e.g. `vitest run --reporter=dot`) and set output bounds (`BASH_MAX_OUTPUT_LENGTH`).
   - Use `/rewind` instead of `/compact` when undoing recent turns to preserve existing prompt cache state.

## Detailed Notes

### The 4 Major Levers of Agent Efficiency
```
1. Model & Effort Selection  ──► Set upfront; avoid mid-session cache busting
2. Prompt Cache Management  ──► Preserve cached prefix; 90% cheaper input tokens
3. Context Footprint        ──► @-mention files, quiet test reporters, /clear & /compact
4. Subagent Delegation      ──► Isolate noisy log/test exploration in lightweight models (Haiku)
```

## Notable Quotes

> [!WARNING] Correction — quotation fidelity
> 1 of 2 passages in this section could not be located in the stored source ([https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions](https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions)) — under 55% of each was found verbatim. Read them as paraphrase, not quotation, until checked against the original. Flagged 2026-08-27 by `tools/verify_sources.py`.

> "Being efficient with tokens doesn't mean using fewer of them overall. It means making sure the ones you do use go towards the thing you actually asked for." — Lydia Hallie

> "Reading from the cache costs 0.1x the input price... but the cache has to match from the very start of the request forward. If anything in that prefix changes, everything behind it gets prefilled again." — Lydia Hallie

## Concepts Introduced or Referenced
- [[claude-code]] — Anthropic's agentic CLI tool and execution runtime.
- [[inference]] — Prefill vs. decoding phases, pricing asymmetry, and prompt caching.
- [[prompt-engineering]] — Context engineering, `@-mention` file injection, and `CLAUDE.md` rules.
- [[tool-use]] — Agent tool loop and subagent dispatch.

## Critical Assessment
- **High Practical Value:** Bridges theoretical token economics with concrete CLI practices for developers building with autonomous coding agents.
- **Universal Application:** While framed around Claude Code, the prompt caching and context degradation principles apply to all agentic coding harnesses (Cursor, Antigravity, OpenCode, Codex).

---

**Source:** Maximizing the value of your Claude Code sessions by Lydia Hallie (Anthropic) — <https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions>

This page is a summary and analysis written for a personal knowledge base. Rights in the source remain with its authors; the summary text is CC BY-SA 4.0.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
