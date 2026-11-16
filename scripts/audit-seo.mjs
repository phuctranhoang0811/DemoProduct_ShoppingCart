// SEO audit: crawls every URL in the sitemap and fails (exit code 1) when a page breaks a rule.
//
//   node scripts/audit-seo.mjs [base-url]
//   SEO_AUDIT_URL=https://staging.example.com npm run audit:seo
//
// The base URL is where pages are fetched from. Canonical URLs are compared with the sitemap's own
// <loc> values, so a build whose public origin differs from the host being audited still passes.

const BASE_URL = (process.argv[2] || process.env.SEO_AUDIT_URL || 'http://localhost:3000').replace(/\/+$/, '');

const PRIVATE_PATHS = ['/admin', '/employee', '/account', '/orders', '/cart', '/checkout', '/login'];
const TITLE_MAX = 70;
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 320;

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const attr = (html, pattern) => {
  const match = html.match(pattern);
  return match ? decode(match[1]).trim() : null;
};

function jsonLd(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const parsed = [];
  const errors = [];
  for (const [, raw] of blocks) {
    try {
      parsed.push(JSON.parse(raw));
    } catch {
      errors.push('JSON-LD block is not valid JSON');
    }
  }
  return { parsed, errors };
}

const hasType = (node, type) => [].concat(node['@type'] ?? []).includes(type);

function auditPage(loc, status, html) {
  const problems = [];
  const path = new URL(loc).pathname;

  if (status !== 200) return [`responded ${status}`];

  const title = attr(html, /<title>([\s\S]*?)<\/title>/);
  if (!title) problems.push('missing <title>');
  else if (title.length > TITLE_MAX) problems.push(`title is ${title.length} characters (max ${TITLE_MAX})`);

  const description = attr(html, /<meta name="description" content="([^"]*)"/);
  if (!description) problems.push('missing meta description');
  else if (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX) {
    problems.push(`meta description is ${description.length} characters (expected ${DESCRIPTION_MIN}-${DESCRIPTION_MAX})`);
  }

  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
  if (!canonical) problems.push('missing canonical link');
  else if (canonical.replace(/\/$/, '') !== loc.replace(/\/$/, '')) problems.push(`canonical is ${canonical}, sitemap lists ${loc}`);

  if (/<meta name="robots" content="[^"]*noindex/i.test(html)) problems.push('page in sitemap is marked noindex');
  if (!attr(html, /<meta property="og:title" content="([^"]*)"/)) problems.push('missing og:title');

  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count !== 1) problems.push(`${h1Count} <h1> elements (expected exactly 1)`);

  const { parsed, errors } = jsonLd(html);
  problems.push(...errors);
  if (parsed.length === 0) problems.push('no JSON-LD structured data');

  if (path.startsWith('/product/')) {
    const product = parsed.find((node) => hasType(node, 'Product'));
    if (!product) {
      problems.push('product page without Product structured data');
    } else {
      if (!(Number(product.offers?.price) > 0)) problems.push('Product offer has no price');
      if (!/schema\.org\/(InStock|OutOfStock)$/.test(product.offers?.availability ?? '')) {
        problems.push('Product offer has no availability');
      }
      // A rating must be backed by real reviews that are on the page, or search engines treat it as spam.
      const rating = product.aggregateRating;
      if (rating && !(Number(rating.reviewCount) > 0 && (product.review?.length ?? 0) > 0)) {
        problems.push('aggregateRating without matching reviews');
      }
    }
    if (!parsed.some((node) => hasType(node, 'BreadcrumbList'))) problems.push('product page without breadcrumbs');
  }

  if (path === '/shop' || path.startsWith('/category/')) {
    // The listing has to be in the server-rendered HTML, not filled in later by JavaScript.
    if (!/<main[\s\S]*href="\/product\/[^"]+"/.test(html)) problems.push('listing has no product links in server-rendered HTML');
  }

  return problems;
}

async function get(url) {
  const res = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'seo-audit' } });
  return { status: res.status, body: await res.text() };
}

async function main() {
  console.log(`\nSEO audit of ${BASE_URL}\n`);
  const failures = [];
  const fail = (where, problem) => failures.push(`${where}: ${problem}`);

  const robots = await get(`${BASE_URL}/robots.txt`);
  if (robots.status !== 200) fail('/robots.txt', `responded ${robots.status}`);
  if (!/^Sitemap:\s*\S+\/sitemap\.xml/im.test(robots.body)) fail('/robots.txt', 'does not point to the sitemap');
  for (const path of ['/admin', '/checkout', '/account']) {
    if (!new RegExp(`^Disallow:\\s*${path}\\b`, 'im').test(robots.body)) fail('/robots.txt', `does not disallow ${path}`);
  }

  const sitemap = await get(`${BASE_URL}/sitemap.xml`);
  if (sitemap.status !== 200) {
    console.error(`sitemap.xml responded ${sitemap.status}; nothing to audit.`);
    process.exit(1);
  }

  const locs = [...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decode(m[1]));
  if (locs.length === 0) fail('/sitemap.xml', 'lists no URLs');

  const origins = new Set(locs.map((loc) => new URL(loc).origin));
  if (origins.size > 1) fail('/sitemap.xml', `mixes origins: ${[...origins].join(', ')}`);
  if (new Set(locs).size !== locs.length) fail('/sitemap.xml', 'lists a URL more than once');
  if (!locs.some((loc) => new URL(loc).pathname.startsWith('/product/'))) fail('/sitemap.xml', 'lists no product pages');
  if (!locs.some((loc) => new URL(loc).pathname.startsWith('/category/'))) fail('/sitemap.xml', 'lists no category pages');

  const titles = new Map();
  const rows = [];

  for (const loc of locs) {
    const url = new URL(loc);
    const path = url.pathname + url.search;

    if (url.search) fail(path, 'sitemap URL has a query string');
    if (PRIVATE_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) fail(path, 'private page listed in the sitemap');

    let problems;
    try {
      const page = await get(BASE_URL + path);
      problems = auditPage(loc, page.status, page.body);

      const title = attr(page.body, /<title>([\s\S]*?)<\/title>/);
      if (title) titles.set(title, [...(titles.get(title) ?? []), path]);
    } catch (error) {
      problems = [`could not be fetched (${error.message})`];
    }

    problems.forEach((problem) => fail(path, problem));
    rows.push({ page: path.length > 48 ? `${path.slice(0, 45)}...` : path, result: problems.length ? `${problems.length} problem(s)` : 'ok' });
  }

  for (const [title, paths] of titles) {
    if (paths.length > 1) fail(paths.join(', '), `share the title "${title}"`);
  }

  console.table(rows);

  if (failures.length > 0) {
    console.error(`\n${failures.length} problem(s) found:\n`);
    failures.forEach((failure) => console.error(`  - ${failure}`));
    console.error('');
    process.exit(1);
  }

  console.log(`\nAll ${locs.length} pages passed.\n`);
}

main().catch((error) => {
  console.error('SEO audit could not run:', error);
  process.exit(1);
});
