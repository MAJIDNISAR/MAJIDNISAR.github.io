#!/usr/bin/env node

/**
 * Unified Newsletter Pull & Scaffold Script
 *
 * Supports both THE SYSTEM LAYER (_newsletter/) and THE HUMAN LAYER (_human_layer/).
 * Modes: --source=manual (scaffold blank issue) or --source=linkedin-rss (fetch via RSS).
 *
 * Usage:
 *   node scripts/pull-newsletter.js --newsletter=system --source=manual
 *   node scripts/pull-newsletter.js --newsletter=human  --source=manual
 *   node scripts/pull-newsletter.js --newsletter=both   --source=manual
 *   node scripts/pull-newsletter.js --newsletter=system --source=linkedin-rss
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');

// Load .env (dependency-free) so RSS feed URLs can be configured without exporting them.
function loadDotenv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotenv();

const NEWSLETTERS = {
  system: {
    name: 'THE SYSTEM LAYER',
    dir: path.join(ROOT, '_newsletter'),
    filenamePrefix: 'issue-',
    permalink_prefix: '/newsletter/',
    layer: 'systems',
    linkedin_subscribe: 'https://www.linkedin.com/newsletters/the-system-layer-7422728207159865345/',
    logo: '/assets/img/newsletters/system-layer/logo.png',
    img_dir: '/assets/img/newsletters/system-layer/',
    default_tags: ['systems', 'leadership'],
    badge: 'newsletter',
  },
  human: {
    name: 'THE HUMAN LAYER',
    dir: path.join(ROOT, '_human_layer'),
    filenamePrefix: 'issue-',
    permalink_prefix: '/human-layer/',
    layer: 'human',
    linkedin_subscribe: 'https://www.linkedin.com/newsletters/the-human-layer-7449016048814796800/',
    logo: '/assets/img/newsletters/human-layer/logo.png',
    img_dir: '/assets/img/newsletters/human-layer/',
    default_tags: ['human-layer', 'reflection'],
    badge: 'reflection',
  },
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function detectNextIssueNumber(dir) {
  ensureDir(dir);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  let maxIssue = 0;
  for (const file of files) {
    const match = file.match(/issue-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIssue) maxIssue = num;
    }
  }
  return maxIssue + 1;
}

function padIssue(num) {
  return String(num).padStart(2, '0');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function buildFrontMatter(config, issueNumber, title, subtitle, opts) {
  const slug = slugify(title);
  const date = opts.date || todayISO();
  const tags = opts.tags || config.default_tags;
  const imgFile = `${config.img_dir}issue-${padIssue(issueNumber)}.jpg`;

  const fm = {
    title,
    subtitle,
    date,
    'last-updated': date,
    permalink: `${config.permalink_prefix}issue-${padIssue(issueNumber)}-${slug}/`,
    layer: config.layer,
    issue_number: issueNumber,
    newsletter_name: config.name,
    linkedin_url: opts.linkedin_url || '',
    'header-logo': config.logo,
    'cover-img': imgFile,
    'thumbnail-img': imgFile,
    'share-img': imgFile,
    tags,
    'content-type': 'newsletter',
  };

  const lines = ['---'];
  for (const [key, value] of Object.entries(fm)) {
    if (value === '' || value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.join(', ')}]`);
    } else if (typeof value === 'number') {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: "${value}"`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

function scaffoldManual(newsletterKey, opts) {
  const config = NEWSLETTERS[newsletterKey];
  const issueNumber = opts.issueNumber || detectNextIssueNumber(config.dir);
  const title = opts.title || `Issue ${issueNumber} Title Here`;
  const subtitle = opts.subtitle || 'One-line description of this issue.';

  const frontMatter = buildFrontMatter(config, issueNumber, title, subtitle, opts);
  const body = `
Write your issue content here.

## What It Argues

- Point one
- Point two
- Point three

## Why It Matters

Explain the significance.

---

*[Read the full issue on LinkedIn →](${opts.linkedin_url || config.linkedin_subscribe})*

*${config.name} publishes weekly. Subscribe on [LinkedIn](${config.linkedin_subscribe}).*
`;

  const slug = slugify(title);
  const filename = `issue-${padIssue(issueNumber)}-${slug}.md`;
  const filepath = path.join(config.dir, filename);

  if (fs.existsSync(filepath)) {
    console.log(`Skipping: ${filename} already exists`);
    return null;
  }

  ensureDir(config.dir);
  fs.writeFileSync(filepath, frontMatter + '\n' + body.trim() + '\n');
  console.log(`Created: ${filepath}`);
  return filepath;
}

// Browser UA — LinkedIn serves full server-rendered HTML (issue list + article body) to browsers.
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': BROWSER_UA } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchURL(res.headers.location).then(resolve, reject);
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function fetchBinary(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': BROWSER_UA } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBinary(res.headers.location, destPath).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      ensureDir(path.dirname(destPath));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        fs.writeFileSync(destPath, Buffer.concat(chunks));
        resolve(destPath);
      });
    }).on('error', reject);
  });
}

function extractTag(xml, tagName) {
  const escaped = tagName.replace(':', '\\:');
  const regex = new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)</${escaped}>`, 'i');
  const match = xml.match(regex);
  if (match && match[1]) {
    return match[1]
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
  return null;
}

function parseRSSItems(xml) {
  const items = [];
  const matches = xml.match(/<item[^>]*>([\s\S]*?)<\/item>/gi) || [];
  for (const itemXml of matches) {
    items.push({
      title: extractTag(itemXml, 'title') || 'Untitled',
      description: extractTag(itemXml, 'description') || '',
      content: extractTag(itemXml, 'content:encoded') || extractTag(itemXml, 'description') || '',
      link: extractTag(itemXml, 'link') || '',
      pubDate: extractTag(itemXml, 'pubDate'),
    });
  }
  return items;
}

function extractHashtags(text) {
  return (text.match(/#(\w+)/g) || []).map(t => t.substring(1)).slice(0, 5);
}

function existingLinkedInURLs(dir) {
  ensureDir(dir);
  const urls = new Set();
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const match = content.match(/linkedin_url:\s*"([^"]+)"/);
    if (match) urls.add(match[1]);
  }
  return urls;
}

// --- LinkedIn direct-scrape support (no RSS feed / API needed) ---

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// Pull /pulse/ article links from a newsletter landing page, preserving order, de-duped.
function extractArticleLinks(landingHtml) {
  const seen = new Set();
  const links = [];
  const re = /href="(https:\/\/www\.linkedin\.com\/pulse\/[^"#?]+)/gi;
  let m;
  while ((m = re.exec(landingHtml)) !== null) {
    const url = m[1];
    if (!seen.has(url)) { seen.add(url); links.push(url); }
  }
  return links;
}

function parseJsonLd(html) {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

// Derive a clean title + issue number from LinkedIn's JSON-LD `name`.
// Handles: "Issue #15: The Complexity Threshold", "The System Layer Issue 11: ...",
//          "The Human Layer — Issue #5\nThe Fear of Being Wrong".
function parseTitleAndIssue(name) {
  const clean = decodeEntities((name || '').trim());
  const im = clean.match(/issue\s*#?\s*(\d+)/i);
  const issueNumber = im ? parseInt(im[1], 10) : null;

  const parts = clean.split(/\n+/).map(s => s.trim()).filter(Boolean);
  let title;
  let subtitle = '';
  if (parts.length > 1) {
    // Lines that are not the "The System Layer — Issue #N" label.
    const contentLines = parts.filter(p =>
      !/issue\s*#?\s*\d+/i.test(p) && !/^the (system|human) layer/i.test(p));
    title = contentLines[0] || parts[parts.length - 1];
    // A third line (after label + title) is LinkedIn's tagline — use as subtitle.
    if (contentLines.length > 1) subtitle = contentLines[1];
  } else {
    title = parts[0].replace(/^.*?issue\s*#?\s*\d+\s*[:—–-]\s*/i, '').trim();
    if (!title) title = parts[0];
  }
  title = title.replace(/^the (system|human) layer\s*[—–:-]\s*/i, '').trim();
  return { title, issueNumber, subtitle };
}

