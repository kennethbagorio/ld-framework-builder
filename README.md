# L&D Framework Builder

An AI-powered web app called L&D Framework Builder for Learning and Development and Capability Building Teams. Runs through identifying Competency Behaviorally-Anchored Rating Scale if you enter a learning competency or skill, and learning objectives identifier and a micro-assessment generator if you enter a training topic.

1. **Competency BARS** — turn a competency into a Behaviourally Anchored Rating
   Scale (observable behavioural statements for each proficiency level).
2. **Objectives & Assessment** — turn a training topic into SMART learning
   objectives (tagged with Bloom's levels) plus an aligned multiple-choice
   micro-assessment.

---

## What it does

Pick a tool with the tab switcher, fill in a short form, and get structured,
copy-ready output in seconds, no more hand-writing rating scales or objectives
from scratch. Each result can be copied as Markdown straight into your matrix,
LMS, or course outline.

## How it works

The browser sends a request to an API route. The route validates the input,
builds a prompt, calls the model, and parses the JSON response before sending it
back. The AI-independent logic (validation, prompt building, parsing) is kept in
small pure functions so it can be unit-tested without calling the model.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **AI:** Anthropic Claude *or* OpenAI (auto-selected by which key you set)
- **Vitest** for unit tests
- **GitHub Actions** for CI, **Vercel** for hosting

## Project structure

```
app/
  page.tsx                    UI: tab switcher + both tools
  api/bars/route.ts           BARS endpoint
  api/objectives/route.ts     objectives + assessment endpoint
lib/
  llm.ts                      provider-agnostic LLM caller (only file that hits network)
  json.ts                     shared JSON extraction helper
  bars/                       validation + prompt + parse (BARS)
  objectives/                 validation + prompt + parse (objectives)
tests/                        Vitest unit tests for both tools
.github/workflows/ci.yml      CI: install -> test -> build
spec.md                       spec + architecture notes
CLAUDE.md, .cursorrules       AI-assistant config
docs/                         idea validation, PRD, reflection
```

## Run locally

```bash
npm install
cp .env.example .env.local     # then paste your API key into .env.local
npm run dev                    # http://localhost:3000
```

Set your key in `.env.local`. If your key comes from the **Vocareum gateway**
(starts with `voc-`), you also need the gateway base URL:

```
OPENAI_API_KEY=voc-...
OPENAI_BASE_URL=https://openai.vocareum.com/v1
```

With a standard OpenAI key (`sk-...`), omit `OPENAI_BASE_URL`. An Anthropic key
(`ANTHROPIC_API_KEY=sk-ant-...`) works too. See `.env.example` for all options.

> `.env.local` is git-ignored — never commit your real key.

## Tests

```bash
npm test
```

Unit tests cover input validation, prompt building, and response parsing for
**both** tools (28 tests).

## Deploy (Vercel)

1. Push this repo to GitHub (public).
2. In Vercel: **New Project → Import** your repo.
3. Under **Environment Variables**, add your `OPENAI_API_KEY` (or
   `ANTHROPIC_API_KEY`). If using a Vocareum `voc-` key, also add
   `OPENAI_BASE_URL=https://openai.vocareum.com/v1`. Optionally add `MODEL`.
4. Deploy. Vercel gives you a live URL. Enable the **Analytics** tab for basic
   monitoring.

Every push to `main` runs the GitHub Actions CI pipeline (install → test →
build). Vercel redeploys automatically on push.

## Security

- API keys are read from environment variables at request time only.
- All LLM calls are server-side, so the key is never sent to the browser.
- Input is validated before any model call.

## License

MIT — for educational use.
