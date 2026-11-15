import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/components/mockups/axiom/AxiomPrototype.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/components/mockups/axiom/AxiomProfessorWorkspace.css", import.meta.url), "utf8");

const required = [
  ["verified PROSE eligibility", /type === "PROSE" && .*quality === "verified"/s],
  ["pending_review persistence state", /pending_review/],
  ["scope threshold 80", /coverage < 80/],
  ["explicit narrower-scope confirmation", /scopeConfirmed/],
  ["30-question cap", /total > 30/],
  ["per-chapter MCQ and Essay distribution", /plan\.mcq[\s\S]*plan\.essay/],
  ["system-managed transient retry state", /failed_transient/],
  ["immutable snapshot collection", /setSnapshots\(old => \[\.\.\.old, nextSnapshot\]\)/],
  ["Student Exam artifact", /Student Exam/],
  ["Instructor Answer Key artifact", /Instructor Answer Key/],
  ["question version pinning", /question_version_id/],
];

for (const [label, pattern] of required) {
  assert.match(source, pattern, `Missing prototype contract representation: ${label}`);
}

const forbidden = [
  ["Short Answer", /Short\s+Answer/i],
  ["fabricated confidence percentage", /\b94\s*%/],
  ["unapproved Citation Confidence control", /Citation\s+Confidence/i],
  ["TXT upload format", /\bTXT\b/],
  ["automatic difficulty control", /difficulty\s*(selector|control|input)/i],
];

for (const [label, pattern] of forbidden) {
  assert.doesNotMatch(source, pattern, `Forbidden prototype control/content found: ${label}`);
}

assert.match(css, /@media\s*\(max-width:\s*850px\)/, "Tablet/mobile responsive breakpoint missing");
assert.match(css, /@media\s*\(max-width:\s*580px\)/, "Mobile composition breakpoint missing");
assert.match(css, /prefers-reduced-motion/, "Reduced-motion support missing");

process.stdout.write(`Axiom professor prototype contract checks passed (${required.length} required checks, ${forbidden.length} forbidden-content checks, 3 responsive checks).\n`);