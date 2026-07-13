# Idea Validation Report — L&D Framework Builder

> Framework: 7-step AI-first idea validation. Evidence is grounded in the
> author's direct experience in an L&D / capability function.
> _Personalise the bracketed prompts with your own specifics before submitting._

## Step 1 — Problem Identification

Two of the most repetitive expert-writing tasks in Learning & Development are
(a) writing **Behaviourally Anchored Rating Scales (BARS)** for competency
frameworks — observable descriptions of what "good" looks like at each level —
and (b) writing **SMART learning objectives and aligned assessment questions**
for training. Both are done by hand today, both are slow, and both suffer from
inconsistent wording (vague adjectives in anchors; "understand/know" verbs in
objectives that aren't measurable). Across a whole matrix or curriculum this is
hours of drafting and re-drafting.

## Step 2 — Target User

**Primary user:** L&D / Capability specialists and instructional designers who
build competency matrices and design training (for example, someone migrating a
2023 framework to a 2026 model and standing up training for a new hub team).
**Secondary user:** people managers and HRBPs who need consistent rating
language and quick assessments. These users have subject-matter knowledge but
limited time and no lightweight, purpose-built tooling for either task.

## Step 3 — Market / Demand Evidence

- Competency frameworks/BARS and SMART objectives with assessments are standard,
  widely-taught practices used across most mid-to-large organisations.
- Existing tooling is either heavyweight enterprise talent/LMS suites or manual
  Word/Excel templates — neither helps write the *content* (the anchors, the
  objectives, the questions) itself.
- _[Add your own evidence: how long your last matrix or course outline took to
  write; number of competencies in your current migration; internal requests to
  standardise rating language or speed up course design.]_

## Step 4 — Existing Solutions & Gaps

- **Manual templates (Excel/Word):** flexible but slow; every anchor, objective,
  and question is written from scratch with no consistency check.
- **Enterprise talent/LMS suites:** costly and heavy to configure, and still
  expect you to supply the wording.
- **Generic AI chatbots:** can help if you already know how to prompt them, but
  return unstructured prose, no fixed schema, and no guardrails against vague
  anchors or non-measurable objective verbs.
- **Gap:** a focused tool that produces *structured, consistent, copy-ready*
  BARS and objectives+assessments on demand.

## Step 5 — Differentiation (Unique Angle)

This is **not a generic chatbot wrapper**. Domain value is built in: system
prompts enforce observable anchors and measurable Bloom's-taxonomy verbs; output
is a fixed JSON schema rendered as clean cards; the two tools share one pipeline;
and everything is copy-ready for a matrix or an LMS in seconds — structure a
chatbot does not guarantee.

## Step 6 — Feasibility (Technical + AI Fit)

- **AI fit:** high. Both tasks are constrained, structured text-generation — a
  strong fit for current LLMs.
- **Technical feasibility:** high and cheap. One Next.js app, two thin API
  routes, one LLM call each — no database or auth for the MVP. Deployable on
  Vercel's free tier within a day.
- **Risk & mitigation:** model output can drift from the schema → strict
  JSON instruction plus defensive parsing (`lib/*/parse.ts`). Content needs human
  review → the UI states this explicitly.

## Step 7 — Why Now

- Organisations are actively updating competency frameworks and standing up
  training for new/hub teams, so demand for faster BARS and course design is
  immediate.
- LLMs are now good enough — and cheap enough — to produce high-quality,
  structured L&D content reliably, which was not practical a couple of years ago.
- AI adoption in L&D is a current organisational priority, making a
  purpose-built AI tool timely and easy to justify.
