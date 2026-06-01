# Presentation Contract

The evidence engine and the visual timeline are separate layers.

- `data/timelines/*.json` contains reviewed events and citations.
- `data/proposals/*.json` contains material awaiting review.
- `dist/presentation.json` is a public, year-grouped adapter for presentation layers.
- `private/` contains approved working archives and never enters the public export.

Run:

```bash
npm run export:presentation
```

## Reusable Visual Direction

An earlier `Code For XAI Timeline` draft established a useful editorial style:

- archival black background with light text and restrained borders
- serif-led event headlines paired with practical sans-serif labels
- sticky timeline axis with dotted progression
- large year groups and a date/content grid
- expandable record detail
- active-year emphasis during scroll

These are presentation choices, not evidence rules. A consuming website can use
the generated JSON while preserving its own framework, accessibility patterns,
and responsive behavior.
