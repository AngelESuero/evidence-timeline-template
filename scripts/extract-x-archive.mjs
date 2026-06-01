import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const privateDir = path.join(root, "private");
const inputPath = path.join(privateDir, "x-twitter-data-verbatim.txt");
const outputPath = path.join(privateDir, "x-twitter-tweets-verbatim.json");
const analysisPath = path.join(privateDir, "x-twitter-analysis.md");
const shortlistPath = path.join(privateDir, "x-twitter-shortlists.json");

const raw = await readFile(inputPath, "utf8");
const normalized = raw.replace(/\r\n/g, "\n");
const headerPattern = /^Angel .*? @a_e_s_4  ([A-Z][a-z]{2} \d{1,2}, \d{4})$/gm;
const matches = [...normalized.matchAll(headerPattern)];
const records = [];

for (const [index, match] of matches.entries()) {
  const start = match.index;
  const end = matches[index + 1]?.index ?? normalized.length;
  const block = normalized.slice(start, end).trim();
  const idMatch = block.match(/ID(\d+)(?:Original(\d+))?View on Twitter/);
  if (!idMatch) continue;

  const bodyStart = block.indexOf("\n") + 1;
  const bodyEnd = block.lastIndexOf("\nID");
  const beforeId = block.slice(bodyStart, bodyEnd).replace(/\n \d+ \d+\s*$/, "").trimEnd();
  const editMarker = /edited this Tweet/.test(block);

  records.push({
    id: idMatch[1],
    original_id: idMatch[2] ?? null,
    date_label: match[1],
    body_verbatim: beforeId,
    links: [...beforeId.matchAll(/https:\/\/t\.co\/[A-Za-z0-9]+/g)].map((item) => item[0]),
    edited_variant: editMarker || Boolean(idMatch[2])
  });
}

const topicRules = [
  ["openai_chatgpt", /\b(openai|chatgpt|gpt[- ]?\d|sora|codex|oai)\b/i],
  ["ai_policy_transition", /\b(ai|agi|asi|automation|ubi|unemployment|post labor|robotics)\b/i],
  ["product_function_request", /\b(feature request|can you add|may you guys|could you|would it be possible|allowing|update allowing|integration|integrate)\b/i],
  ["visual_or_design_identity", /\b(design|visual|ui|ux|grid|reels|canvas|website|timeline|organized messages|highlighted text|borders|shareability|readability)\b/i]
];

const topicCounts = Object.fromEntries(topicRules.map(([name]) => [name, 0]));
for (const record of records) {
  for (const [name, pattern] of topicRules) {
    if (pattern.test(record.body_verbatim)) topicCounts[name] += 1;
  }
}

const linkedCount = records.filter((record) => record.links.length).length;
const uniqueLinks = new Set(records.flatMap((record) => record.links));
const shortlists = Object.fromEntries(topicRules.map(([name, pattern]) => [
  name,
  records.filter((record) => pattern.test(record.body_verbatim))
]));
const analysis = `# Private X Archive Analysis

Source: approved Google Doc export \`X/Twitter data\`

## Extraction

- Parsed tweet records: ${records.length}
- Records with one or more \`t.co\` links: ${linkedCount}
- Unique \`t.co\` links: ${uniqueLinks.size}
- Edited variants preserved as separate archive records: ${records.filter((record) => record.edited_variant).length}

## Topic Signals

${Object.entries(topicCounts).map(([name, count]) => `- \`${name}\`: ${count} matching records`).join("\n")}

## Handling Rule

This analysis is private working material. The verbatim JSON remains git-ignored. Public timeline proposals should cite the approved personal archive minimally and describe the claim narrowly without copying private tweet text by default.
`;

await mkdir(privateDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`);
await writeFile(shortlistPath, `${JSON.stringify(shortlists, null, 2)}\n`);
await writeFile(analysisPath, analysis);
console.log(`Extracted ${records.length} tweet records into ${path.relative(root, outputPath)}.`);
console.log(`Wrote ${path.relative(root, shortlistPath)}.`);
console.log(`Wrote ${path.relative(root, analysisPath)}.`);
