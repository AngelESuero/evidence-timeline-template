import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const privateDir = path.join(root, "private");
const inputPath = path.join(privateDir, "x-twitter-tweets-verbatim.json");
const outputPath = path.join(privateDir, "x-twitter-idea-ledger.json");
const reportPath = path.join(privateDir, "x-twitter-idea-ledger-summary.md");

const records = JSON.parse(await readFile(inputPath, "utf8"));

const themes = [
  ["inspectable_truth", /\b(truth|fact|source|timeline|half truths|accuracy|summarize|organize|organized|understandable)\b/i],
  ["context_preserving_interfaces", /\b(context|parallel|cross section|folder|canvas|docs|pages|ui|ux|design|visual|readability|shareability|grid|reels)\b/i],
  ["interoperable_tools", /\b(integrat|api|portal|switch over data|connections tab|discord|soundcloud|google photos|send emails|tools|agents?)\b/i],
  ["human_judgment_and_safety", /\b(human life|alignment|safe|safety|deep fake|face id|touch id|terms|govern|decision|reliab)\b/i],
  ["transition_and_public_response", /\b(post labor|unemployment|ubi|automation|taxing the ai companies|grace periods|labor rights|government|public|society)\b/i],
  ["embodied_everyday_ai", /\b(device|wear|local|robot|robotics|notepad|hardware|screen|everyday|google photos|voice mode)\b/i],
  ["creative_process_and_access", /\b(artist|music|creative|creation|livestream|process|culture|performance|writing|media)\b/i],
  ["wellbeing_and_meaning", /\b(meditat|health|wellbeing|stillness|wholeness|happiness|purpose|life|awareness|conscious)\b/i]
];

const shortReaction = /^(?:[.?!…\s]|yes|yeah|yuh|hm|huh|what|why|oof|woah|dope|fire|goat(?:ed)?|cute|makes sense|smart|spoiler|agreed|goals|doubt|chill+|less? goo+|aw yeah|phew|lmao|ayoo+|👀+|🙏🏼?|🫰)+$/iu;

function classify(record) {
  const body = record.body_verbatim.trim();
  const matchedThemes = themes.filter(([, pattern]) => pattern.test(body)).map(([name]) => name);
  const requiresContext = body.length < 42 || shortReaction.test(body.replace(/https:\/\/t\.co\/[A-Za-z0-9]+/g, "").trim());
  const timelineRelevant = matchedThemes.some((theme) => [
    "inspectable_truth",
    "context_preserving_interfaces",
    "interoperable_tools",
    "human_judgment_and_safety",
    "transition_and_public_response",
    "embodied_everyday_ai"
  ].includes(theme));

  let interpretation = "Contextual archive record retained for completeness.";
  if (requiresContext) {
    interpretation = "Linked-post or conversational context is required before assigning a substantive interpretation.";
  } else if (matchedThemes.length) {
    interpretation = `Expresses or tests ideas related to ${matchedThemes.join(", ").replaceAll("_", " ")}.`;
  }

  return {
    id: record.id,
    original_id: record.original_id,
    date_label: record.date_label,
    body_verbatim: record.body_verbatim,
    links: record.links,
    edited_variant: record.edited_variant,
    interpretation,
    themes: matchedThemes,
    timeline_relevance: timelineRelevant ? "candidate" : "context",
    review_state: requiresContext ? "linked_context_required" : "interpreted_from_verbatim",
    public_use: "private_review_only"
  };
}

const ledger = records.map(classify);
const counts = (key) => Object.fromEntries(
  [...new Set(ledger.flatMap((item) => item[key]))].sort().map((name) => [
    name,
    ledger.filter((item) => item[key].includes(name)).length
  ])
);
const reviewCounts = Object.fromEntries(
  [...new Set(ledger.map((item) => item.review_state))].sort().map((name) => [
    name,
    ledger.filter((item) => item.review_state === name).length
  ])
);

const report = `# Private X Idea Ledger Summary

Source: approved Google Doc export \`X/Twitter data\`

## Coverage

- Tweet records retained verbatim: ${ledger.length}
- Records interpreted directly from verbatim text: ${reviewCounts.interpreted_from_verbatim ?? 0}
- Records requiring linked-post or conversational context: ${reviewCounts.linked_context_required ?? 0}
- Timeline-function candidates: ${ledger.filter((item) => item.timeline_relevance === "candidate").length}
- Contextual archive records: ${ledger.filter((item) => item.timeline_relevance === "context").length}

## Theme Counts

${Object.entries(counts("themes")).map(([name, count]) => `- \`${name}\`: ${count}`).join("\n")}

## Handling Rule

The ledger is private working material. It preserves each archived tweet verbatim
beside a separate interpretation layer. Short reactions and link-dependent posts
remain explicitly unresolved until their linked context is inspected.
`;

await mkdir(privateDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(ledger, null, 2)}\n`);
await writeFile(reportPath, report);
console.log(`Interpreted ${ledger.length} archive records into ${path.relative(root, outputPath)}.`);
console.log(`Wrote ${path.relative(root, reportPath)}.`);
