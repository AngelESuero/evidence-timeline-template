import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const timelineDir = path.join(root, "data", "timelines");
const proposalDir = path.join(root, "data", "proposals");
const allowedPrecision = new Set(["day", "month", "year", "range", "estimated"]);
const allowedEvidence = new Set(["verified", "proposed", "disputed", "incomplete"]);
const allowedConfidence = new Set(["high", "medium", "low"]);
const allowedSourceTypes = new Set(["primary", "official_interpretive", "reporting", "commentary", "personal_archive"]);
const datePattern = /^\d{4}(-\d{2})?(-\d{2})?$/;
const idPattern = /^[a-z0-9-]+$/;

function requireValue(errors, value, label) {
  if (typeof value !== "string" || value.trim() === "") errors.push(`${label} must be a non-empty string`);
}

function validateEvent(event, label) {
  const errors = [];
    requireValue(errors, event.id, `${label}.id`);
    if (!idPattern.test(event.id ?? "")) errors.push(`${label}.id must use lowercase letters, numbers, and hyphens`);
    if (!datePattern.test(event.date ?? "")) errors.push(`${label}.date must be YYYY, YYYY-MM, or YYYY-MM-DD`);
    if (!allowedPrecision.has(event.date_precision)) errors.push(`${label}.date_precision is invalid`);
    requireValue(errors, event.title, `${label}.title`);
    requireValue(errors, event.summary, `${label}.summary`);
    if (!allowedEvidence.has(event.evidence_status)) errors.push(`${label}.evidence_status is invalid`);
    if (!allowedConfidence.has(event.confidence)) errors.push(`${label}.confidence is invalid`);
    if (!Array.isArray(event.sources) || event.sources.length === 0) {
      errors.push(`${label}.sources must contain at least one source`);
    } else {
      for (const [sourceIndex, source] of event.sources.entries()) {
        const sourceLabel = `${label}.sources[${sourceIndex}]`;
        requireValue(errors, source.url, `${sourceLabel}.url`);
        requireValue(errors, source.title, `${sourceLabel}.title`);
        requireValue(errors, source.publisher, `${sourceLabel}.publisher`);
        if (!allowedSourceTypes.has(source.type)) errors.push(`${sourceLabel}.type is invalid`);
        if (!datePattern.test(source.accessed ?? "")) errors.push(`${sourceLabel}.accessed must be a date`);
        try { new URL(source.url); } catch { errors.push(`${sourceLabel}.url must be an absolute URL`); }
      }
    }
  return errors;
}

function validateTimeline(timeline, filename) {
  const errors = [];
  requireValue(errors, timeline.id, `${filename}: id`);
  requireValue(errors, timeline.title, `${filename}: title`);
  requireValue(errors, timeline.description, `${filename}: description`);
  if (!datePattern.test(timeline.updated ?? "")) errors.push(`${filename}: updated must be a date`);
  if (!Array.isArray(timeline.events)) errors.push(`${filename}: events must be an array`);
  if (!Array.isArray(timeline.events)) return errors;

  const ids = new Set();
  for (const [index, event] of timeline.events.entries()) {
    const label = `${filename}: events[${index}]`;
    errors.push(...validateEvent(event, label));
    if (ids.has(event.id)) errors.push(`${label}.id duplicates ${event.id}`);
    ids.add(event.id);
    if (event.evidence_status === "proposed") errors.push(`${label}.evidence_status must leave the proposal queue before publication`);
  }
  return errors;
}

function validateProposal(proposal, filename) {
  const errors = [];
  requireValue(errors, proposal.proposal_id, `${filename}: proposal_id`);
  requireValue(errors, proposal.target_timeline, `${filename}: target_timeline`);
  if (!["needs_review", "approved", "rejected"].includes(proposal.review_status)) {
    errors.push(`${filename}: review_status is invalid`);
  }
  if (!proposal.candidate_event || typeof proposal.candidate_event !== "object") {
    errors.push(`${filename}: candidate_event must be an object`);
    return errors;
  }
  errors.push(...validateEvent(proposal.candidate_event, `${filename}: candidate_event`));
  if (proposal.candidate_event.evidence_status !== "proposed") {
    errors.push(`${filename}: candidate_event.evidence_status must remain proposed while queued`);
  }
  if (!Array.isArray(proposal.review_notes)) errors.push(`${filename}: review_notes must be an array`);
  return errors;
}

const filenames = (await readdir(timelineDir)).filter((name) => name.endsWith(".json")).sort();
const proposalFilenames = (await readdir(proposalDir))
  .filter((name) => name.endsWith(".json") && !name.endsWith(".template.json"))
  .sort();
const errors = [];
for (const filename of filenames) {
  const timeline = JSON.parse(await readFile(path.join(timelineDir, filename), "utf8"));
  errors.push(...validateTimeline(timeline, filename));
}
for (const filename of proposalFilenames) {
  const proposal = JSON.parse(await readFile(path.join(proposalDir, filename), "utf8"));
  errors.push(...validateProposal(proposal, filename));
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${filenames.length} timeline file(s) and ${proposalFilenames.length} queued proposal(s).`);
