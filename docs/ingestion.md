# Reviewable Ingestion

Automation should propose events. It should not silently publish them.

## Intended Flow

1. Select an explicitly approved source or source collection.
2. Extract candidate dates, claims, and source references.
3. Write candidate records into `data/proposals/`.
4. Review the factual summary, date precision, source type, privacy status, and interpretation.
5. Move approved events into the relevant file in `data/timelines/`.
6. Run `npm run check`.

## Stage A Proposal

Use the local proposal CLI after choosing an explicitly approved source:

```bash
npm run propose -- \
  --proposal-id example-event \
  --target-timeline openai-seed \
  --event-id example-event \
  --date 2026-06-01 \
  --date-precision day \
  --title "Example event" \
  --summary "Write a narrow factual claim supported by the source." \
  --source-url "https://example.com/source" \
  --source-title "Example source" \
  --source-publisher "Example publisher" \
  --source-type official_announcement \
  --accessed 2026-06-01 \
  --archive-status live
```

The command always writes a `needs_review` proposal. It does not publish the event.

Use `personal_archive` only when the explicitly approved input is private.

## Personal Archives

For chats, exported posts, Docs, or other personal records:

- ingest only collections that were explicitly approved for the run
- keep excerpts out of the public repository unless publication was explicitly approved
- store the minimum local reference needed for review
- mark the source as `personal_archive`
- require a human decision before publication

## Future Adapters

Adapters can be added for:

- official web pages
- exported social posts
- Google Docs selected by exact ID or URL
- local Markdown or JSON archives

Each adapter should produce proposal files with the same review boundary.

## Private X Archive Extraction

For an approved local X archive export, place the source text at
`private/x-twitter-data-verbatim.txt` and run:

```bash
npm run extract:x
```

The command creates a structured verbatim index, topic shortlists, and a working
analysis inside `private/`. The entire directory is gitignored. Treat the raw
export as the canonical private source and move only reviewed, summarized
candidate events into `data/proposals/`.

Run `npm run interpret:x` to create a private one-record-per-post idea ledger.
Each entry keeps the verbatim archive text beside a separate interpretation
layer. Link-dependent reactions remain explicitly unresolved until their
context is inspected.
