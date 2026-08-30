---
type: synthesis
title: "Scaling Laws: Kaplan, Chinchilla, and What the Disagreement Was Really About"
summary: "Kaplan and Chinchilla disagreed by a factor of four on how to spend compute; the gap was a methodology artifact, which is the most useful thing about it."
visibility: public
status: draft
tags:
  - llm-fundamentals
  - mlops
created: 2026-08-27
updated: 2026-08-30
sources:
  - "[[source-scaling-laws-for-neural-language-models]]"
  - "[[source-training-compute-optimal-large-language-models]]"
  - "[[source-cs336-lecture09-scaling-laws]]"
  - "[[source-cs336-lecture11-scaling-laws]]"
  - "[[source-language-models-are-few-shot-learners]]"
  - "[[source-scaling-test-time-compute]]"
related:
  - "[[scaling-laws]]"
  - "[[chinchilla]]"
  - "[[gopher]]"
  - "[[pretraining]]"
  - "[[inference]]"
  - "[[evaluation]]"
aliases:
  - wiki/scaling-laws-revisions
---

<aside class="kb-header kb-type-synthesis" aria-label="Page information">
<p class="kb-type">Synthesis</p>
<p class="kb-summary">Kaplan and Chinchilla disagreed by a factor of four on how to spend compute; the gap was a methodology artifact, which is the most useful thing about it.</p>
<p class="kb-trust kb-status-draft"><a href="/trust">Draft - written, claims not checked against the source</a></p>
<p class="kb-prerequisite">Read first: <a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></p>
<nav class="kb-related" aria-label="Related concepts"><ul><li><a href="/llm-fundamentals/concepts/scaling-laws">Scaling Laws</a></li><li><a href="/llm-fundamentals/entities/chinchilla">Chinchilla</a></li><li><a href="/llm-fundamentals/entities/gopher">Gopher</a></li><li><a href="/llm-fundamentals/concepts/pretraining">Pretraining</a></li><li><a href="/inference/concepts/inference">LLM Inference</a></li><li><a href="/eval-safety/concepts/evaluation">Evaluation</a></li></ul></nav>
<nav class="kb-sources" aria-label="Sources cited"><ul><li><a href="/llm-fundamentals/sources/source-scaling-laws-for-neural-language-models">Scaling Laws for Neural Language Models</a></li><li><a href="/llm-fundamentals/sources/source-training-compute-optimal-large-language-models">Training Compute-Optimal Large Language Models (Chinchilla)</a></li><li><a href="/llm-fundamentals/sources/source-cs336-lecture09-scaling-laws">CS336 Lecture 09 — Scaling Laws: Basics (Tatsu Hashimoto, Mon Apr 27)</a></li><li><a href="/llm-fundamentals/sources/source-cs336-lecture11-scaling-laws">CS336 Lecture 11 — Scaling: Case Study and Details (Tatsu Hashimoto, Mon May 4)</a></li><li><a href="/llm-fundamentals/sources/source-language-models-are-few-shot-learners">Language Models are Few-Shot Learners</a></li><li><a href="/inference/sources/source-scaling-test-time-compute">Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters</a></li></ul></nav>
<p class="kb-nav"><a href="/catalog">All pages</a></p>
</aside>

## Thesis

Kaplan (2020) and Chinchilla (2022) fitted the same kind of law to the same kind of data
and reached materially different advice: spend new compute mostly on parameters, versus
spend it equally on parameters and tokens. The field usually records this as "Chinchilla
corrected Kaplan". **The more useful reading is that the disagreement was produced by
experimental setup, not by a property of neural networks** — and the specific artifacts are
identified on [[scaling-laws]] from the CS336 treatment. That matters because it tells you
what to distrust in *any* scaling law you are handed, including the ones being published
now.

## The disagreement, precisely

| | Kaplan et al. 2020 | Chinchilla 2022 |
| --- | --- | --- |
| Parameters vs compute | $N \propto C^{0.73}$ | $N \propto C^{0.50}$ |
| Tokens vs compute | $D \propto C^{0.27}$ | $D \propto C^{0.50}$ |
| Practical advice | grow the model | grow both, ≈20 tokens per parameter |

The empirical demonstration is [[chinchilla]] at 70B parameters and 1.4T tokens beating
[[gopher]] at 280B and 300B — a model four times smaller trained on nearly five times the
data, on the same compute budget. [[source-training-compute-optimal-large-language-models]]
established this with three independent estimation methods that agreed, which is why it
displaced the earlier advice rather than merely disputing it.

