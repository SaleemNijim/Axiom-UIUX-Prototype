# Axiom Core Exam Journey — Owner Design Reference

**Owner direction confirmed:** 2026-11-15  
**Purpose:** Preserve the product concept expressed by the four owner-provided original prototype screenshots. This document captures their visual and interaction intent so the concept survives future UI refactors and new conversations.

## Core product thesis

Axiom is not a generic AI dashboard with a few exam-related pages. Its defining experience is a guided academic exam workflow in which the professor configures a course-based request, sees what the system is doing, reviews every generated question against its source, and makes the academic decision.

The Question Review workspace is the core differentiator: Axiom proposes; the professor inspects, edits, approves or rejects. A generated question is never an approved exam question by default.

## Four-screen reference sequence

### 1. Exams list

The first reference screen is the professor's exam workspace: an exam list with a clear page heading, a create-exam action, a concise summary strip, and individual exam rows. Each row carries its title, course/scope context, question summary, lifecycle state and an obvious entry point.

Reconciliation with current decisions:
- This is a course-contextual workspace under the current Professor-Workspace-UI-Spec.
- The exam lifecycle is only `Draft → Finalized`. Do not introduce "In Review", "Ready to Export" or `Exported` as exam lifecycle states. Export is an artifact event.
- Summary values must be derived from the displayed local fixture state. No fabricated organization-wide counts or activity analytics.
- Finalized rows lead to the relevant immutable snapshot and its Student Exam / Instructor Answer Key export choices. Draft rows lead to the Draft builder.

### 2. Exam setup

The second screen shows a guided exam setup composition: course identity, requested chapter/scope, question allocation per chapter, and a compact request summary. The setup should read like a professor preparing an exam, not a chat prompt or generic form.

Required current request contract:
- Verified TOC scope or an explicit professor-selected page range.
- MCQ and Essay counts per selected chapter.
- Maximum 30 questions in aggregate.
- Standard by default; Advanced may only rearrange/reveal the same fields.
- 100% coverage proceeds; 80–99% requires explicit confirmation of the narrower effective scope; below 80% blocks before job, quota reservation or provider call.
- Provenance is mandatory; Style Profile version is pinned.
- Suggested difficulty is output, never a professor-selected request field.

### 3. Building progress

The third screen is a focused, centered stage view with a concise request summary, a calm Axiom progress motif, and a visible sequence of processing stages. It should reassure the professor that source preparation, retrieval, style application, question drafting, citation checks and review preparation are distinct steps.

Prototype-only rule:
- This screen is a visual storyboard, not a running AI task.
- Label demo progress as illustrative, not live.
- The next stage is review; the progress screen must reinforce that all questions remain pending the professor's decision.

### 4. Question Review

The fourth screen is the most important of the four. It uses a spacious three-panel workspace:
- Question navigation and per-question review status.
- The selected question, its answer choices or essay content, review/edit actions and suggested difficulty as output.
- The Source Evidence Inspector: source material and version, page, paragraph/block locator, exact cited passage, evidence type/quality where supplied, locator integrity, and source-page/passage preview where supported.

Rules:
- Question status is separate from evidence quality and citation/locator status.
- A valid locator is not proof of semantic support; do not invent a semantic verdict enum, score or threshold.
- Missing/invalid provenance, citation mismatch, ineligible evidence or invalid schema blocks approval and explains why.
- No automatic approval or confidence score bypass.
- Editing creates a new immutable question version and returns the new version to review.
- On tablet/mobile, use drawers or stacked readable panes; do not shrink three desktop panels into unusable columns.

## End-to-end journey

`Exams → Exam Setup → Building Progress → Question Review → Approved Questions → Exam Builder → Finalize Snapshot → Student Exam / Instructor Answer Key`

Question Review remains a separate professor-controlled gate before a question may be selected in the Exam Builder. The Builder composes approved versions; it does not edit question content.

## Authority and conflict handling

This document is a visual/interaction reference, not a second UX specification and not a new product decision.

When in doubt, follow:
1. `DOCS_ROOT/04-DESIGN/Professor-Workspace-UI-Spec.md`
2. Accepted ADR-034…ADR-041
3. M6 Exam Generation, M7 Review/Approval and M8 Finalization/Export contracts
4. `.conversation/AXIOM-UI-PROTOTYPE-PROMPT.md`

The historical original prompt is preserved at `.conversation/attached_assets/Pasted--Axiom-UI-UX-DESIGN-PROTOTYPE-ONLY-You-are-a-senior-pro_1791317650026.txt` for provenance only. It is not current operating authority. Do not restore stale fields and examples such as Short Answer, professor-selected difficulty, fixed 94% Citation Confidence, TXT uploads, arbitrary toggles, or unsupported actions.

## Prototype boundaries

This journey is shown with clearly labelled local demo fixtures. It does not implement backend services, authentication, real uploads, AI generation, OCR, quotas, authorization or real PDF/DOCX output. Prototype work does not authorize or advance production execution state; the active production card and approval process remain governed by the Axiom execution documents.
