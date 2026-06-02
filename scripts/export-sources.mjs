import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const timelineDir = path.join(root, "data", "timelines");
const distDir = path.join(root, "dist");
const files = (await readdir(timelineDir)).filter((name) => name.endsWith(".json")).sort();
const timelines = await Promise.all(files.map(async (filename) => JSON.parse(await readFile(path.join(timelineDir, filename), "utf8"))));
const sources = new Map();

for (const timeline of timelines) {
  for (const event of timeline.events) {
    for (const source of event.sources) {
      const existing = sources.get(source.url);
      const reference = { timeline_id: timeline.id, event_id: event.id };
      if (existing) {
        existing.references.push(reference);
        continue;
      }
      sources.set(source.url, { ...source, references: [reference] });
    }
  }
}

const registry = {
  generated_at: `${timelines.map((timeline) => timeline.updated).sort().at(-1)}T00:00:00.000Z`,
  sources: [...sources.values()].sort((a, b) => a.publisher.localeCompare(b.publisher) || a.title.localeCompare(b.title))
};

await mkdir(distDir, { recursive: true });
await writeFile(path.join(distDir, "sources.json"), `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Exported ${registry.sources.length} unique source(s) into dist/sources.json.`);