Two exponents in a table understate how consequential the difference is, because a power law
is a straight line on log-log axes and two different exponents are two different *slopes*:

![Optimal parameter count against training compute on log-log axes with decade gridlines and no absolute values. Two straight lines leave a shared anchor at low compute: Kaplan 2020 with slope 0.73, labelled "grow the model", and Chinchilla 2022 with slope 0.50, labelled "grow both, about 20 tokens per parameter". Because the exponents differ, the lines diverge as compute grows; at one budget the vertical gap is bracketed and labelled 4x, the measured Gopher versus Chinchilla case. The figure is schematic: the slopes are the published exponents but the axes are not calibrated.](/diagrams/scaling-law-exponents.svg)

Two lines from one origin is the right mental picture. The prescriptions **agree** at the
compute scales where both were fitted and diverge without limit above them, which is why the
disagreement was invisible until somebody trained at a budget far enough to the right to make
it cost 210B parameters.

## Why they diverged

Three artifacts, all recorded on [[scaling-laws]] from
[[source-cs336-lecture09-scaling-laws]] and [[source-cs336-lecture11-scaling-laws]]:

1. **A fixed learning-rate horizon.** Kaplan used a cosine schedule tuned for ~130B tokens
   across *all* runs. A short run under a schedule built for a long one is measured before
   its loss has finished falling, so small-data runs look worse than they are — which biases
   the fit against spending compute on tokens.
2. **Parameter counting.** Kaplan counted non-embedding parameters. At small scale the
   embedding matrix is a large fraction of the model, so the two conventions disagree most
   exactly where the fit is most sensitive.
3. **Warmup at small budgets.** Warmup that is a sensible fraction of a large budget is a
   large fraction of a small one, again penalising the small end of the sweep.

None of these is a discovery about scaling. All three are consequences of holding a
hyperparameter fixed while sweeping the thing it depends on. Chinchilla's methodological
fix — matching the cosine horizon to each run's token count — is the substance of the
correction.

## The lesson generalises

Read the table above as a warning rather than a result. A scaling law is a fit to a sweep,
and a sweep inherits every decision held constant across it. [[source-cs336-lecture11-scaling-laws]]
continues past Chinchilla to WSD schedules, µP for width-invariant hyperparameters, and
Muon — and each of those exists precisely to *remove* a hyperparameter that would otherwise
have to be held fixed and would therefore contaminate the next fit. µP is not a training
trick; it is a scaling-law hygiene measure.

## Compute-optimal is not cost-optimal

Chinchilla answers "what minimises training loss for a fixed training budget", which is
rarely the question a deployment asks. [[source-training-compute-optimal-large-language-models]]
notes the corollary directly: a 4× smaller model is roughly 4× cheaper to serve, and
serving costs are paid on every request rather than once. This is why frontier practice
*overtrains* past the Chinchilla point — deliberately accepting a worse training-loss
trade to get a smaller model — and why [[inference]] belongs in this conversation rather
than downstream of it.

[[source-scaling-test-time-compute]] pushes the same logic to its conclusion: compute spent
at inference can substitute for compute spent in training, with that page reporting a
regime where 4× more test-time FLOPs beats 14× more model. Once that substitution exists,
"compute-optimal" has no single meaning without also stating where you intend to spend.

## What follows for reading this wiki

Treat every exponent on [[scaling-laws]] as conditional on a setup, and check what the
setup held fixed. When [[pretraining]] cites a token budget, the interesting question is
which of training loss, serving cost, or downstream capability it was optimised for — they
disagree.

## Open questions

- Do the Kaplan artifacts fully account for the exponent gap, or only most of it? The
  vault records the diagnosis but no reconciliation experiment that isolates each cause.
- How much of Chinchilla's advantage on [[evaluation]] benchmarks (+7–10% on MMLU and
  BIG-bench per its page) is the compute allocation and how much the rebalanced training
  mixture? Those two changes are confounded in that paper.
- If µP removes hyperparameter drift across width, does a scaling law fitted under µP have
  a different exponent than one fitted without it? Not measured in these sources.

---

Original analysis, CC BY-SA 4.0. See NOTICE for source attributions.

**Status:** `draft` — Written but not fully checked against the cited source. See [[trust]] for methodology.
