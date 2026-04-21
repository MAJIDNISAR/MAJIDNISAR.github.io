# Implementation Plan: Newsletter Pull & Publish Skill + Script

## Problem Statement

The site has **two newsletters** with **inconsistent storage** and **no unified pull-publish workflow**:

| Newsletter | Storage | Collection | Archive Page |
|-----------|---------|-----------|-------------|
| THE SYSTEM LAYER | `_newsletter/*.md` | `site.newsletter` | `/writing/newsletter/` |
| THE HUMAN LAYER | `_posts/*.md` (with `series: "the-human-layer"`) | `site.posts` filtered | `/writing/human-layer/` |

**Current scripts** (`sync-linkedin.js`, `sync-linkedin-rss.js`) exist but:
- Don't distinguish between the two newsletters
- Require LinkedIn API tokens or RSS URLs (not configured)
- Don't generate correct front matter for either newsletter format
- No Claude Code skill wraps them

## Task Type
- [x] Backend (script + skill)
- [x] Frontend (unified UI template)
- [x] Fullstack

## Technical Solution

### Architecture Decision: Unified Collection Model

Create a `_human_layer/` collection (mirroring `_newsletter/`) so **both newsletters** use dedicated Jekyll collections with identical front matter patterns. This gives:
- Consistent `site.newsletter` / `site.human_layer` access
- Same card template for both
- Clean separation from blog posts

### The Script: `scripts/pull-newsletter.js`

A single Node.js script that:
1. Accepts `--newsletter=system|human|both` and `--source=linkedin-rss|linkedin-api|manual`
2. For RSS/API: fetches latest articles, detects which are already on-site (by `linkedin_url` or title match), generates markdown for new ones
3. For manual: scaffolds a blank issue with correct front matter (next issue number auto-detected)
4. Outputs files to `_newsletter/` or `_human_layer/` with the correct front matter schema

**Front matter schema (unified):**
```yaml
---
title: "..."
subtitle: "..."
date: YYYY-MM-DD
issue_number: N
newsletter_name: "THE SYSTEM LAYER" | "THE HUMAN LAYER"
permalink: /newsletter/:title/ | /human-layer/:title/
linkedin_url: "https://..."
header-logo: "/assets/img/newsletters/{system,human}-layer/logo.png"
cover-img: "..."
thumbnail-img: "..."
share-img: "..."
tags: [...]
content-type: newsletter
layer: systems | human
---
```

### The Skill: `.claude/skills/pull-publish-newsletter.md`

A Claude Code skill invoked via `/pull-publish-newsletter` that:
1. Asks which newsletter (system/human/both) and source (rss/manual)
2. Runs the script
3. Opens the generated file(s) for editing
4. Validates front matter
5. Optionally runs `jekyll build` to verify

### Unified UI Include: `_includes/newsletter-archive-card.html`

A single parameterized include that renders a newsletter issue card, used by both archive pages. Replaces the duplicated card markup in `writing/newsletter.html` and `writing/human-layer.html`.

Parameters: `issue`, `variant` (systems|human)

## Implementation Steps

### Step 1 — Create `_human_layer/` collection + migrate existing posts
- Add `human_layer` collection to `_config.yml` with `output: true` and `permalink: /human-layer/:title/`
- Move the 2 existing Human Layer posts from `_posts/` to `_human_layer/` with updated front matter
- Add defaults scope for `_human_layer` collection
- **Deliverable**: Both newsletters in dedicated collections

### Step 2 — Create unified card include `_includes/newsletter-archive-card.html`
- Extract the shared card markup from both archive pages
- Accept `issue` and `variant` parameters
- Use the existing `layer-archive__card` CSS classes (already support `--systems` and `--human` variants)
- **Deliverable**: Single reusable card template

### Step 3 — Update archive pages to use the shared include
- Refactor `writing/newsletter.html` to use `{% include newsletter-archive-card.html issue=issue variant="systems" %}`
- Refactor `writing/human-layer.html` to use `site.human_layer` collection + shared include with `variant="human"`
- **Deliverable**: Both archives render identically via shared template

### Step 4 — Create `scripts/pull-newsletter.js`
- Unified pull script with `--newsletter`, `--source`, `--issue-number` flags
- RSS source: fetch + parse + deduplicate + generate markdown
- Manual source: scaffold blank issue with auto-incremented issue number
- LinkedIn API source: existing logic from `sync-linkedin.js` adapted
- Validate output front matter before writing
- **Deliverable**: Working CLI script

### Step 5 — Create the Claude Code skill `.claude/skills/pull-publish-newsletter.md`
- Skill definition with trigger phrases, parameters, and workflow
- Calls `scripts/pull-newsletter.js` under the hood
- Includes post-scaffold editing guidance
- **Deliverable**: `/pull-publish-newsletter` skill

### Step 6 — Update GitHub Actions workflow
- Update `.github/workflows/linkedin-sync.yml` to use new unified script
- Support both newsletters via matrix or sequential calls
- **Deliverable**: CI/CD pulls both newsletters on schedule

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `_config.yml` | Modify | Add `human_layer` collection + defaults |
| `_human_layer/` (new dir) | Create | New collection directory |
| `_human_layer/issue-01-*.md` | Create | Migrated from `_posts/2026-04-12-the-human-layer-*` |
| `_human_layer/issue-02-*.md` | Create | Migrated from `_posts/2026-04-13-the-human-layer-*` |
| `_posts/2026-04-12-the-human-layer-*.md` | Delete | Moved to collection |
| `_posts/2026-04-13-the-human-layer-*.md` | Delete | Moved to collection |
| `_includes/newsletter-archive-card.html` | Create | Shared card template |
| `writing/newsletter.html` | Modify | Use shared include |
| `writing/human-layer.html` | Modify | Use `site.human_layer` + shared include |
| `scripts/pull-newsletter.js` | Create | Unified pull script |
| `.claude/skills/pull-publish-newsletter.md` | Create | Claude Code skill |
| `.github/workflows/linkedin-sync.yml` | Modify | Use unified script |
| `_includes/human-layer-cta.html` | Modify | Use `site.human_layer.size` instead of post filter |
| `_layouts/page.html` | Minor | Verify CTA logic still works |

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Moving Human Layer from `_posts/` to `_human_layer/` breaks existing URLs | Keep same `permalink` values; add Jekyll redirect if needed |
| Human Layer CTA/archive counts break | Update all `site.posts \| where: "series"` references to `site.human_layer` |
| LinkedIn RSS may not separate the two newsletters | Script uses newsletter name / URL pattern matching to route to correct collection |
| Existing `sync-linkedin.js` still referenced in CI | Update workflow; keep old script as fallback until verified |

## SESSION_ID (for /ccg:execute use)
- CODEX_SESSION: N/A (local analysis only)
- GEMINI_SESSION: N/A (local analysis only)
