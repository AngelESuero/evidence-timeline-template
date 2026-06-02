import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const timelineDir = path.join(root, "data", "timelines");
const distDir = path.join(root, "dist");
const files = (await readdir(timelineDir)).filter((name) => name.endsWith(".json")).sort();
const timelines = await Promise.all(files.map(async (filename) => JSON.parse(await readFile(path.join(timelineDir, filename), "utf8"))));
const health = JSON.parse(await readFile(path.join(distDir, "source-health.json"), "utf8"));
const requiredOpenAiViews = ["chronology", "capability", "product", "frontier_voices", "social_transition", "disputes"];

function count(values) {
  return Object.fromEntries([...new Set(values)].sort().map((value) => [value, values.filter((item) => item === value).length]));
}

const report = {
  generated_at: `${timelines.map((timeline) => timeline.updated).sort().at(-1)}T00:00:00.000Z`,
  mode: "coverage_audit",
  note: "Coverage is a completeness signal, not proof that a timeline is exhaustive or that every interpretation is correct.",
  totals: {
    timelines: timelines.length,
    events: timelines.flatMap((timeline) => timeline.events).length,
    unique_sources: JSON.parse(await readFile(path.join(distDir, "sources.json"), "utf8")).sources.length
  },
  timelines: timelines.map((timeline) => {
    const events = timeline.events;
    const lanes = events.flatMap((event) => event.timeline_lanes ?? []);
    const sourceTypes = events.flatMap((event) => event.sources.map((source) => source.type));
    const isOpenAiReference = timeline.id === "openai-reference";
    const missingViews = isOpenAiReference ? requiredOpenAiViews.filter((view) => !lanes.includes(view)) : [];
    return {
      id: timeline.id,
      title: timeline.title,
      event_count: events.length,
      source_count: events.flatMap((event) => event.sources).length,
      first_event: [...events].sort((a, b) => a.date.localeCompare(b.date)).at(0)?.date ?? null,
      last_event: [...events].sort((a, b) => a.date.localeCompare(b.date)).at(-1)?.date ?? null,
      lane_counts: count(lanes),
      record_type_counts: count(events.map((event) => event.record_type ?? "unspecified")),
      source_type_counts: count(sourceTypes),
      records_with_reliability_notes: events.filter((event) => event.reliability_note).length,
      records_with_social_implications: events.filter((event) => event.social_implication).length,
      records_with_open_questions: events.filter((event) => event.open_questions?.length).length,
      architecture_views: isOpenAiReference ? Object.fromEntries(requiredOpenAiViews.map((view) => [view, lanes.includes(view)])) : null,
      missing_architecture_views: missingViews
    };
  }),
  source_health: health.summary,
  source_health_review_queue_count: health.review_queue.length
};

await mkdir(distDir, { recursive: true });
await writeFile(path.join(distDir, "coverage.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Audited coverage for ${report.totals.timelines} timeline(s) and ${report.totals.events} event(s).`);
