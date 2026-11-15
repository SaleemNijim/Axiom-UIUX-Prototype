# Axiom UX Prototype Handoff — 2026-11-15

## Current state

- Repository: `SaleemNijim/Axiom-UIUX-Prototype`
- `main` baseline for this corrective pass: `c9306057e156740c273fb5e5019b5044f415dd4f` (merged PR #1).
- Corrective branch: `fix/axiom-core-review-flow-2026-11-15`
- Implementation commit before this handoff record: `990c8c5a16995e9c61dd0efbf4d04ce7eeea5f29`
- Corrective PR: [#2 — restore Axiom core exam journey and evidence review UX](https://github.com/SaleemNijim/Axiom-UIUX-Prototype/pull/2)
- PR #2 is open and unmerged. GitHub reported it mergeable at the latest check.
- Latest CI observation before the handoff-record commit: `professor-prototype` was queued. Do not treat it as passing until a completed run confirms success.

## Owner's non-negotiable design direction

The four owner-provided screenshots from 2026-11-15 express the core Axiom professor journey:
1. Exams list.
2. Guided exam setup.
3. Dedicated exam-building progress view.
4. Three-panel Question Review with source provenance.

This is one coherent journey, not a generic AI dashboard. Question Review is the core product differentiator: every generated question remains under the professor's review and decision.

The durable visual/interaction record is `.conversation/AXIOM-CORE-EXAM-JOURNEY-DESIGN-REFERENCE.md`.

## Changes in PR #2

- Added a dedicated visual generation-progress stage between successful setup and result preview. It explicitly says it is illustrative, not a live background job.
- Reworked the course-contextual Exams view with state-derived summary, Draft and Finalized concepts, snapshot history and a question-review next step.
- Strengthened the Question Review navigation with search and status filters.
- Set the desktop review panels to physical left / centre / right: question list, question content and professor actions, source evidence inspector. Each panel retains Arabic RTL or English LTR content.
- Added responsive styles for the exam catalogue, progress storyboard and review workspace.
- Extended the prototype contract guard for the restored journey.
- Restored the original 16KB prompt in full with a historical-only warning. It is preserved for provenance and must not override current decisions.
- Updated the canonical prototype prompt so future design work treats the four screenshots as a core visual reference.

## Current accepted constraints that must remain intact

- Follow the current Professor-Workspace-UI-Spec, accepted ADR-034…ADR-041, and M6–M8.
- Generation v1 uses only verified PROSE evidence.
- Request fields remain verified scope/chapter/page range and per-chapter MCQ + Essay counts; maximum 30 questions.
- Coverage: 100% proceed; 80–99% requires explicit confirmation of narrower effective scope; below 80% blocks before job/reservation/provider.
- No Short Answer, professor difficulty input, fixed Citation Confidence %, TXT upload, automatic approval, or professor-triggered terminal Retry.
- Question editing creates immutable versions and returns to review.
- Builder composes approved questions and pins `question_version_id`; finalization creates immutable snapshot; export is separate Student Exam / Instructor Answer Key in PDF/DOCX preview.
- The prototype remains local fixtures only. No real backend, AI, OCR, uploads, quota settlement, authorization or document export.
- Production remains NOT_STARTED; M0-P1 is still the only current production card and this prototype work does not advance it.

## Verification boundary

The GitHub Actions workflow runs typecheck, the prototype contract guard and the Vite build. Browser visual QA, accessibility audit and end-to-end testing have not been performed or claimed in this pass. After CI completes, review the actual UI at desktop, tablet and mobile widths in the repository preview; then correct any visual regressions in this same PR before merging.

## Next permitted action

Inspect PR #2 and wait for the latest-head CI to complete. Once CI is green, perform browser visual QA against the four owner screenshots and the current UX specification. Do not merge until those checks and the owner review are complete. Do not start backend or production implementation as part of this task.
