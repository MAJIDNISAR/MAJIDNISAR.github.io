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

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': 'MajidNisar-Newsletter-Sync/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchURL(res.headers.location).then(resolve, reject);
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
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
    } else {
      console.error(`Unknown source: ${source}. Use "manual" or "linkedin-rss".`);
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

module.exports = { scaffoldManual, pullFromRSS, NEWSLETTERS, detectNextIssueNumber };
