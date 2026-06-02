# Evidence Timeline Template

An open-source starter for building inspectable timelines from cited evidence.

A timeline is not an authority. It is an inspectable map of the evidence available at a particular moment.

## Why This Exists

Important stories are scattered across announcements, documents, reporting, archives, and personal records. This project keeps chronology, claims, sources, interpretation, and uncertainty close enough together that a reader can inspect the trail.

The default workflow is deliberately conservative:

1. Add narrowly written events to `data/timelines/*.json`.
2. Attach at least one source to every event.
3. Separate observed facts from interpretation.
4. Mark disputes and uncertainty instead of flattening them.
5. Run validation before publishing.
6. Review proposed events before they become part of a public timeline.

## Quick Start

```bash
npm run validate
npm run build
```

Open `dist/index.html` in a browser after building.

The repository can be paired with GitHub Actions and GitHub Pages after the
publishing token is authorized for workflow changes. Until then, run
`npm run check` locally before publishing.

`npm run check` validates records and cross-links, scans public files for
private-archive leak markers, exports registries, audits stored source lifecycle
metadata, and rebuilds the static site.

Run `npm run audit:urls` separately when network access is available. It writes
`dist/source-url-audit.json`, a bounded live HTTP report. URL reachability is
useful evidence, but it does not prove that a page still supports the cited
claim.

## Structure

```text
data/timelines/       Reviewed timeline data
data/proposals/       Review queue for machine- or human-proposed events
schema/               Portable JSON Schema
scripts/              Dependency-free validation and static-site generation
dist/                 Generated static site
```

## Event Model

Each event records:

- a stable `id`
- a date and its precision
- a narrow factual `summary`
- a `record_type` and one or more optional `timeline_lanes`
- one or more cited `sources`
- an `evidence_status` and `confidence`
- optional `interpretation`, capability, reliability, and social notes
- optional `disputes`, `open_questions`, and `related_events`

See [`schema/timeline.schema.json`](schema/timeline.schema.json), [`schema/proposal.schema.json`](schema/proposal.schema.json), and [`data/timelines/openai-seed.json`](data/timelines/openai-seed.json).

The repository also includes
[`data/timelines/web-standards-proof.json`](data/timelines/web-standards-proof.json),
a compact W3C-sourced timeline that exercises the engine outside the OpenAI
reference implementation.

## Evidence Labels

- `verified`: the event is supported by cited evidence.
- `proposed`: the event is waiting for review.
- `disputed`: cited sources materially disagree.
- `incomplete`: the event is useful to retain but needs better sourcing.

Source types are explicit enough to keep different kinds of evidence legible:
official announcements, research, system cards, product documentation, legal
or policy documents, frontier-voice posts and talks, external reporting,
independent research, public commentary, and approved personal archives.

## Private Sources

Personal archives should enter through `data/proposals/`, not directly into a published timeline. Keep private excerpts out of Git unless publication is explicitly approved. A proposal may store a local source reference and a short review note without copying sensitive content.

Start with [`data/proposals/proposal.template.json`](data/proposals/proposal.template.json). Moving a reviewed proposal into a public timeline is a deliberate human approval step.

See [`docs/ingestion.md`](docs/ingestion.md) for the automation boundary.

## Presentation Layers

Run `npm run export:presentation` to create a public, year-grouped
`dist/presentation.json` adapter from reviewed timeline data. This keeps visual
interfaces separate from ingestion and review logic.

Run `npm run export:sources` to create `dist/sources.json`, a deduplicated
public source registry with references back to each timeline event.

See [`docs/presentation.md`](docs/presentation.md) for the presentation contract
and the reusable editorial direction recovered from an earlier timeline draft.
See [`docs/visual-reference-map.md`](docs/visual-reference-map.md) for the
verified visual reference and unresolved provenance notes.
See [`docs/visual-structure-pass.md`](docs/visual-structure-pass.md) for the
Chrome-inspected layout analysis and implementation rules.

See [`docs/alignment-principles.md`](docs/alignment-principles.md) for the
product principles distilled from the approved private archive without
publishing private post text.
See [`docs/openai-timeline-information-architecture.md`](docs/openai-timeline-information-architecture.md)
for the OpenAI-specific record structure, source register, views, and build
sequence distilled from the archive.

## Publishing

The generated `dist/` directory is a static site and can be hosted with GitHub
Pages. Add a Pages workflow after authorizing workflow changes, or publish
`dist/` through another static host.
