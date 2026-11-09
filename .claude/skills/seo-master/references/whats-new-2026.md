# What Changed in 2026 — I/O, Core Update, and Current Guidance

Time-sensitive context. Re-verify before relying on it past late 2026 — search
moves fast. Sources cited inline.

## June–July 2026 (added 2026-07-26)

### May core update completed 2026-06-02; June spam update ran 06-24 → 06-26

The June 2026 spam update was global, all languages, ~2 days, **no new policy
and no named system**. It is the second spam update of the year. 2026 so far:
Discover core update (Feb) → broad core (Mar) → spam (Mar) → broad core (May)
→ spam (Jun).

**Why it matters here:** spam updates tighten detection of *scaled content with
no editorial input*. If a site has published dozens of near-identical posts that
earn zero impressions, that footprint is now a liability rather than dead weight.
Withdrawing them is a defensive move, not just housekeeping — see "Small-site
triage" in SKILL.md.

### Bing Webmaster Tools added 4 AI metrics on 2026-06-16

**Citation Share, Intents, Topics, Compare** — free, in preview, global.

**Citation Share** is the important one: your citations for a query ÷ all
citations shown for that query × 100. It is the first *share* metric (rather
than a raw count) published by a major platform, so it does not inflate with
traffic and can be compared against competitors. This is now the primary
GEO/AEO measurement surface — check it before believing any vendor's
"AI visibility score".

### Cross-engine citation overlap is tiny — confirmed by multiple studies

Roughly **11% of domains are cited by both ChatGPT and Perplexity**. Source mix
differs sharply by engine: Wikipedia ≈47.9% of ChatGPT's top-10 source share;
Reddit ≈46.7% of Perplexity's. Independent studies disagree on the exact
ordering (Peec AI's 30M-source analysis puts Reddit first overall; LLM Pulse
puts YouTube first) but agree on the shape.

**Implication:** "get cited by AI" is not one task. Reddit presence is the
Perplexity lever; Wikipedia/Wikidata is the ChatGPT lever; Brave indexing is the
Claude/coding-agent lever. Budget them separately.

⚠️ **Source-quality warning.** This topic attracts fabricated citations. When
researching it, a delegated web search returned confident findings attributed to
"AuthorityTech.io", "PingPrime.ai", "Leapd.ai", "Akravo.com" and "CrawlVision" —
none verifiable. Verify every load-bearing statistic against a named,
checkable publisher before acting on it, and discard the rest.

### Free-tier documentation is disappearing (a content-strategy signal)

Checked 2026-07-26: Google (Gemini), Cerebras and Mistral have all **stopped
publishing free-tier API rate limits**, redirecting users to a console login.
Only Groq still publishes a per-model table.

This generalises beyond LLM APIs. When primary sources withdraw numbers, most
competing pages keep printing stale figures. **Going to the primary source,
reporting what is and is not published, and dating the check** is a durable
content advantage that survives core updates — and it is the opposite of the
answer-bait the May update demoted.

## Google I/O 2026 (May 2026) — Search is now AI-first

- **Gemini 3.5 Flash is the default model in AI Mode**, rolled out globally.
- **AI Mode passed 1B+ monthly users**; Google says AI Mode queries are
  "more than doubling every quarter."
- **Search box redesign** — called the "biggest upgrade in over 25 years":
  multimodal input (text, images, files, video, Chrome tabs), dynamic expansion,
  AI-powered suggestions.
- **Information agents** — 24/7 agents that monitor the web for changes matching a
  user's criteria (e.g. listings, product drops). Launching for AI Pro & Ultra
  first. Plus agentic **booking, calling businesses, and shopping**.

**SEO implication:** queries are getting **longer, conversational, multimodal, and
multi-turn.** Optimize for *question + follow-up* patterns, not just head
keywords. Self-contained answer passages (134–167 words) that resolve a full
sub-question win — they survive being lifted into an AI answer or a follow-up.

## May 2026 core update

- Second core update of 2026, rollout began **~May 21**, ~2-week completion, **no
  companion blog post / stated target**.
- Overlapped I/O week → hard to isolate cause. Compare pre-May-21 baseline vs
  post-rollout; wait ≥1 week after completion before judging.
- Industry read: it may penalize **sites over-optimizing for AI citations**
  (thin, answer-bait pages with no real depth/E-E-A-T). Aligns with the Gemini
  3.5 Flash AI-feature launch.

**Takeaway:** don't game AEO with shallow Q&A spam. Depth, real expertise, and
genuine fact density beat citation-bait. The penalty risk now cuts the other way.

## Google's stance: "AEO and GEO are still SEO"

On **May 15, 2026**, Google published its first consolidated guide on optimizing
for generative AI features in Search (announced by John Mueller, Search
Relations). Core message: **the fundamentals haven't changed** — helpful,
people-first, well-structured content with strong E-E-A-T is what surfaces in AI
Overviews and AI Mode. There is no separate "AEO/GEO algorithm" to chase for
Google specifically.

What this means in practice:
- Keep doing the foundation in this skill: indexing reach, structured data,
  answer-first content, titles/meta, technical health.
- The *new* part is **multi-engine reach** (Bing/Brave for non-Google AIs) and
  **extractability** (clean structure AI can lift) — not a different ranking game.

## llms.txt — contested, NOT mandatory (corrected stance)

Earlier in this skill `llms.txt` was presented favorably. 2026 reality is mixed:

- **Google Search team:** llms.txt "isn't needed for AI Search." Mueller:
  useful "for documentation, but not for most websites." No major AI engine has
  confirmed it as a ranking/grounding input.
- **Tooling (e.g. Lighthouse default config):** may flag missing llms.txt as an
  error — that's a tooling opinion, not a search-engine requirement.

**Recommendation:** llms.txt is **optional, low priority.** Add it only if you run
docs the user wants agents to consume, or want a clean AI-readable summary —
it costs little. **Do not prioritize it over** real content, structured data, or
indexing reach. Don't treat its absence as a problem.

## Multi-engine grounding still holds (and matters more)

The core 2026 thesis is unchanged and reinforced: **each AI grounds on a
different index.** See `ai-engines-and-indexes.md`. Optimizing only for Google
leaves you invisible to ChatGPT (Bing) and to Claude / coding agents (Brave).

## Quick "is this still current?" checklist

When applying this skill later in 2026+:
- Re-check the **default AI Mode model** (was Gemini 3.5 Flash at I/O 2026).
- Re-check **which index each AI/agent grounds on** — backends shift.
- Re-check **latest core update** date + any stated target in Search Console.
- Re-check Google's generative-AI guidance page for new structured-data signals.
