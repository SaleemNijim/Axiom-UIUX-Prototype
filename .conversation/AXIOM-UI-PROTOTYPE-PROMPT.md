# Axiom Professor Workspace — UI/UX Prototype Reconciliation Prompt

**Status:** Current design/prototype prompt — replaces the earlier single-`index.html` prompt and all pre-ADR-035…041 controls.

## Role and objective

Act as a senior product designer and frontend UI engineer. Improve the **existing Axiom Professor Workspace prototype** in this repository so that it faithfully demonstrates the current approved professor journey. This is a visual and interaction prototype only. It is not the Axiom production application.

Do not rebuild the repository, do not replace it with a standalone HTML file, and do not create a competing UI specification. Continue from the existing React/Vite mockup project and its current routing/preview mechanism.

## Source-of-truth order

1. `DOCS_ROOT/04-DESIGN/Professor-Workspace-UI-Spec.md` — the single main professor UX specification.
2. `DOCS_ROOT/00-CORE/appendices/ADR-034-Professor-Workspace-and-Exam-Lifecycle.md` through `ADR-041-Per-Question-Quota-Settlement.md` — accepted product/architecture decisions.
3. `DOCS_ROOT/03-PRODUCT/IMPLEMENTATION/MILESTONES/M6-Exam-Generation.md`, `M7-Review-Approval-Optimistic-Locking.md`, and `M8-Exam-Finalization-Export.md` — execution contracts.
4. `DOCS_ROOT/04-DESIGN/Axiom-UX-Engineering-Baseline.md` — design/prototype reconciliation order and sequence.
5. This prompt — implementation instructions only. It never overrides the sources above.

Treat `DOCS_ROOT/99-ARCHIVE/` as historical only. In particular, do not revive the 2026-11-12 pending status for DR-14…DR-20. If a genuine conflict or unspecified behavior appears, mark it `BLOCKED` and do not invent behavior.

## Existing repository to preserve

- The active preview app is the existing React/Vite mockup sandbox under `artifacts/mockup-sandbox/`.
- The current professor prototype entry module is `src/components/mockups/axiom/AxiomPrototype.tsx`, loaded through the existing mockup preview mechanism.
- Preserve the repository's current stack, entry points and visual identity. Reuse the current prototype rather than building a second professor app.
- Do not replace the project with `index.html` only. The actual repository is a React/Vite workspace; follow its existing conventions.

## Scope: professor journey

Implement/reconcile these stages in the order in Baseline §10:

1. **Application shell and navigation:** Global Workspace and Current Course navigation must be distinct. Global Dashboard is course-first and its primary action is Create Course. `Questions` belongs inside the current course. Include English LTR and Arabic RTL.
2. **Materials:** default data table, search, supported status filters, sorting, pagination, row details drawer and full split Material Workspace. Supported formats are PDF, DOCX and PPTX. The first end-to-end extraction slice is text-based PDF. DOCX/PPTX must not be presented as generation-ready before their format-specific test gate. OCR, Tesseract and scanned-image extraction are deferred. Do not invent material lifecycle states.
3. **Generation Wizard:** use only the current M6 request fields: requested scope/chapter, per-chapter MCQ count and Essay count, with an aggregate maximum of 30 questions. Standard is default; Advanced may only rearrange/reveal those same fields. Scope must come from a verified TOC mapping or explicit professor-selected page range. Citation/provenance requirements and the pinned Style Profile behavior are not disableable options. Difficulty is an output suggestion, not a professor-selected input.
4. **Scope coverage:** 100% proceeds with the exact requested scope; 80–99% pauses and requires explicit confirmation of the actual narrower effective scope; below 80% blocks before job creation, quota reservation or provider call. Show requested and confirmed effective scope separately. Never allow an LLM to guess missing/ambiguous TOC boundaries.
5. **Evidence eligibility:** evidence types are `PROSE`, `CODE`, `TABLE`, `MATH`; quality values are `verified`, `suspect`, `unverified`. Generation v1 retrieval uses only `PROSE` + `verified`. Show exact source/version/page/block provenance where available. Keep locator integrity separate from semantic support. Do not invent a semantic-support enum or confidence threshold.
6. **Generation results and quota:** represent each requested slot independently and show `succeeded`, `partially_succeeded`, and `failed` truthfully. Preserve valid questions persisted as `pending_review`. Only failed transient slots are eligible for bounded system-managed retry; do not add a professor Retry action. Per ADR-041, one unit settles for each valid question durably persisted as `pending_review`; failed/unused slots release; later instructor rejection does not refund a settled unit. Do not imply a per-batch price or currency amount.
7. **Question Review:** preserve the three-panel workspace: left question list/status, center question content/editor/actions, right source evidence/page/block/source preview. Keep question review state separate from evidence quality and locator integrity. No automatic approval. Edits create immutable new versions; the edited version returns to the required review path.
8. **Question version history:** show the selected question's own immutable version timeline. Never overwrite or silently rebase an older version.
9. **Exam Builder, Finalize and Export:** compose a Draft from approved questions and pin the selected `question_version_id`. Allow selection/removal, ordering, grouping and marks only as specified by the composition contract. The Builder is not a question editor. Notify when a newer approved version exists; replacement must be explicit and Draft-only. Finalize creates an immutable numbered snapshot. A later change creates a new Draft revision; prior snapshots and exports remain unchanged. Export separate Student Exam and Instructor Answer Key artifacts, each in PDF/DOCX, from the same finalized snapshot. The Student Exam contains no answers; the Answer Key requires current course-instructor authorization server-side.
10. **Dashboard, Style Profile and QA:** use only fixture-backed values. Style Profile is Capture Only in MVP: observations are not consumed to change generation and do not automatically update the profile. Provide empty/error/loading/unavailable states where applicable. Verify desktop/tablet/mobile, English LTR and Arabic RTL.

