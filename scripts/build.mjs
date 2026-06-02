import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const timelineDir = path.join(root, "data", "timelines");
const distDir = path.join(root, "dist");

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);
const label = (value = "") => String(value).replaceAll("_", " ");
const list = (items = []) => items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
const detail = (title, value) => value ? `<div class="detail-block"><strong>${title}</strong><p>${escapeHtml(value)}</p></div>` : "";
const detailList = (title, items) => items?.length ? `<div class="detail-block"><strong>${title}</strong>${list(items)}</div>` : "";
const lanes = (event) => event.timeline_lanes ?? ["chronology"];

const files = (await readdir(timelineDir)).filter((name) => name.endsWith(".json")).sort();
const timelines = await Promise.all(files.map(async (filename) => JSON.parse(await readFile(path.join(timelineDir, filename), "utf8"))));

const timelineMarkup = timelines.map((timeline) => `
  <section class="timeline" aria-labelledby="${escapeHtml(timeline.id)}-title">
    <header class="timeline-intro">
      <p class="eyebrow">Updated ${escapeHtml(timeline.updated)}</p>
      <h2 id="${escapeHtml(timeline.id)}-title">${escapeHtml(timeline.title)}</h2>
      <p>${escapeHtml(timeline.description)}</p>
    </header>
    <div class="timeline-controls">
      <p><span data-visible-count>${timeline.events.length}</span> of ${timeline.events.length} reviewed records</p>
      <p>Oldest to newest · inspectable sources</p>
    </div>
    <nav class="lane-filters" aria-label="Timeline views">
      ${["all", "chronology", "capability", "product", "frontier_voices", "social_transition", "disputes"].map((lane) => `<button class="lane-filter${lane === "all" ? " active" : ""}" type="button" data-lane="${lane}">${escapeHtml(label(lane))}</button>`).join("")}
    </nav>
    <div class="search-tools">
      <label>
        <span>Search records</span>
        <input type="search" placeholder="Search titles, summaries, and notes" data-record-search>
      </label>
      <label>
        <span>Source type</span>
        <select data-source-filter>
          <option value="all">all sources</option>
          ${[...new Set(timeline.events.flatMap((event) => event.sources.map((source) => source.type)))].sort().map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(label(type))}</option>`).join("")}
        </select>
      </label>
    </div>
    <ol class="records">
      ${[...timeline.events].sort((a, b) => a.date.localeCompare(b.date)).map((event) => `
      <li class="record-shell" data-lanes="${escapeHtml(lanes(event).join(" "))}" data-source-types="${escapeHtml(event.sources.map((source) => source.type).join(" "))}" data-search="${escapeHtml([event.title, event.summary, event.interpretation, event.capability_implication, event.reliability_note, event.social_implication].filter(Boolean).join(" ").toLowerCase())}">
        <article class="record" id="${escapeHtml(event.id)}">
          <header class="record-meta">
            <div>
              <span>${escapeHtml(event.evidence_status)}</span>
              <time datetime="${escapeHtml(event.date)}">${escapeHtml(event.date)}</time>
              <em>${escapeHtml(label(event.record_type ?? "release"))}</em>
            </div>
            <a class="permalink" href="#${escapeHtml(event.id)}" aria-label="Link to ${escapeHtml(event.title)}">#</a>
          </header>
          <h3>${escapeHtml(event.title)}</h3>
          <p class="summary">${escapeHtml(event.summary)}</p>
          <div class="lane-list">${lanes(event).map((lane) => `<span>${escapeHtml(label(lane))}</span>`).join("")}</div>
          <div class="record-footer">
            <details>
              <summary>Inspect record</summary>
              <div class="detail-grid">
                ${detail("Interpretation", event.interpretation)}
                ${detail("Capability implication", event.capability_implication)}
                ${detail("Reliability note", event.reliability_note)}
                ${detail("Social implication", event.social_implication)}
                ${detailList("Disputes", event.disputes)}
                ${detailList("Open questions", event.open_questions)}
              </div>
              ${event.related_events?.length ? `<div class="related-events"><strong>Related records</strong>${event.related_events.map((id) => `<a href="#${escapeHtml(id)}">${escapeHtml(id)}</a>`).join("")}</div>` : ""}
              <div class="source-list">
                <strong>Sources</strong>
                <ul>${event.sources.map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a><small>${escapeHtml(source.publisher)} · ${escapeHtml(label(source.type))} · accessed ${escapeHtml(source.accessed)}</small>${source.note ? `<small>${escapeHtml(source.note)}</small>` : ""}</li>`).join("")}</ul>
              </div>
            </details>
            <div class="labels"><span>${escapeHtml(event.confidence)} confidence</span><span>${escapeHtml(event.date_precision)} precision</span></div>
          </div>
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
    :root { color-scheme: dark; font-family: Arial, Helvetica, sans-serif; color: #f4f4f0; background: #090909; }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; background: #090909; }
    a { color: #f4f4f0; text-underline-offset: 4px; text-decoration-color: #666; }
    a:hover { text-decoration-color: #f4f4f0; }
    main { max-width: 1180px; margin: auto; padding: 92px 28px 120px; }
    .masthead { max-width: 760px; margin: 0 auto; padding: 24px 0 88px; text-align: center; }
    h1 { margin: 0; font-size: clamp(3rem, 6vw, 5.7rem); font-weight: 400; letter-spacing: -.07em; line-height: .94; }
    .lede { margin: 30px auto 0; max-width: 620px; color: #c3c3bd; font-size: 1.05rem; line-height: 1.55; }
    .eyebrow { color: #989890; font-size: .7rem; letter-spacing: .18em; text-transform: uppercase; }
    .timeline-intro { max-width: 680px; margin: 0 auto 56px; }
    .timeline-intro h2 { margin: 12px 0 12px; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3.6rem); font-weight: 400; line-height: 1.02; }
    .timeline-intro p:last-child { color: #b8b8b1; font-size: 1rem; line-height: 1.6; }
    .timeline-controls { display: flex; justify-content: space-between; margin: 0 0 18px; color: #a1a19a; font-size: .76rem; letter-spacing: .1em; text-transform: uppercase; }
    .timeline-controls p { margin: 0; }
    .lane-filters { display: flex; flex-wrap: wrap; gap: 7px; margin: 0 0 28px; }
    .lane-filter { padding: 7px 10px; border: 1px solid #343431; color: #aaa9a2; background: transparent; cursor: pointer; font: inherit; font-size: .68rem; letter-spacing: .09em; text-transform: uppercase; transition: .2s ease; }
    .lane-filter:hover, .lane-filter.active { border-color: #d4d4ce; color: #f4f4f0; background: #171716; }
    .search-tools { display: grid; grid-template-columns: minmax(0, 1fr) minmax(180px, 260px); gap: 12px; margin: 0 0 28px; }
    .search-tools label { display: grid; gap: 7px; color: #989890; font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; }
    .search-tools input, .search-tools select { min-height: 38px; padding: 8px 10px; border: 1px solid #343431; border-radius: 0; color: #e8e8e3; background: #0d0d0d; font: inherit; font-size: .82rem; letter-spacing: 0; outline: none; text-transform: none; }
    .search-tools input:focus, .search-tools select:focus { border-color: #d4d4ce; }
    .records { display: grid; gap: 18px; margin: 0; padding: 0; list-style: none; }
    .record-shell[hidden] { display: none; }
    .record { min-height: 208px; padding: 24px 26px 22px; border: 1px solid #2b2b29; background: #0d0d0d; transition: border-color .2s ease, background .2s ease; }
    .record:hover, .record:target { border-color: #5b5b56; background: #111; }
    .record-meta, .record-meta > div, .record-footer, .labels { display: flex; align-items: center; }
    .record-meta { justify-content: space-between; color: #aaa9a2; font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; }
    .record-meta > div { gap: 12px; }
    .record-meta span { color: #e8e8e3; }
    .record-meta em { color: #8f8f89; font-style: normal; }
    .permalink { color: #aaa9a2; font-size: 1rem; text-decoration: none; }
    h3 { max-width: 900px; margin: 28px 0 12px; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.65rem, 3vw, 2.6rem); font-weight: 400; letter-spacing: -.025em; line-height: 1.05; }
    .summary { max-width: 860px; margin: 0; color: #b8b8b1; font-size: .98rem; line-height: 1.6; }
    .lane-list { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 18px; }
    .lane-list span { color: #8f8f89; font-size: .65rem; letter-spacing: .09em; text-transform: uppercase; }
    .record-footer { justify-content: space-between; gap: 18px; margin-top: 26px; }
    details { max-width: 820px; }
    summary { color: #dadad4; cursor: pointer; font-size: .8rem; letter-spacing: .1em; list-style: none; text-transform: uppercase; }
    summary::-webkit-details-marker { display: none; }
    summary::after { content: ' +'; color: #8f8f89; }
    details[open] summary::after { content: ' -'; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 28px; margin-top: 22px; }
    .detail-block, .source-list, .related-events { color: #b8b8b1; font-size: .9rem; line-height: 1.6; }
    .detail-block strong, .source-list strong, .related-events strong { display: block; margin-bottom: 4px; color: #f4f4f0; font-size: .72rem; letter-spacing: .11em; text-transform: uppercase; }
    .detail-block p { margin: 0; }
    .source-list, .related-events { margin-top: 20px; }
    .source-list ul, .detail-block ul { margin: 8px 0 0; padding-left: 18px; }
    .related-events a { display: inline-block; margin: 4px 10px 0 0; color: #b8b8b1; font-size: .78rem; }
    .source-list li + li { margin-top: 10px; }
    small { display: block; margin-top: 3px; color: #8d8d87; }
    .labels { flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
    .labels span { padding: 4px 8px; border: 1px solid #343431; color: #a5a59e; font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; }
    @media (max-width: 680px) {
      main { padding: 54px 16px 80px; }
      .masthead { padding-bottom: 62px; text-align: left; }
      h1 { font-size: clamp(3.2rem, 18vw, 5.2rem); }
      .timeline-intro { margin-bottom: 36px; }
      .timeline-controls { gap: 12px; font-size: .62rem; }
      .record { min-height: 0; padding: 18px 16px; }
      h3 { margin-top: 22px; font-size: 1.75rem; }
      .record-footer { display: block; }
      .labels { justify-content: flex-start; margin-top: 20px; }
      .detail-grid { grid-template-columns: 1fr; gap: 16px; }
      .search-tools { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header class="masthead">
      <p class="eyebrow">Open-source starter</p>
      <h1>Evidence timelines for stories worth inspecting.</h1>
      <p class="lede">A timeline is not an authority. It is an inspectable map of the evidence available at a particular moment.</p>
    </header>
    ${timelineMarkup}
  </main>
</body>
<script>
  for (const timeline of document.querySelectorAll(".timeline")) {
    const records = [...timeline.querySelectorAll(".record-shell")];
    const count = timeline.querySelector("[data-visible-count]");
    const search = timeline.querySelector("[data-record-search]");
    const source = timeline.querySelector("[data-source-filter]");
    let activeLane = "all";
    const applyFilters = () => {
      const query = search.value.trim().toLowerCase();
      for (const record of records) {
        const laneMatch = activeLane === "all" || record.dataset.lanes.split(" ").includes(activeLane);
        const sourceMatch = source.value === "all" || record.dataset.sourceTypes.split(" ").includes(source.value);
        const textMatch = !query || record.dataset.search.includes(query);
        record.hidden = !(laneMatch && sourceMatch && textMatch);
      }
      count.textContent = records.filter((record) => !record.hidden).length;
    };
    for (const button of timeline.querySelectorAll(".lane-filter")) {
      button.addEventListener("click", () => {
        activeLane = button.dataset.lane;
        for (const filter of timeline.querySelectorAll(".lane-filter")) filter.classList.toggle("active", filter === button);
        applyFilters();
      });
    }
    search.addEventListener("input", applyFilters);
    source.addEventListener("change", applyFilters);
  }
</script>
</html>`;

await mkdir(distDir, { recursive: true });
await writeFile(path.join(distDir, "index.html"), html.replace(/[ \t]+$/gm, ""));
console.log(`Built ${timelines.length} timeline(s) into dist/index.html.`);
