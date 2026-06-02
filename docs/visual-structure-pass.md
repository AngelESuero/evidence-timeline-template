# Visual Structure Pass

This pass compares a live Chrome inspection of the verified OpenAI reference
with the recovered `Code For XAI Timeline` prototype. The prototype could not be
rendered locally through the Chrome extension because local document URLs are
blocked by browser security policy, so prototype conclusions are labeled as
code-derived.

## Rendered Observation: OpenAI Reference

Source: <https://openai.com/elon-musk/>

The page works because it does not begin as a dense timeline. It establishes a
reading frame first, then reveals the evidence stream.

### 1. Thesis Before Records

- A large centered headline establishes the subject.
- One short sentence explains why the collection exists.
- A narrow reading column gives the reader enough context before chronology
  begins.

This prevents the timeline from feeling like an unprioritized archive dump.

### 2. A Clear Change In Width Signals A Change In Mode

- The introduction uses a constrained editorial column.
- Timeline records expand into wider bordered cards.
- The visual shift tells the reader: the framing is over; the inspectable record
  begins here.

### 3. Metadata Arrives Before Interpretation

Each record begins with small type labels such as source category and date,
followed by a larger event claim. This creates a repeatable reading rhythm:

1. What kind of record is this?
2. When did it happen?
3. What is the claim?
4. What evidence can I inspect?

### 4. Cards Behave Like Evidence Containers

- Borders are restrained rather than decorative.
- Cards have enough vertical space to hold links, summaries, images, social
  embeds, or documents.
- A permalink control makes each record individually addressable.

The record is not only text. It is a stable container for heterogeneous
evidence.

### 5. Low Visual Noise Makes Dense Material Tolerable

- The near-black background stays consistent.
- White text, muted secondary labels, and thin borders establish hierarchy
  without many competing colors.
- Large gaps between records let the reader stop and resume without losing
  position.

### 6. Embedded Material Is Supporting Evidence

Social posts, screenshots, and linked filings appear inside or beneath the event
frame. They support the claim without replacing the event summary.

## Code-Derived Observation: Recovered Prototype

The recovered prototype adds a stronger sense of linear chronology:

- fixed top axis running from an initial year toward `Future`
- dotted progression line with an optional current-position marker
- year-grouped sections with large serif numerals
- sticky year labels on desktop
- date column separated from the event-content column
- featured records with larger typography
- `Read record` disclosure for detail on demand
- active-year sections at full opacity while surrounding sections recede

These choices work because they preserve orientation during a long scroll.

## Recommended Combined Structure

Use the strengths of both references:

1. Begin with a narrow editorial introduction and a one-sentence purpose.
2. Follow with controls for sorting, filtering, and thematic views.
3. Use a sticky progression axis for chronological orientation.
4. Group records by year or era with a persistent year marker.
5. Give every event a compact metadata row, a readable claim, citations, and a
   permalink.
6. Expand detail on demand for interpretation, disputes, and embedded evidence.
7. Visually emphasize a small number of pivotal records without hiding ordinary
   records.
8. Keep the palette restrained so sources and relationships carry the emphasis.
9. Let thematic cross-links supplement chronology rather than replace it.
10. Preserve a responsive single-column reading order on narrow screens.

## What Not To Copy Blindly

- Do not treat a dark palette as the idea itself.
- Do not embed social posts without preserving a fallback summary and source
  URL; embeds can disappear.
- Do not let large hero text push the first useful record too far below the
  fold.
- Do not use opacity changes so aggressively that older records become hard to
  read.
- Do not publish prototype claims until their sources are reviewed.
