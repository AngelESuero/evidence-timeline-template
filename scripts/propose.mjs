import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const proposalDir = path.join(root, "data", "proposals");
const idPattern = /^[a-z0-9-]+$/;
const datePattern = /^\d{4}(-\d{2})?(-\d{2})?$/;
const allowedPrecision = new Set(["day", "month", "year", "range", "estimated"]);
const allowedSourceTypes = new Set(["official_announcement", "official_research", "official_system_card", "official_product_documentation", "official_legal_or_policy_document", "frontier_voice_post", "frontier_voice_talk", "external_reporting", "independent_research", "public_commentary", "personal_archive"]);

function parseArgs(values) {
  const result = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    const value = values[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error("Arguments must use --key value pairs.");
    }
    result[key.slice(2)] = value;
  }
  return result;
}

function requireArg(args, name) {
  const value = args[name];
  if (!value?.trim()) throw new Error(`Missing required argument: --${name}`);
  return value.trim();
}

const args = parseArgs(process.argv.slice(2));
const proposalId = requireArg(args, "proposal-id");
const targetTimeline = requireArg(args, "target-timeline");
const eventId = requireArg(args, "event-id");
const date = requireArg(args, "date");
const datePrecision = requireArg(args, "date-precision");
const title = requireArg(args, "title");
const summary = requireArg(args, "summary");
const sourceUrl = requireArg(args, "source-url");
const sourceTitle = requireArg(args, "source-title");
const sourcePublisher = requireArg(args, "source-publisher");
const sourceType = requireArg(args, "source-type");
const accessed = requireArg(args, "accessed");
const archiveStatus = requireArg(args, "archive-status");

if (!idPattern.test(proposalId)) throw new Error("--proposal-id must use lowercase letters, numbers, and hyphens.");
if (!idPattern.test(targetTimeline)) throw new Error("--target-timeline must use lowercase letters, numbers, and hyphens.");
if (!idPattern.test(eventId)) throw new Error("--event-id must use lowercase letters, numbers, and hyphens.");
if (!datePattern.test(date)) throw new Error("--date must be YYYY, YYYY-MM, or YYYY-MM-DD.");
if (!datePattern.test(accessed)) throw new Error("--accessed must be YYYY, YYYY-MM, or YYYY-MM-DD.");
if (!allowedPrecision.has(datePrecision)) throw new Error("--date-precision is invalid.");
if (!allowedSourceTypes.has(sourceType)) throw new Error("--source-type is invalid.");
if (!["live", "archived", "missing", "context_dependent"].includes(archiveStatus)) throw new Error("--archive-status is invalid.");
try { new URL(sourceUrl); } catch { throw new Error("--source-url must be an absolute URL."); }

const proposal = {
  proposal_id: proposalId,
  target_timeline: targetTimeline,
  review_status: "needs_review",
  candidate_event: {
    id: eventId,
    date,
    date_precision: datePrecision,
    title,
    summary,
    sources: [
      {
        url: sourceUrl,
        title: sourceTitle,
        publisher: sourcePublisher,
        type: sourceType,
        accessed,
        archive_status: archiveStatus,
        ...(args["source-note"] ? { note: args["source-note"] } : {})
      }
    ],
    evidence_status: "proposed",
    confidence: args.confidence ?? "low",
    interpretation: args.interpretation ?? "",
    disputes: [],
    related_events: []
  },
  review_notes: [
    args["review-note"] ?? "Confirm factual wording, source classification, and publication permission before moving this event into a public timeline."
  ]
};

await mkdir(proposalDir, { recursive: true });
const outputPath = path.join(proposalDir, `${proposalId}.json`);
await writeFile(outputPath, `${JSON.stringify(proposal, null, 2)}\n`, { flag: "wx" });
console.log(`Staged ${path.relative(root, outputPath)} for review.`);
