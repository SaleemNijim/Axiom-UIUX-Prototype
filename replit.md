# Axiom UI/UX Prototype

This repository is a design and interaction prototype workspace for Axiom. The professor-facing mockup lives in `artifacts/mockup-sandbox/`. It is **not** the Axiom production application.

## Source of truth

- Professor UX: `DOCS_ROOT/04-DESIGN/Professor-Workspace-UI-Spec.md`
- Accepted decisions: ADR-034 through ADR-041
- Generation/review/exam contracts: M6, M7 and M8
- Prototype work instructions: `.conversation/AXIOM-UI-PROTOTYPE-PROMPT.md`

The current prompt replaces its previous single-`index.html` and pre-ADR-035…041 instructions. Follow the current prompt and source documents; archived reconciliation notes are historical only.

## Run locally

Use Node.js 22+ and pnpm 10. The mockup Vite configuration requires `PORT` and `BASE_PATH`.

PowerShell:

```powershell
pnpm install --frozen-lockfile
$env:PORT = "5000"
$env:BASE_PATH = "/"
pnpm --filter @workspace/mockup-sandbox run dev
```

Bash:

```bash
pnpm install --frozen-lockfile
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/mockup-sandbox run dev
```

## Checks

```bash
pnpm --filter @workspace/mockup-sandbox run typecheck
node artifacts/mockup-sandbox/scripts/check-contract.mjs
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/mockup-sandbox run build
```

## Where the professor prototype lives

- Main screen component: `artifacts/mockup-sandbox/src/components/mockups/axiom/AxiomPrototype.tsx`
- Professor prototype styles: `artifacts/mockup-sandbox/src/components/mockups/axiom/AxiomProfessorWorkspace.css`
- Existing preview module registry: `artifacts/mockup-sandbox/src/.generated/mockup-components.ts`

## Non-negotiable boundaries

- Preserve the existing React/Vite mockup workspace; do not replace it with a standalone HTML file or a second professor app.
- Use static/demo data and local-only interactions. Do not add production APIs, database, auth, uploads, AI calls, OCR, quota settlement, or real export generation.
- Do not add Short Answer, professor difficulty input, citations-off switches, fake confidence values, or an instructor Retry control after terminal generation failure.
- Keep SuperAdmin separate. Do not modify frozen architecture documents, accepted ADRs, Roadmap, milestones, production agents/prompts, or execution-state files as part of prototype UX work.
- Production application implementation remains unauthorized until the owner explicitly authorizes M0-P1.
