# AI Engineering Wiki

A personal, agent-maintained wiki on language models: how they are trained, served,
prompted, evaluated and reasoned about. **[Read it as a site →](https://weiqiangyu0528.github.io/ai-engineering-wiki/)**

This repository holds generated output. It is built from a private vault of source
material and is not edited by hand.

## What this is

279 pages, of which 192 are summaries of a specific paper, lecture or article, and the
rest are concept pages, entity pages, generated maps, and three synthesis pages that
argue a position the individual pages do not:

- **Post-training lineage** — SFT, RLHF, DPO and RLVR are usually told as a succession.
  This vault's own evidence contradicts that, and the real selector is whether you have
  a verifier.
- **Scaling-law revisions** — the 4× disagreement between Kaplan and Chinchilla was a
  methodology artifact, not a fact about neural networks.
- **Context engineering** — Anthropic's scarcity framing, LangChain's operations and
  CS336's memory arithmetic are one constraint described at three altitudes.

## Read this before trusting it

Every page here was written by a language model under human direction. That is stated
plainly on the site rather than buried:

- **[What has and has not been checked](https://weiqiangyu0528.github.io/ai-engineering-wiki/trust)** —
  84 pages have had their quotations and claims checked against the stored source by a
  program. **Zero have been signed off by a human.** The trust page also lists what
  that checking does *not* establish.
- **[Attribution](https://weiqiangyu0528.github.io/ai-engineering-wiki/NOTICE)** — every
  source with its author and canonical URL.
- **[Decisions](https://weiqiangyu0528.github.io/ai-engineering-wiki/decisions)** — the
  architectural decisions behind the wiki, each recorded with its cost.
- **[Open questions](https://weiqiangyu0528.github.io/ai-engineering-wiki/open-questions)** —
  300 unresolved questions collected from across the pages.
- **[How it was built](https://weiqiangyu0528.github.io/ai-engineering-wiki/how-it-was-built)**
  and the full **[activity log](https://weiqiangyu0528.github.io/ai-engineering-wiki/log)**,
  including the mistakes.

Known content debt, stated because it changes how you should read the pages: 195
quotations are paraphrase-grade rather than verbatim, and coverage is lopsided —
prompt engineering has 30 concept pages while RAG has 4, multimodal 2 and MLOps 1.

## What is not here

The source documents themselves — papers, slide decks, book chapters, article
transcripts — are **not** published. They are third-party copyrighted material held
privately. Pages summarize and cite them; they do not reproduce them.

32 pages are withheld from this build: 24 because they reproduce too much of a source
to publish, and 8 because the stored source cannot support the page's claims.

## Layout

```
content/              the published wiki, as markdown
quartz.config.yaml    site configuration
.github/workflows/    builds with Quartz and deploys to Pages on push
```

## Licence

Original text — summaries, concept pages, analysis — is
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Quoted excerpts remain
the property of their authors and are reproduced briefly with attribution for commentary.
See [`LICENSE`](LICENSE) and [`content/NOTICE.md`](content/NOTICE.md).

Built with [Quartz](https://github.com/jackyzha0/quartz).
