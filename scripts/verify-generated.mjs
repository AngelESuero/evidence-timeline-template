import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const timelineDir = path.join(root, "data", "timelines");
const distDir = path.join(root, "dist");
const timelineFiles = (await readdir(timelineDir)).filter((name) => name.endsWith(".json")).sort();
const timelines = await Promise.all(timelineFiles.map(async (filename) => JSON.parse(await readFile(path.join(timelineDir, filename), "utf8"))));
const presentation = JSON.parse(await readFile(path.join(distDir, "presentation.json"), "utf8"));
const sources = JSON.parse(await readFile(path.join(distDir, "sources.json"), "utf8"));
const coverage = JSON.parse(await readFile(path.join(distDir, "coverage.json"), "utf8"));
const html = await readFile(path.join(distDir, "index.html"), "utf8");
const errors = [];

const expectedEvents = timelines.flatMap((timeline) => timeline.events);
const expectedSourceUrls = new Set(expectedEvents.flatMap((event) => event.sources.map((source) => source.url)));
const htmlIds = [...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]);
const duplicateHtmlIds = [...new Set(htmlIds.filter((id, index) => htmlIds.indexOf(id) !== index))];
const sourceCardCount = (html.match(/class="source-card"/g) ?? []).length;

if (presentation.timelines.length !== timelines.length) errors.push("presentation timeline count does not match source timelines");
if (presentation.timelines.flatMap((timeline) => timeline.year_groups.flatMap((group) => group.events)).length !== expectedEvents.length) {
  errors.push("presentation event count does not match source timelines");
}
if (sources.sources.length !== expectedSourceUrls.size) errors.push("source registry count does not match unique timeline source URLs");
if (coverage.totals.timelines !== timelines.length) errors.push("coverage timeline total does not match source timelines");
if (coverage.totals.events !== expectedEvents.length) errors.push("coverage event total does not match source timelines");
if (coverage.totals.unique_sources !== expectedSourceUrls.size) errors.push("coverage source total does not match unique timeline source URLs");
if (duplicateHtmlIds.length) errors.push(`generated HTML contains duplicate id(s): ${duplicateHtmlIds.join(", ")}`);
if (sourceCardCount !== expectedSourceUrls.size) errors.push("generated HTML source-card count does not match unique timeline source URLs");
for (const timeline of timelines) {
  if (!html.includes(`aria-labelledby="${timeline.id}-title"`)) errors.push(`generated HTML is missing timeline ${timeline.id}`);
  for (const event of timeline.events) {
    if (!html.includes(`id="${event.id}"`)) errors.push(`generated HTML is missing event ${event.id}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Verified generated artifacts for ${timelines.length} timeline(s), ${expectedEvents.length} event(s), and ${expectedSourceUrls.size} unique source(s).`);