function inlineToMarkdown(s) {
  return decodeEntities(
    s
      .replace(/<\s*(strong|b)\s*>/gi, '**').replace(/<\/\s*(strong|b)\s*>/gi, '**')
      .replace(/<\s*(em|i)\s*>/gi, '*').replace(/<\/\s*(em|i)\s*>/gi, '*')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
      .replace(/<[^>]*>/g, '')
  ).replace(/[ \t]+/g, ' ').trim();
}

function blockToMarkdown(inner) {
  inner = inner.replace(/<!---->/g, '');
  const h = inner.match(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/i);
  if (h) {
    const text = inlineToMarkdown(h[2]);
    return text ? `## ${text}` : '';
  }
  if (/<ul[\s>]/i.test(inner)) {
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map(x => inlineToMarkdown(x[1])).filter(Boolean);
    return items.map(t => `- ${t}`).join('\n');
  }
  if (/<ol[\s>]/i.test(inner)) {
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map(x => inlineToMarkdown(x[1])).filter(Boolean);
    return items.map((t, i) => `${i + 1}. ${t}`).join('\n');
  }
  return inlineToMarkdown(inner);
}

// Extract the article body as Markdown. Only LinkedIn "publishing-text-block"
// divs and "publishing-divider-block" rules are kept — this excludes the injected
// "Recommended by LinkedIn" widget, comments, and related-article cards.
function extractBodyMarkdown(articleHtml) {
  const startIdx = articleHtml.indexOf('data-test-id="article-content-blocks"');
  if (startIdx === -1) return '';
  const endIdx = articleHtml.indexOf('</article>', startIdx);
  const region = articleHtml.slice(startIdx, endIdx === -1 ? undefined : endIdx);

  const blocks = [];
  const re = /<hr[^>]*data-test-id="publishing-divider-block"[^>]*>|<div[^>]*data-test-id="publishing-text-block"[^>]*>([\s\S]*?)<\/div>/gi;
  let m;
  while ((m = re.exec(region)) !== null) {
    if (m[0].toLowerCase().startsWith('<hr')) { blocks.push('---'); continue; }
    const md = blockToMarkdown(m[1]);
    if (md && md.trim()) blocks.push(md.trim());
  }
  // Collapse leading/trailing dividers and doubled dividers.
  const cleaned = [];
  for (const b of blocks) {
    if (b === '---' && (cleaned.length === 0 || cleaned[cleaned.length - 1] === '---')) continue;
    cleaned.push(b);
  }
  while (cleaned.length && cleaned[cleaned.length - 1] === '---') cleaned.pop();
  return cleaned.join('\n\n');
}

