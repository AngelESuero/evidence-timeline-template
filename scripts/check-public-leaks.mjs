import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const roots = ["README.md", "CONTRIBUTING.md", "data", "dist", "docs", "schema", "scripts"];
const excluded = new Set(["scripts/extract-x-archive.mjs", "scripts/interpret-x-archive.mjs", "scripts/check-public-leaks.mjs"]);
const patterns = [
  ["private tweet id", /ID\d{12,}/],
  ["approved private Google Doc id", /1VYvQhnxrFLipXFK1dtuyY1z5Z8QsuUROoWMBt_MxKuo/],
  ["private verbatim field", /body_verbatim/],
  ["signed query string", /(?:sdmntpr|sig)=/]
];

async function filesAt(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const stat = await import("node:fs/promises").then(({ stat }) => stat(absolutePath));
  if (stat.isFile()) return [relativePath];
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => filesAt(path.join(relativePath, entry.name))));
  return nested.flat();
}

const files = (await Promise.all(roots.map(filesAt))).flat().filter((file) => !excluded.has(file));
const errors = [];
for (const file of files) {
  const content = await readFile(path.join(root, file), "utf8").catch(() => "");
  for (const [label, pattern] of patterns) {
    if (pattern.test(content)) errors.push(`${file}: contains ${label}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Scanned ${files.length} public file(s) for private-archive leak markers.`);
