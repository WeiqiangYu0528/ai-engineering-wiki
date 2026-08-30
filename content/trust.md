---
title: What has been checked
---

> Generated 2026-08-27 by `tools/build_trust.py`. Do not edit by hand.

Every page here was written by a language model reading sources that a human chose. That is a useful way to build a knowledge base and a terrible way to establish facts, so each page carries a status describing how thoroughly its claims have been checked against the source it cites.

## What the statuses mean

| Status | Pages | Meaning |
| --- | --- | --- |
| `verified` | 84 | every quantitative claim and quoted passage was located in the stored source |
| `draft` | 215 | written, claims not fully confirmed against the source |
| `unverified` | 8 | the stored source cannot support the page's claims |
| `stub` | 1 | placeholder, needs content |

Total pages: **308**. Human sign-off so far: **0**.

## How the checking works

Two things are checked mechanically, per page, against the stored copy of the source it cites:

- **Figures.** Every percentage, parameter count, token count and benchmark score is searched for in the source, allowing for notation differences (`8,192` vs `8192`, `9.2T` vs `9.2 trillion`, `512×512` vs `512 x 512`). **1464 of 1582** (92.5%) were found.
- **Quotations.** Every quoted passage is graded on how much of it appears verbatim. Of **595** quoted passages, **372** are verbatim, **28** carry minor edits, and **195** are paraphrase presented as quotation. Pages in that last group carry a visible correction notice.

## What this does not tell you

- A figure that appears in the source is not necessarily *used correctly* by the page. Mechanical checking finds fabrication and drift, not misinterpretation.
- Sources that present numbers in charts or slide images cannot be checked this way; text extraction does not see them. Affected figures are listed on the page rather than silently accepted.
- 8 pages cite a source whose stored text is too thin to support anything. They are marked `unverified` and say so.
- Reasoning, synthesis and emphasis are the model's. Only the checkable parts have been checked.

## Stored source quality

| Extraction | Sources | Meaning |
| --- | --- | --- |
| `full` | 135 | substantial text, no navigation chrome |
| `partial` | 49 | usable but thin, or mixed with page furniture |
| `failed` | 8 | placeholder or stub; cannot evidence a claim |

Reproduce all of this with `make audit`. The tooling is in `tools/`.
