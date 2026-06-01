import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const timelineDir = path.join(root, "data", "timelines");
const distDir = path.join(root, "dist");

const files = (await readdir(timelineDir))
  .filter((name) => name.endsWith(".json"))
  .sort();

const timelines = await Promise.all(
  files.map(async (filename) => JSON.parse(await readFile(path.join(timelineDir, filename), "utf8")))
);

const presentation = {
  generated_at: new Date().toISOString(),
  timelines: timelines.map((timeline) => {
    const groups = new Map();
    for (const event of [...timeline.events].sort((a, b) => a.date.localeCompare(b.date))) {
      const year = event.date.slice(0, 4);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push({
        id: event.id,
        date: event.date,
        date_precision: event.date_precision,
        title: event.title,
        summary: event.summary,
        evidence_status: event.evidence_status,
        confidence: event.confidence,
        interpretation: event.interpretation ?? null,
        sources: event.sources
      });
    }

    return {
      id: timeline.id,
      title: timeline.title,
      description: timeline.description,
      updated: timeline.updated,
      year_groups: [...groups].map(([year, events]) => ({ year, events }))
    };
  })
};

await mkdir(distDir, { recursive: true });
await writeFile(path.join(distDir, "presentation.json"), JSON.stringify(presentation, null, 2) + "\n");
console.log(`Exported ${timelines.length} presentation timeline(s) into dist/presentation.json.`);
