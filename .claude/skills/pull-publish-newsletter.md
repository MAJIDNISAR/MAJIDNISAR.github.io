---
name: pull-publish-newsletter
description: Pull latest unpublished newsletter articles from LinkedIn or scaffold new issues for THE SYSTEM LAYER and THE HUMAN LAYER
user_invocable: true
---

# Pull & Publish Newsletter

Unified workflow for pulling in and publishing newsletter issues for both **THE SYSTEM LAYER** (`_newsletter/`) and **THE HUMAN LAYER** (`_human_layer/`).

## Trigger Phrases

- "pull newsletter", "new newsletter issue", "scaffold newsletter"
- "publish newsletter", "sync newsletter from LinkedIn"
- "pull-publish-newsletter"

## Workflow

### 1. Determine Intent

Ask (or infer from context):
- **Which newsletter?** `system` | `human` | `both`
- **Mode?**
  - `manual` — scaffold a blank issue with correct front matter (default)
  - `linkedin-rss` — pull latest from LinkedIn RSS feed

### 2. Run the Script

```bash
# Manual scaffold (interactive — fill in title after)
node scripts/pull-newsletter.js --newsletter=<system|human|both> --source=manual

# With title pre-filled
node scripts/pull-newsletter.js --newsletter=system --source=manual --title="Your Title Here"

# Pull from LinkedIn RSS (requires SYSTEM_LAYER_RSS_URL / HUMAN_LAYER_RSS_URL env vars)
node scripts/pull-newsletter.js --newsletter=both --source=linkedin-rss
```

### 3. Post-Scaffold Editing

After the script creates the file(s):

1. **Open the generated file** and fill in the content
2. **Verify front matter** — ensure `title`, `subtitle`, `date`, `issue_number`, `linkedin_url`, `tags` are correct
3. **Add cover image** — place the image at the path specified in `cover-img` front matter field:
   - System Layer: `assets/img/newsletters/system-layer/issue-NN.jpg`
   - Human Layer: `assets/img/newsletters/human-layer/issue-NN.jpg`

### 4. Validate Build

```bash
npm run build:prod
# or: bundle exec jekyll build
```

Verify the issue appears on:
- System Layer: `/writing/newsletter/`
- Human Layer: `/writing/human-layer/`
- Combined Writing page: `/writing/`

### 5. Commit

Follow conventional commit format:
```
feat: add <newsletter-name> issue <N> — <title>
```

## Front Matter Schema (both newsletters)

```yaml
---
title: "..."
subtitle: "..."
date: YYYY-MM-DD
last-updated: YYYY-MM-DD
permalink: /newsletter/issue-NN-slug/ | /human-layer/issue-NN-slug/
layer: systems | human
issue_number: N
newsletter_name: "THE SYSTEM LAYER" | "THE HUMAN LAYER"
linkedin_url: "https://..."
header-logo: "/assets/img/newsletters/{system,human}-layer/logo.png"
cover-img: "/assets/img/newsletters/{system,human}-layer/issue-NN.jpg"
thumbnail-img: "..."
share-img: "..."
tags: [tag1, tag2]
content-type: newsletter
---
```

## Directory Structure

```
_newsletter/          ← THE SYSTEM LAYER issues
  issue-09-coherence-gap.md
  issue-10-trust-debt.md
  ...

_human_layer/         ← THE HUMAN LAYER issues
  issue-01-before-everything-else-there-is-you.md
  issue-02-in-a-world-of-noise-clarity-is-a-human-skill.md
  ...
```

## RSS Environment Variables

For automated LinkedIn RSS sync, set:
- `SYSTEM_LAYER_RSS_URL` — RSS feed URL for The System Layer
- `HUMAN_LAYER_RSS_URL` — RSS feed URL for The Human Layer

These can be set in `.env`, GitHub Actions secrets, or shell environment.
