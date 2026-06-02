import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registry = JSON.parse(await readFile(path.join(root, "dist", "sources.json"), "utf8"));
const summary = { live: 0, archived: 0, missing: 0, context_dependent: 0 };
const reviewQueue = [];

for (const source of registry.sources) {
  summary[source.archive_status] += 1;
  const gaps = [];
  if (!source.claim_scope) gaps.push("claim_scope");
  if (!source.published && ["official_announcement", "official_research", "official_system_card", "frontier_voice_post", "frontier_voice_talk", "external_reporting", "independent_research", "public_commentary"].includes(source.type)) gaps.push("published");
  if (source.archive_status !== "live") gaps.push(`archive_status:${source.archive_status}`);
  if (gaps.length) reviewQueue.push({ url: source.url, title: source.title, gaps, references: source.references });
}

const report = {
  generated_at: registry.generated_at,
  mode: "metadata_audit",
  note: "This report audits stored source metadata. It does not claim to perform a live HTTP availability check.",
  summary,
  review_queue: reviewQueue
};

await mkdir(path.join(root, "dist"), { recursive: true });
await writeFile(path.join(root, "dist", "source-health.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Audited ${registry.sources.length} source(s); ${reviewQueue.length} need metadata or lifecycle review.`);
