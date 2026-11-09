# Entity & Personal-Brand SEO (2026)

Added 2026-07-26 after auditing a four-domain personal/product network where
**neither** the personal site nor the company site owned the founder's own name
(both sat at position ~7 for it). The cause was not content. It was entity
fragmentation.

Use this file when the thing being optimised is a *person* or a *small company
spread across several owned domains*, rather than a single product site.

## The core failure: one human, several contradicting entities

Search and AI engines resolve an entity before they trust claims about it.
Resolution fails on **contradiction**, not on absence. Three declarations of the
same person with three different job titles are worse than one declaration.

Real example — a single homepage emitted three `Person` nodes:

| Where | `@id` | `jobTitle` |
|---|---|---|
| `index.html` `@graph` | `shahriarlabs.com/#shihab-shahriar-antor` | "Founder" |
| Team section component | *(none — anonymous node)* | "Founder & Lead Architect" |
| The other domain's site graph | `shihub.online/#person` | "AI Engineer & Founder" |

Three nodes, three titles, no shared identifier. Nothing tells a consumer these
are one human.

## The fix: one `@id`, referenced from everywhere

`@id` in JSON-LD is a **global** identifier. Nothing requires it to live on the
domain currently serving the page — which is exactly what makes it the tool for
this job.

1. **Pick one entity home.** For a person, the personal site's profile page. For
   a company, the company homepage. For a product, wherever the product actually
   lives (usually not the portfolio page describing it).
2. **Every domain references that same `@id`** instead of minting its own node.
3. **Every declaration agrees** on `name`, `jobTitle`, and `sameAs`. Change them
   together or not at all.
4. **`url` and `mainEntityOfPage` point at the entity home**, not at whichever
   site is rendering.

```jsonc
// On BOTH shahriarlabs.com and shihub.online — same @id, same jobTitle.
{
  "@type": "Person",
  "@id": "https://shihub.online/#person",
  "name": "Shihab Shahriar Antor",
  "jobTitle": "AI Engineer & Founder",
  "url": "https://shihub.online/shihab-shahriar-antor",
  "mainEntityOfPage": "https://shihub.online/shihab-shahriar-antor",
  "worksFor": { "@id": "https://shahriarlabs.com/#organization" },
  "sameAs": ["…identical list on both sides…"]
}
```

Anonymous inline nodes are the usual culprit — a team/about component that maps
over an array and emits `Person` objects with no `@id`. Give the array an
`entityId` field and spread it in.

## `sameAs` rules that are routinely broken

- **`sameAs` is for profiles *of the entity*, not things it made.** Putting
  product URLs (`letx.app`, `quantumsketch.app`) in a *person's* `sameAs` asserts
  that the person **is** that website. Products belong in the org's
  `owns`/`brand`, or the person's `creator` relation on the product node.
- **Bidirectional verification.** A profile listed in `sameAs` should list the
  entity home back as its website. One-way links carry little weight; engines
  check both directions before merging identities.
- **Match the host's URL form.** If a domain 308s to trailing-slash, its URLs in
  `sameAs` need the slash. A `sameAs` entry that redirects is a weaker signal.

## Wikidata — the cheapest real lever

Wikidata has **no notability threshold** (unlike Wikipedia) and is the
structured source engines consult to disambiguate people. For a person with no
press coverage it is usually the only knowledge-graph entry obtainable.

Minimum viable item: `instance of: human`, `occupation`, `employer` or
`founder of`, `official website`, plus any verifiable identifier (GitHub
username, ORCID, university thesis record). **Every statement needs a reference
URL** — unsourced items about non-notable living people get removed.

Then add the Q-number to `sameAs` on every owned domain, closing the loop.

## Cross-domain product duplication

When a person runs several sites, the same product often gets a page on each.
Two domains claiming one product splits its signal.

Pick the winner from data, not sentiment — whichever URL already ranks and
converts. Then on the losing domain either:

- **cross-domain canonical** to the winner (keeps the page for human visitors,
  concedes the index entry — the usual right answer for a portfolio case study), or
- **retitle to a non-competing frame** — "How We Built X" rather than "X" — so
  the SERP result reads as *about* the product and the searcher clicks through
  to the real one.

Do **not** reflexively 301. A portfolio page describing your own product has
value to human visitors and to hiring intent that a redirect destroys.

Whichever you choose, keep the sitemap consistent: a sitemap must never list a
URL whose canonical points elsewhere.

## Diagnosing this from GSC in one move

Aggregate the query export for the person's / brand's own name across **all**
owned properties. If two of your domains both appear at position 5–10 for the
same name query and neither is at position 1–2, you have this problem. The name
is being contested by pages you yourself control.
