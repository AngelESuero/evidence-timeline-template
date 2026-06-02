# OpenAI Timeline Information Architecture

This document defines the information the OpenAI timeline should present and the
source material used to build it. It is distilled from a private review of the
approved X archive. The private archive remains local.

## Purpose

The OpenAI timeline should help a reader answer:

1. What changed?
2. What evidence supports that claim?
3. How does the change affect the path toward more capable AI?
4. What remains unreliable, disputed, or unresolved?
5. What does the change mean for everyday life, institutions, and public
   response?

The timeline should make progress inspectable without turning uncertain claims
into certainty or reducing the story to product launches.

## Required Views

### 1. Chronology

The primary view. Show events in time order with stable anchors and expandable
records.

### 2. Capability Progress

Track what systems can do, what changed technically, what remains unreliable,
and which claims are demonstrated versus projected.

### 3. Product And Interface Evolution

Track how capabilities become usable: search, voice, multimodality, agents,
tools, integrations, document workspaces, operating-system-like interfaces, and
everyday-device experiences.

### 4. Frontier Voices

Collect public posts, talks, interviews, and presentations from willing
employees, researchers, leaders, and other directly relevant participants.
Preserve the original source URL and distinguish personal commentary from
official statements.

### 5. Social Transition

Track implications for labor, access, governance, public understanding,
education, wellbeing, culture, and possible institutional responses. These
records should be visibly labeled as observed effects, proposals, questions, or
interpretation.

### 6. Disputes And Open Questions

Retain contested claims, unresolved context, competing interpretations, and
important questions instead of silently flattening them into one narrative.

## Event Record

Every public event should contain:

| Field | Purpose |
| --- | --- |
| `date` and `date_precision` | State when the event happened and how precise the date is. |
| `title` | Give the reader a narrow, readable claim. |
| `summary` | Explain what changed without overstating the evidence. |
| `record_type` | Classify the event: release, research, capability signal, product change, public statement, policy response, social effect, proposal, dispute, or open question. |
| `timeline_lanes` | Connect the event to one or more views: chronology, capability, product, frontier voices, social transition, or disputes. |
| `sources` | Link the evidence trail with source type and access date. |
| `evidence_status` | Mark the event as verified, proposed, disputed, or incomplete. |
| `confidence` | State the strength of the current interpretation. |
| `interpretation` | Explain why the event matters without presenting interpretation as fact. |
| `capability_implication` | Describe what the event suggests about progress, limits, or integration. |
| `reliability_note` | Record known failure modes, missing context, or operational limits. |
| `social_implication` | Describe possible effects on work, institutions, access, or everyday life when relevant. |
| `related_events` | Connect parallel lines and cross-sections rather than forcing every idea into one hierarchy. |
| `open_questions` | Preserve questions the current evidence cannot answer. |
| `updated` | Show when the record was last reviewed. |

Not every event needs every optional field. The interface should reveal deeper
layers on demand.

## Source Register

Each source should record:

| Field | Purpose |
| --- | --- |
| `url` | Preserve the original inspectable location. |
| `title` | Identify the source clearly. |
| `publisher` | Name the organization or person responsible. |
| `type` | Classify the source. |
| `published` | Record the original publication date when available. |
| `accessed` | Record when the timeline reviewed the source. |
| `author_or_speaker` | Identify the person behind a post, talk, or statement when relevant. |
| `claim_scope` | State which part of the event the source supports. |
| `consent_status` | For frontier voices, record whether reuse is clearly public, permissioned, pending review, or excluded. |
| `archive_status` | Record whether the original is live, archived, missing, or context-dependent. |
| `note` | Preserve a short review note without copying private excerpts by default. |

## Source Types

Use explicit labels:

- `official_announcement`
- `official_research`
- `official_system_card`
- `official_product_documentation`
- `official_legal_or_policy_document`
- `frontier_voice_post`
- `frontier_voice_talk`
- `external_reporting`
- `independent_research`
- `public_commentary`
- `personal_archive`

## Editorial Rules

1. Begin with verified chronology.
2. Let capability claims cite demonstrations, research, or original statements.
3. Keep forecasts and AGI claims visibly separate from observed events.
4. Pair product progress with reliability limits when the evidence supports it.
5. Treat public posts and talks as attributable voices, not universal truth.
6. Attach social implications as labeled interpretation or response records.
7. Preserve unresolved questions when the evidence trail is incomplete.
8. Allow records to appear in multiple views through cross-links.

## Presentation Order

Within each event card:

1. Record type and date
2. Narrow event claim
3. Short factual summary
4. Evidence status and confidence
5. Expandable sources
6. Expandable interpretation
7. Capability and reliability notes
8. Social implications, related events, and open questions when relevant

This keeps the initial reading calm while preserving depth for inspection.

## Build Sequence

1. Establish the official-source chronology.
2. Add research, system cards, demonstrations, and technical documentation.
3. Build a reviewed frontier-voices register from original public posts and
   talks.
4. Add reliability and integration notes beside relevant capability events.
5. Add clearly labeled social-transition records and open questions.
6. Resolve missing links and archive disappearing sources.
7. Review before publication.