// Remove unpopulated scaffold stubs (still containing the placeholder marker) so a
// blank "Issue N Title Here" never sits at the top of the archive once real content exists.
function removeScaffoldStubs(dir) {
  ensureDir(dir);
  const removed = [];
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
    const full = path.join(dir, file);
    const content = fs.readFileSync(full, 'utf8');
    if (content.includes('Write your issue content here.') || /title:\s*"Issue \d+ Title Here"/.test(content)) {
      fs.unlinkSync(full);
      removed.push(file);
    }
  }
  return removed;
}

async function pullFromScrape(newsletterKey, explicitUrl) {
  const config = NEWSLETTERS[newsletterKey];
  let links;

  if (explicitUrl) {
    // Pull one specific article (e.g. an issue paginated off the public landing page).
    links = [explicitUrl];
    console.log(`Pulling explicit article into ${config.name}: ${explicitUrl}`);
  } else {
    const landingUrl = config.linkedin_subscribe;
    console.log(`Scraping ${config.name} from ${landingUrl}`);
    const landingHtml = await fetchURL(landingUrl);
    links = extractArticleLinks(landingHtml);
    if (links.length === 0) {
      console.log(`  No article links found on landing page.`);
      return [];
    }
    console.log(`  Found ${links.length} article link(s).`);

    const removedStubs = removeScaffoldStubs(config.dir);
    for (const f of removedStubs) console.log(`  Removed blank scaffold stub: ${f}`);
  }

  const existing = existingLinkedInURLs(config.dir);
  let nextIssue = detectNextIssueNumber(config.dir);
  const created = [];

  for (const link of links) {
    if (existing.has(link)) {
      console.log(`  Skipping (already on site): ${link.split('/').pop()}`);
      continue;
    }

    let articleHtml;
    try {
      articleHtml = await fetchURL(link);
    } catch (err) {
      console.log(`  Failed to fetch ${link}: ${err.message}`);
      continue;
    }

    const ld = parseJsonLd(articleHtml) || {};
    const { title, issueNumber, subtitle: nameSubtitle } = parseTitleAndIssue(ld.name || ld.headline || 'Untitled');
    const body = extractBodyMarkdown(articleHtml);
    if (!body) {
      console.log(`  No body extracted, skipping: ${title}`);
      continue;
    }
    // Prefer the tagline embedded in the title; otherwise use the first real body
    // paragraph (more reliable than ld.headline, which is mangled for older issues).
    const firstPara = body
      .split(/\n\n+/)
      .map(s => s.trim())
      .find(s => s && s !== '---' && !s.startsWith('#') && !s.startsWith('-'));
    let subtitle = nameSubtitle || firstPara || '';
    if (subtitle.length > 160) subtitle = subtitle.slice(0, 157).replace(/\s+\S*$/, '') + '…';
    const date = ld.datePublished
      ? new Date(ld.datePublished).toISOString().split('T')[0]
      : todayISO();
    const finalIssue = issueNumber || nextIssue;

    const frontMatter = buildFrontMatter(config, finalIssue, title, subtitle, {
      date,
      tags: config.default_tags,
      linkedin_url: link,
    });

    const slug = slugify(title);
    const filename = `issue-${padIssue(finalIssue)}-${slug}.md`;
    const filepath = path.join(config.dir, filename);

    const fullBody = `${body}

---

*[Read the full issue on LinkedIn →](${link})*

*${config.name} publishes on LinkedIn. Subscribe [here](${config.linkedin_subscribe}).*
`;
    fs.writeFileSync(filepath, frontMatter + '\n\n' + fullBody.trim() + '\n');
    console.log(`  Created: ${filename} (issue ${finalIssue})`);

    // Best-effort cover image download to the site's local convention.
    const imgUrl = ld.image && (ld.image.url || (Array.isArray(ld.image) && ld.image[0] && ld.image[0].url));
    if (imgUrl) {
      const imgDest = path.join(ROOT, config.img_dir.replace(/^\//, ''), `issue-${padIssue(finalIssue)}.jpg`);
      try {
        await fetchBinary(imgUrl, imgDest);
        console.log(`    Cover image saved: ${path.relative(ROOT, imgDest)}`);
      } catch (err) {
        console.log(`    Cover image download failed (${err.message}); front matter still references local path.`);
      }
    }

    created.push(filepath);
    existing.add(link);
    if (!issueNumber) nextIssue++;
  }

  console.log(`  Created ${created.length} new issue(s) for ${config.name}.`);
  return created;
}

async function pullFromRSS(newsletterKey) {
  const config = NEWSLETTERS[newsletterKey];
  const envKey = newsletterKey === 'system'
    ? 'SYSTEM_LAYER_RSS_URL'
    : 'HUMAN_LAYER_RSS_URL';
  const rssUrl = process.env[envKey];

  if (!rssUrl) {
    console.log(`No ${envKey} set. Skipping RSS pull for ${config.name}.`);
    console.log(`  Set ${envKey} to enable RSS sync.`);
    return [];
  }

  console.log(`Fetching RSS for ${config.name}...`);
  const xml = await fetchURL(rssUrl);
  const items = parseRSSItems(xml);

  if (items.length === 0) {
    console.log(`  No items found in RSS feed.`);
    return [];
  }

  const existing = existingLinkedInURLs(config.dir);
  const created = [];
  let nextIssue = detectNextIssueNumber(config.dir);

  for (const item of items) {
    if (existing.has(item.link)) {
      console.log(`  Skipping (already exists): ${item.title}`);
      continue;
    }

    const cleanContent = item.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const tags = extractHashtags(item.content);
    const finalTags = tags.length > 0 ? tags : config.default_tags;
    const date = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : todayISO();

    const filepath = scaffoldManual(newsletterKey, {
      issueNumber: nextIssue,
      title: item.title,
      subtitle: cleanContent.substring(0, 150),
      date,
      tags: finalTags,
      linkedin_url: item.link,
    });

    if (filepath) {
      // Overwrite body with actual content
      const file = fs.readFileSync(filepath, 'utf8');
      const fmEnd = file.indexOf('---', 4);
      const frontMatter = file.substring(0, fmEnd + 3);
      const body = `

${item.content}

---

*[Read the full issue on LinkedIn →](${item.link})*

*${config.name} publishes weekly. Subscribe on [LinkedIn](${config.linkedin_subscribe}).*
`;
      fs.writeFileSync(filepath, frontMatter + '\n' + body.trim() + '\n');
      created.push(filepath);
      nextIssue++;
    }
  }

  console.log(`  Created ${created.length} new issue(s) for ${config.name}.`);
  return created;
}

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--(\w[\w-]*)=(.+)$/);
    if (match) {
      args[match[1]] = match[2];
    } else if (arg.startsWith('--')) {
      args[arg.replace(/^--/, '')] = true;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const newsletter = args.newsletter || 'both';
  const source = args.source || 'manual';
  const title = args.title;
  const subtitle = args.subtitle;
  const issueNumber = args['issue-number'] ? parseInt(args['issue-number'], 10) : undefined;

  const targets = newsletter === 'both'
    ? ['system', 'human']
    : [newsletter];

  for (const key of targets) {
    if (!NEWSLETTERS[key]) {
      console.error(`Unknown newsletter: ${key}. Use "system", "human", or "both".`);
      process.exit(1);
    }
  }

  console.log(`Newsletter Pull & Publish`);
  console.log(`  Newsletters: ${targets.join(', ')}`);
  console.log(`  Source: ${source}`);
  console.log('');

  for (const key of targets) {
    if (source === 'manual') {
      scaffoldManual(key, { title, subtitle, issueNumber });
    } else if (source === 'linkedin-rss') {
      await pullFromRSS(key);
    } else if (source === 'linkedin-scrape') {
      if (args.url && newsletter === 'both') {
        console.error('--url requires --newsletter=system or --newsletter=human (not both).');
        process.exit(1);
      }
      if (args.url) {
        // Accept one URL or a comma-separated list of URLs (batch pull).
        const urls = String(args.url).split(',').map(u => u.trim()).filter(Boolean);
        for (const u of urls) {
          await pullFromScrape(key, u.replace(/[?#].*$/, ''));
        }
      } else {
        await pullFromScrape(key);
      }
    } else {
      console.error(`Unknown source: ${source}. Use "manual", "linkedin-rss", or "linkedin-scrape".`);
      process.exit(1);
    }
  }

  console.log('\nDone.');
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  scaffoldManual, pullFromRSS, pullFromScrape, NEWSLETTERS, detectNextIssueNumber,
  parseTitleAndIssue, extractBodyMarkdown, extractArticleLinks,
};
