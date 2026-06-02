import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registry = JSON.parse(await readFile(path.join(root, "dist", "sources.json"), "utf8"));
const timeoutMs = Number(process.env.SOURCE_AUDIT_TIMEOUT_MS ?? 10000);
const concurrency = Number(process.env.SOURCE_AUDIT_CONCURRENCY ?? 4);
const checkedAt = new Date().toISOString();

async function check(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(source.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "evidence-timeline-template-source-audit/0.1" }
    });
    return {
      url: source.url,
      final_url: response.url,
      status: response.status,
      ok: response.ok,
      classification: response.ok ? "reachable" : "http_error",
      redirected: response.url !== source.url,
      references: source.references
    };
  } catch (error) {
    return {
      url: source.url,
      final_url: null,
      status: null,
      ok: false,
      classification: error.name === "AbortError" ? "timeout" : "network_error",
      error: error.message,
      references: source.references
    };
  } finally {
    clearTimeout(timeout);
  }
}

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < registry.sources.length) {
    const source = registry.sources[cursor++];
    results.push(await check(source));
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
results.sort((a, b) => a.url.localeCompare(b.url));

const summary = Object.fromEntries(["reachable", "http_error", "timeout", "network_error"].map((type) => [
  type,
  results.filter((result) => result.classification === type).length
]));
const report = {
  checked_at: checkedAt,
  mode: "live_http_audit",
  note: "This report records a bounded live HTTP check. A reachable URL does not prove that its content still supports the cited claim.",
  timeout_ms: timeoutMs,
  concurrency,
  summary,
  results
};

await mkdir(path.join(root, "dist"), { recursive: true });
await writeFile(path.join(root, "dist", "source-url-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Checked ${results.length} URL(s): ${summary.reachable} reachable, ${summary.http_error} HTTP error(s), ${summary.timeout} timeout(s), ${summary.network_error} network error(s).`);
