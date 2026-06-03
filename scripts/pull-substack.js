#!/usr/bin/env node

/**
 * Substack → site sync.
 *
 * Pulls posts from the public Substack RSS feed into the `_substack` collection.
 * Substack is the canonical home; this keeps the site in sync automatically.
 *
 * - Full content from <content:encoded>, subtitle from <description>,
 *   cover image from <enclosure>.
 * - Converts post HTML to Markdown; strips Substack subscribe widgets.
 * - De-dupes by post URL and by normalized title against _substack,
 *   _newsletter, and _human_layer (so cross-posted issues aren't duplicated).
 *
 * Usage:  node scripts/pull-substack.js
 *         SUBSTACK_FEED_URL=https://you.substack.com/feed node scripts/pull-substack.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const FEED_URL = process.env.SUBSTACK_FEED_URL || 'https://majidnisar.substack.com/feed';
const SUBSTACK_HOME = FEED_URL.replace(/\/feed\/?$/, '');
const DIR = path.join(ROOT, '_substack');
const IMG_DIR = '/assets/img/substack/';
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Collections checked to avoid duplicating a cross-posted issue.
const DEDUP_DIRS = ['_substack', '_newsletter', '_human_layer'].map(d => path.join(ROOT, d));

function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': BROWSER_UA } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchURL(res.headers.location).then(resolve, reject);
      }
      let data = '';
      res.on('data', c => { data += c; });
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
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      ensureDir(path.dirname(destPath));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => { fs.writeFileSync(destPath, Buffer.concat(chunks)); resolve(destPath); });
    }).on('error', reject);
  });
}

function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#8220;|&#8221;/g, '"').replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8211;/g, '–').replace(/&#8212;/g, '—').replace(/&#8230;/g, '…')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, ' ');
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeEntities(m[1]).trim() : null;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
}
function normTitle(t) { return (t || '').toLowerCase().replace(/[^a-z0-9]+/g, ''); }
function todayISO() { return new Date().toISOString().split('T')[0]; }
function pad(n) { return String(n).padStart(2, '0'); }

function parseItems(xml) {
  return (xml.match(/<item>([\s\S]*?)<\/item>/gi) || []).map(block => ({
    title: tag(block, 'title') || 'Untitled',
    link: (tag(block, 'link') || '').replace(/[?#].*$/, ''),
    description: tag(block, 'description') || '',
    content: (block.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i) || [, ''])[1],
    pubDate: tag(block, 'pubDate'),
    image: (block.match(/<enclosure[^>]*url="([^"]*)"/i) || [, ''])[1],
  }));
}

function inlineMd(s) {
  return decodeEntities(
    s
      .replace(/<\s*(strong|b)\s*>/gi, '**').replace(/<\/\s*(strong|b)\s*>/gi, '**')
      .replace(/<\s*(em|i)\s*>/gi, '*').replace(/<\/\s*(em|i)\s*>/gi, '*')
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  ).replace(/[ \t]+/g, ' ').trim();
}

// Convert Substack post HTML to Markdown. Drops subscribe widgets, buttons, forms.
function htmlToMarkdown(html) {
  let h = html;
  // Strip non-content / promo blocks.
  h = h.replace(/<form[\s\S]*?<\/form>/gi, '');
  h = h.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  h = h.replace(/<div class="subscription-widget[\s\S]*?<\/div>\s*<\/div>/gi, '');
  h = h.replace(/<div[^>]*class="[^"]*subscribe[^"]*"[\s\S]*?<\/div>/gi, '');
  h = h.replace(/<p class="button-wrapper"[\s\S]*?<\/p>/gi, '');
  h = h.replace(/<a[^>]*class="[^"]*button[^"]*"[\s\S]*?<\/a>/gi, '');

  const out = [];
  // Walk top-level block elements in document order.
  const blockRe = /<(h[1-6]|p|ul|ol|blockquote|figure|hr|pre)\b[^>]*>([\s\S]*?)<\/\1>|<hr\s*\/?>/gi;
  let m;
  while ((m = blockRe.exec(h)) !== null) {
    if (/^<hr/i.test(m[0]) && !m[1]) { out.push('---'); continue; }
    const t = (m[1] || '').toLowerCase();
    const inner = m[2] || '';
    if (/^h[1-6]$/.test(t)) {
      const level = Math.min(parseInt(t[1], 10) + 1, 6);
      const text = inlineMd(inner);
      if (text) out.push('#'.repeat(level) + ' ' + text);
    } else if (t === 'ul') {
      out.push([...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(x => '- ' + inlineMd(x[1])).filter(s => s !== '- ').join('\n'));
    } else if (t === 'ol') {
      out.push([...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((x, i) => `${i + 1}. ` + inlineMd(x[1])).filter(Boolean).join('\n'));
    } else if (t === 'blockquote') {
      out.push(inlineMd(inner).split('\n').map(l => '> ' + l).join('\n'));
    } else if (t === 'pre') {
      out.push('```\n' + inner.replace(/<[^>]+>/g, '') + '\n```');
    } else if (t === 'figure') {
      const img = inner.match(/<img[^>]*src="([^"]*)"/i);
      const cap = inner.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
      if (img) out.push(`![${cap ? inlineMd(cap[1]) : ''}](${img[1]})`);
    } else if (t === 'p') {
      const text = inlineMd(inner);
      if (text) out.push(text);
    }
  }
  return out.filter(b => b && b.trim()).join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

function existingState() {
  const urls = new Set();
  const titles = new Set();
  for (const dir of DEDUP_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.md'))) {
      const c = fs.readFileSync(path.join(dir, f), 'utf8');
      const u = c.match(/(?:substack_url|linkedin_url):\s*"([^"]+)"/);
      if (u) urls.add(u[1]);
      const t = c.match(/^title:\s*"?(.+?)"?\s*$/m);
      if (t) titles.add(normTitle(t[1]));
    }
  }
  return { urls, titles };
}

async function main() {
  console.log('Substack Sync');
  console.log(`  Feed: ${FEED_URL}\n`);
  const xml = await fetchURL(FEED_URL);
  const items = parseItems(xml);
  if (!items.length) { console.log('  No posts in feed.'); return; }
  console.log(`  Found ${items.length} post(s) in feed.`);

  ensureDir(DIR);
  const { urls, titles } = existingState();
  let created = 0;

  for (const item of items) {
    if (urls.has(item.link) || titles.has(normTitle(item.title))) {
      console.log(`  Skipping (already on site): ${item.title}`);
      continue;
    }
    const body = htmlToMarkdown(item.content);
    if (!body) { console.log(`  No content, skipping: ${item.title}`); continue; }

    const date = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : todayISO();
    const slug = slugify(item.title);
    const subtitle = decodeEntities(item.description).replace(/\s+/g, ' ').trim();

    let coverPath = '';
    if (item.image) {
      const dest = path.join(ROOT, IMG_DIR.replace(/^\//, ''), `${slug}.jpg`);
      try { await fetchBinary(item.image, dest); coverPath = `${IMG_DIR}${slug}.jpg`; }
      catch (e) { console.log(`    cover download failed: ${e.message}`); }
    }

    const fm = [
      '---',
      `title: "${item.title.replace(/"/g, "'")}"`,
      subtitle ? `subtitle: "${subtitle.replace(/"/g, "'").slice(0, 200)}"` : null,
      `date: "${date}"`,
      `last-updated: "${date}"`,
      `permalink: /substack/${slug}/`,
      `layer: both`,
      `substack_url: "${item.link}"`,
      coverPath ? `cover-img: "${coverPath}"` : null,
      coverPath ? `thumbnail-img: "${coverPath}"` : null,
      coverPath ? `share-img: "${coverPath}"` : null,
      `tags: [substack, essay]`,
      `content-type: substack`,
      '---',
    ].filter(Boolean).join('\n');

    const full = `${body}

---

*[Read on Substack →](${item.link})*

*Published on [Substack](${SUBSTACK_HOME}). Subscribe to get new posts by email.*
`;
    const filepath = path.join(DIR, `${slug}.md`);
    fs.writeFileSync(filepath, fm + '\n\n' + full.trim() + '\n');
    console.log(`  Created: _substack/${slug}.md`);
    created++;
  }

  console.log(`\n  Created ${created} new post(s). Done.`);
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}

module.exports = { htmlToMarkdown, parseItems };
