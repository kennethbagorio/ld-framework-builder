# Product Requirements Document (PRD) — L&D Framework Builder

_One-page PRD. Six components: Problem, Users, Goals & Metrics, Features &
Acceptance Criteria, Scope, Technical Approach._

## 1. Problem Statement

L&D teams spend hours hand-writing two things: Behaviourally Anchored Rating
Scales for competency matrices, and SMART learning objectives with aligned
assessments for training. Both are slow and inconsistently worded, and no
lightweight tool generates this structured content on demand.

## 2. Target Users & Use Case

- **Primary:** L&D / Capability specialists and instructional designers.
- **Secondary:** people managers and HRBPs needing consistent rating language.
- **Use cases:** "Give me a clean, level-by-level rating scale for this
  competency," and "Give me SMART objectives plus a short quiz for this topic."

## 3. Goals & Success Metrics

- **G1 – Speed:** produce a full result for either tool in under ~15 seconds.
  *Metric:* median generation time.
- **G2 – Usability:** a first-time user completes either tool without
  instructions. *Metric:* first-attempt task completion in the demo.
- **G3 – Quality:** anchors are observable; objectives use measurable verbs;
  questions map to objectives. *Metric:* reviewer spot-check pass rate.
- **G4 – Reliability:** valid input always returns well-formed output.
  *Metric:* CI green (28 tests + build); no schema-parse failures on demo inputs.

## 4. Features & Acceptance Criteria

| # | Feature | Acceptance Criteria (testable) |
|---|---------|--------------------------------|
| F1 | Tool switcher | Tabs toggle between the BARS tool and the Objectives tool; each keeps its own inputs and results. |
| F2 | BARS generation | A competency ≥ 2 chars with *N* levels returns exactly *N* levels, each with 1–3 observable anchors. |
| F3 | Objectives + assessment | A topic ≥ 2 chars returns the requested number of SMART objectives (with Bloom level) and MCQs; each question has ≥ 2 options and a valid answer index. |
| F4 | Input validation | Empty/short required input shows an inline error and makes **no** API call. |
| F5 | Structured results UI | BARS renders as ordered level cards; objectives render as a numbered list + assessment with the correct option highlighted. |
| F6 | Copy as Markdown | Each tool copies a Markdown version of its result to the clipboard. |
| F7 | Graceful errors | Provider/parse failure returns HTTP 500 with a safe message; details logged server-side only. |
| F8 | Secret safety | No API key value appears in any client response or the JS bundle. |

## 5. Scope / Non-Goals

**In scope (MVP):** two generators, adjustable counts, optional context inputs,
copy-to-Markdown, stateless requests.
**Out of scope (v2):** user accounts/auth, saving history, in-app editing,
exporting a whole matrix or full course at once, multi-language output.

## 6. Technical Approach & AI Capability

- **AI capability:** structured **generation** via Anthropic Claude or OpenAI
  (runtime-selected by which key is set).
- **Stack:** Next.js 14 (App Router) + TypeScript, Tailwind CSS.
- **Flow:** UI → `POST /api/{bars|objectives}` → validate → build prompt → LLM
  call → parse JSON → render. Pure logic (validation/prompt/parse) is unit-tested
  per tool.
- **Ops:** GitHub Actions CI (install → test → build); deployed on Vercel;
  secrets stored as environment variables, never committed.
