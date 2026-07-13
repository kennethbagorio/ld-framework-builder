#!/usr/bin/env bash
# Creates a clean, meaningful commit history (7 commits) under YOUR git identity.
#
# Before running, set your identity once (use your GitHub email):
#   git config --global user.name  "Your Name"
#   git config --global user.email "you@example.com"
#
# Then run:  bash setup-git.sh
set -e

git init -q
git branch -M main

git add package.json tsconfig.json next.config.mjs tailwind.config.js postcss.config.js .gitignore .eslintrc.json
git commit -q -m "chore: scaffold Next.js 14 + TypeScript + Tailwind project"

git add lib/llm.ts lib/json.ts
git commit -q -m "feat: add provider-agnostic LLM layer and shared JSON helper"

git add lib/bars app/api/bars tests/bars-validation.test.ts tests/bars-prompt.test.ts tests/bars-parse.test.ts vitest.config.ts
git commit -q -m "feat: add Competency BARS tool (validation, prompt, parse, route) with tests"

git add lib/objectives app/api/objectives tests/objectives-validation.test.ts tests/objectives-prompt.test.ts
git commit -q -m "feat: add Objectives & Micro-Assessment tool with tests"

git add app/layout.tsx app/page.tsx app/globals.css
git commit -q -m "feat: build two-mode UI with tab switcher and copy-to-Markdown"

git add .github .env.example
git commit -q -m "ci: add GitHub Actions pipeline (install, test, build) and env example"

git add README.md spec.md CLAUDE.md .cursorrules docs setup-git.sh
git commit -q -m "docs: add README, spec, architecture notes, and AI-assistant config"

echo ""
echo "Done. Commit history:"
git log --oneline
echo ""
echo "Next: create an EMPTY public repo on GitHub, then run:"
echo "  git remote add origin https://github.com/<your-username>/ld-framework-builder.git"
echo "  git push -u origin main"