## Owner-provided core exam journey reference

The owner-provided four-screen visual reference captured on 2026-11-15 is a core product concept, not disposable legacy artwork. Its sequence must remain visible in the prototype:

1. **Exams list:** the professor's exam workspace, showing current drafts and finalized snapshots with clear course/scope context and status. Summary values must be derived from the local fixture state; mark all fixture records as illustrative. The only exam lifecycle values are Draft and Finalized; export is an artifact event, not a new exam status.
2. **Exam setup:** a guided configuration workspace that makes course, verified chapter/page scope and per-chapter MCQ/Essay allocation understandable. Keep the 30-question aggregate limit and the exact 100% / 80–99% / below-80% scope gate. No old unsupported fields.
3. **Building progress:** a focused, calm, centered progress-stage composition that communicates the journey from source preparation through retrieval, professor-style application, question drafting, citation checks and review readiness. In the prototype this is a clearly labelled visual walkthrough only; never claim it is live job progress.
4. **Question Review:** the core differentiated Axiom experience. Preserve a spacious three-panel desktop workspace with question navigation/status, selected question content and instructor decisions, and an inspectable source-evidence pane. The current UI Spec defines the semantic panel contract: question list, question/editor/actions, exact source/version/page/block/passage and source preview. On smaller screens, panels become readable stacked sections or drawers; never compress them into unreadable columns.

These four screens are a single professor workflow, not four unrelated mockups: Exams → Setup → Building → Question Review → approved questions → Exam Builder → Finalize → Student Exam / Instructor Answer Key.

The 2026-11-15 screenshots are the owner's visual anchor for composition and sequence. The current Professor-Workspace-UI-Spec and accepted ADR/M6–M8 contracts remain authoritative for fields, state, permissions, and behavior. Preserve the intent and hierarchy of the screenshots, but do not reintroduce stale controls or values from the historical prompt. The companion decision record is .conversation/AXIOM-CORE-EXAM-JOURNEY-DESIGN-REFERENCE.md.

## Explicitly prohibited or blocked

Do not introduce:

- Short Answer or unsupported question types.
- Professor-selected difficulty input.
- Citation/provenance disable switches.
- Arbitrary prompt, model, duplicate-prevention or difficulty-balancing controls.
- `TXT` as an accepted material format.
- OCR/scanned-image extraction controls.
- Fake confidence percentages such as `94%`, guessed tier labels or confidence display before the required vocabulary/calibration gate.
- A terminal professor-triggered Retry action. This remains `BLOCKED` pending an explicit owner decision; system-managed bounded transient retry is separate.
- Student accounts, exam delivery/taking routes, chat, team workspace or SuperAdmin academic-content access.
- Template gallery/editor, custom Word templates or branding editor.
- Fabricated analytics, user counts, fixed eight-question approval gates or production-looking fixture data.

ADR-035 is an internal worker/security boundary and creates no new professor UI control.

## Prototype-only interaction rule

All data is local and explicitly marked as demo/illustrative. Do not add backend, database, authentication, Supabase, API, storage, AI/provider calls, scanning, OCR, real uploads, real quota settlement or real PDF/DOCX generation. A visual button must either demonstrate a coherent local interaction or be clearly disabled/labelled as a preview. Never imply that a local interaction is a production integration.

## Quality and verification

- Keep the existing calm academic SaaS identity; prioritize readability, hierarchy, source traceability and instructor control over animation.
- Use direction-aware layout and genuinely responsive mobile composition; do not merely shrink desktop columns.
- Every visible status must map to the current spec or be explicitly a QA fixture.
- Check the current TypeScript package typecheck and Vite build; run any added contract checks. Report exactly which checks ran and their result. Do not claim browser visual QA, accessibility audit or end-to-end tests unless actually run.
- Keep changes scoped to the professor prototype and its prototype-only documentation/launch prompt. Do not modify Engineering Document v5, accepted ADRs, Roadmap, milestones, production prompts/agents, SuperAdmin prototype/spec, archive, or `EXECUTION-STATE.md/.json`.
- No change to application implementation authorization: `M0-P1` remains the only current card and requires explicit owner authorization. This prototype work does not advance production execution state.

## Working method

Inspect the current branch and source before editing. Work on a dedicated feature branch, preserve the existing prototype, and deliver a reviewable change set (prefer a PR over writing directly to `main`). Update this prompt only when an approved source decision changes. At the end, update the Axiom UX handoff with the exact branch/commit/PR, files changed, test results, blocked decisions, and one next permitted action.
