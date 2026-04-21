# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
bundle install
npm install

# Development server with live reload
npm run dev
# or: bundle exec jekyll serve --livereload --port 4000

# Include draft posts
bundle exec jekyll serve --livereload --drafts --port 4000

# Production build
npm run build:prod

# Lint JavaScript
npm run lint
npm run lint -- --fix

# Jekyll diagnostics
bundle exec jekyll doctor

# Newsletter management
npm run newsletter:scaffold              # Scaffold blank issue for both newsletters
npm run newsletter:scaffold:system       # Scaffold System Layer issue only
npm run newsletter:scaffold:human        # Scaffold Human Layer issue only
npm run newsletter:pull                  # Pull both from LinkedIn RSS
node scripts/pull-newsletter.js --newsletter=system --source=manual --title="Your Title"
```

The site is served at `http://localhost:4000`.

## Architecture

This is a **Jekyll static site** based on the [Beautiful Jekyll](https://beautifuljekyll.com/) theme (v5.0.0), deployed to GitHub Pages at `majidnisar.com`. It is a personal website and blog for Majid Nisar covering software engineering, AI integration, and cybersecurity.

### Layout hierarchy

```
_layouts/base.html        ← Root HTML shell; loads all CSS/JS, nav, footer
  └── _layouts/post.html  ← Blog post wrapper (content + tags + comments + pagination)
  └── _layouts/page.html  ← Static page wrapper
  └── _layouts/home.html  ← Homepage with paginated post list
  └── _layouts/minimal.html ← Bare layout (no nav/footer)
```

`base.html` defines the common JS/CSS assets in its YAML front matter (`common-css`, `common-js`, `common-ext-css`, `common-ext-js`). Every layout inherits these.

### Key files

- `_config.yml` — All site-wide settings: title, navbar links, colors, analytics (GA4 `G-3WBJ12R9ED`), comments (Disqus `majidnisar143`), pagination (5 posts/page), permalink format (`/:year/:month/:day/:title`)
- `index.html` — Homepage; uses `layout: page` with custom hero sections and a paginated post list via `jekyll-paginate`
- `aboutme.html` — About page; injects `skills.html` and `newsletter.html` via `after-content`
- `_posts/` — Blog posts; must follow `YYYY-MM-DD-title.md` naming convention
- `_newsletter/` — THE SYSTEM LAYER issues (Jekyll collection, `site.newsletter`)
- `_human_layer/` — THE HUMAN LAYER issues (Jekyll collection, `site.human_layer`)
- `scripts/pull-newsletter.js` — Unified pull/scaffold script for both newsletters

### Custom additions on top of Beautiful Jekyll

These files were added beyond the base theme:

| File | Purpose |
|------|---------|
| `assets/css/modern-design.css` | Custom design overrides (loaded in `base.html`) |
| `assets/js/modern-features.js` | Dark mode toggle, reading progress bar, search overlay, TOC sidebar |
| `_includes/theme-toggle.html` | Dark/light mode button (fixed, top-right) |
| `_includes/reading-progress.html` | Progress bar at top of page |
| `_includes/search-overlay.html` | Full-screen search overlay (keyboard: Ctrl/Cmd+K) |
| `_includes/toc-sidebar.html` | Sticky TOC, desktop only (≥1200px) |
| `_includes/newsletter.html` | Newsletter subscription form |
| `_includes/newsletter-archive-card.html` | Shared card template for both newsletter archives |
| `_includes/skills.html` | Skills card grid |
| `assets/css/aboutme.css` | About page–specific styles |
| `scripts/sync-linkedin.js` | LinkedIn content sync script (`npm run sync:linkedin`) |

### Post front matter

Required for all posts:
```yaml
---
layout: post      # default; set in _config.yml
title: "..."
tags: [tag1, tag2]
---
```

Optional useful params: `subtitle`, `cover-img`, `thumbnail-img`, `readtime: true`, `comments: false`, `social-share: false`, `gh-repo`, `gh-badge`.

### CI

`.github/workflows/ci.yml` runs `jekyll build --future` inside `jekyll/builder:3.8` Docker container on every push and PR. There are no automated tests beyond the build itself.

### Plugins

- `jekyll-paginate` — Post pagination (5 per page, homepage only)
- `jekyll-sitemap` — Auto-generates `/sitemap.xml`
