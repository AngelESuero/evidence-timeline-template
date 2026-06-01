import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const timelineDir = path.join(root, "data", "timelines");
const distDir = path.join(root, "dist");

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);

const files = (await readdir(timelineDir)).filter((name) => name.endsWith(".json")).sort();
const timelines = await Promise.all(files.map(async (filename) => JSON.parse(await readFile(path.join(timelineDir, filename), "utf8"))));

const timelineMarkup = timelines.map((timeline) => `
  <section class="timeline">
    <header>
      <p class="eyebrow">Updated ${escapeHtml(timeline.updated)}</p>
      <h2>${escapeHtml(timeline.title)}</h2>
      <p>${escapeHtml(timeline.description)}</p>
    </header>
    <ol>
      ${[...timeline.events].sort((a, b) => a.date.localeCompare(b.date)).map((event) => `
      <li>
        <article>
          <div class="date">${escapeHtml(event.date)}</div>
          <div class="labels"><span>${escapeHtml(event.evidence_status)}</span><span>${escapeHtml(event.confidence)} confidence</span></div>
          <h3>${escapeHtml(event.title)}</h3>
          <p>${escapeHtml(event.summary)}</p>
          ${event.interpretation ? `<p class="interpretation"><strong>Interpretation:</strong> ${escapeHtml(event.interpretation)}</p>` : ""}
          <h4>Sources</h4>
          <ul>${event.sources.map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a> <small>${escapeHtml(source.publisher)} · ${escapeHtml(source.type)} · accessed ${escapeHtml(source.accessed)}</small></li>`).join("")}</ul>
        </article>
      </li>`).join("")}
    </ol>
  </section>`).join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Evidence Timelines</title>
  <style>
    :root { color-scheme: light; font-family: Inter, system-ui, sans-serif; color: #1d2935; background: #f6f3ed; }
    body { margin: 0; }
    main { max-width: 900px; margin: auto; padding: 48px 20px 80px; }
    h1 { font-size: clamp(2rem, 6vw, 4.5rem); line-height: .98; max-width: 720px; }
    h2 { font-size: 2rem; margin: 0; }
    h3 { margin-bottom: 8px; }
    h4 { margin-bottom: 4px; }
    a { color: #095b58; }
    .lede { max-width: 720px; font-size: 1.1rem; }
    .timeline { margin-top: 64px; }
    .timeline > ol { list-style: none; padding: 0; border-left: 2px solid #bdc9c3; }
    .timeline > ol > li { margin: 0 0 28px 20px; position: relative; }
    .timeline > ol > li::before { content: ""; width: 12px; height: 12px; background: #095b58; border-radius: 50%; position: absolute; left: -27px; top: 8px; }
    article { padding: 20px; background: white; border: 1px solid #e0ddd4; border-radius: 12px; box-shadow: 0 6px 16px #1d29350d; }
    .eyebrow, .date, small { color: #60706e; }
    .labels span { display: inline-block; padding: 3px 8px; margin: 6px 6px 0 0; background: #e4eeeb; border-radius: 99px; font-size: .78rem; }
    .interpretation { border-left: 3px solid #c69e42; padding-left: 12px; }
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">Open-source starter</p>
    <h1>Evidence timelines for stories worth inspecting.</h1>
    <p class="lede">A timeline is not an authority. It is an inspectable map of the evidence available at a particular moment.</p>
    ${timelineMarkup}
  </main>
</body>
</html>`;

await mkdir(distDir, { recursive: true });
await writeFile(path.join(distDir, "index.html"), html);
console.log(`Built ${timelines.length} timeline(s) into dist/index.html.`);

