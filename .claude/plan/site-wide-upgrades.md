# Implementation Plan: Site-Wide Upgrades

## Context
Full audit of 22 pages reveals 11 rich pages, 9 thin pages, and 2 stubs. The site has strong flagship pages (homepage, leadership, case studies) but several pages lack depth, visual polish, or proper layer identity. This plan prioritizes upgrades by impact.

## Task Type
- [x] Frontend (HTML + CSS)
- [ ] Backend
- [ ] Fullstack

---

## Priority 1: Homepage Balance (Quick Win)

### 1A. Restore dual-layer gateway identity
**File**: `index.html`
- Change `layer: systems` → `layer: gateway`
- Replace `exec-hero` with gateway dual-panel hero (Systems panel left, Human panel right) — CSS already exists in `layers.css`
- Keep all executive content sections below the hero
- Add `{% include human-layer-cta.html %}` after `{% include newsletter-cta.html %}`

**Impact**: The homepage currently feels one-dimensional. This makes it a true bridge page.

---

## Priority 2: Thin Pages → Rich Pages (Biggest content gap)

### 2A. Now page (`now.md`)
**Current**: 5 sparse sections, 2-4 lines each
**Upgrade**:
- Add layer: `human`, custom wrapper class
- Add a "Last updated" timestamp with formatted date
- Expand each section to 3-5 sentences
- Add "What I'm not doing" section (shows focus discipline)
- Add a "Previously" collapsed section for past Now entries
- Style with warm Human Layer aesthetic (amber accents, Cormorant headings)

### 2B. Poetry page (`poetry.html`)
**Current**: Intro paragraph + Jekyll loop grid
**Upgrade**:
- Add a featured/pinned poem at top (full text displayed, not just a card)
- Add a "About this collection" block explaining the Kashmir poetry voice
- Add tag/theme filters (already in HTML but unstyled)
- Add Human Layer newsletter CTA at bottom
- Dedicated `poetry.css` exists but verify it's being loaded

### 2C. Photography page (`photography.html`)
**Current**: Intro + masonry grid from collection
**Upgrade**:
- Add a hero image (full-width featured photo from Kashmir)
- Add "About the photography" block — why Kashmir landscapes, what gear, philosophy
- Add location/series grouping (if photos have location tags)
- Add lightbox integration (photo-lightbox.js exists but verify it's connected)
- Human Layer newsletter CTA at bottom

### 2D. Writing Hub (`writing.html`)
**Current**: Topic map + filter UI + Jekyll loops
**Upgrade**:
- Add a "Featured" or "Start here" section at top with 3 hand-picked essays
- Add reading time estimates to writing cards (JS already exists in ui-enhancements.js)
- Add both newsletter CTAs (System Layer + Human Layer) at bottom
- Ensure layer badges on cards are visually distinct

### 2E. Newsletter pages (`writing/newsletter.html`, `writing/human-layer.html`)
**Current**: Masthead + subscription CTA + Jekyll loop
**Upgrade**:
- Add issue count dynamically: "{{ site.newsletter.size }} issues published"
- Add a "What to expect" section (frequency, topics, tone)
- Add a featured/latest issue card with full excerpt at top
- Add social proof: "Read by engineering leaders at..." or subscriber count
- Cross-link: System Layer page should mention Human Layer and vice versa

---

## Priority 3: Stub Pages (Fix or Remove)

### 3A. Code Samples (`code.html`)
**Current**: Empty conditional — "Code samples coming soon"
**Decision**: Either populate with 3-5 real code samples (GitHub gists, architecture diagrams) or remove from navigation. A stub hurts credibility.
**Recommended**: Remove from nav until content exists, or convert to a "Technical Writing" page that links to GitHub repos + key blog posts with code.

### 3B. Popular Posts (`popular.md`) & Tutorials (`tutorials.md`)
**Current**: Filter bar + Jekyll loop, no intro
**Upgrade**:
- Add 2-3 sentence editorial intro explaining curation criteria
- Add a "Why these posts" paragraph
- If fewer than 5 posts match the tag, merge into Writing Hub instead

### 3C. Tags page (`tags.html`)
**Current**: Auto-generated tag index
**Upgrade**: Fine as-is (functional utility page). Add a one-line description at top: "Browse all writing by topic."

---

## Priority 4: Visual Consistency Across All Pages

### 4A. Standardize page hero treatment
**Problem**: Rich pages (leadership, case-studies, speaking) use `.exec-hero` with proof bands, but thin pages have no hero — just the Beautiful Jekyll default title/subtitle.
**Fix**: Create a lightweight `.page-hero` component in `site-polish.css` that applies to all `page` layout pages:
- Larger title typography (match `.exec-hero__headline` sizing)
- Kicker label showing the layer (e.g., "Systems Layer" or "Human Layer")
- Subtle gradient background matching the page's `data-layer`
- This replaces the default Beautiful Jekyll intro-header styling

### 4B. Add layer accent bar to all pages
**Problem**: Only the footer has visual layer identity markers. Content pages look generic.
**Fix**: Add a thin 3px accent bar at the top of `.page-shell`:
- Systems pages: blue gradient bar
- Human pages: amber gradient bar
- Both/gateway: split blue+amber bar (like the footer design)
- CSS only, no HTML changes needed (use `::before` on `.page-shell`)

### 4C. Standardize card components
**Problem**: Cards across pages use slightly different class names (`.exec-card`, `.monetization-card`, `.case-study-card`, `.themes-card`, `.outcomes-card`, `.visitors-card`). Similar visually but separate CSS rules.
**Fix**: Keep separate classes (they have different grid spans) but ensure consistent:
- Border-radius: 24px everywhere
- Shadow: `0 12px 28px rgba(22,19,17,0.05)` base
- Hover: `translateY(-3px)` + enhanced shadow
- Dark mode: `rgba(28,25,23,0.92)` background

### 4D. Cross-page newsletter CTA
**Problem**: Newsletter CTAs only appear on homepage. Other pages end abruptly.
**Fix**: Add `{% include newsletter-cta.html %}` to the `page.html` layout as a conditional:
```liquid
{% unless page.no-newsletter-cta %}
  {% if page.layer == "systems" or page.layer == "both" %}
    {% include newsletter-cta.html %}
  {% endif %}
  {% if page.layer == "human" or page.layer == "both" %}
    {% include human-layer-cta.html %}
  {% endif %}
{% endunless %}
```
Pages that already have their own CTAs can set `no-newsletter-cta: true` in frontmatter.

---

## Priority 5: Dark Mode & Accessibility Gaps

### 5A. Dark mode audit
**Problem**: Rich pages (leadership, case-studies, etc.) use `executive.css` which has dark mode support, but thin pages (poetry, photography, now, writing hub) may have contrast issues.
**Fix**: Add dark mode rules to `site-polish.css` for:
- `.writing-hub` content cards
- Poetry page typography (Cormorant Garamond needs higher contrast in dark)
- Photography page lightbox overlay
- Now page markdown content

### 5B. Reading progress bar on all long pages
**Problem**: Reading progress bar exists in `modern-features.js` but may only activate on blog posts.
**Fix**: Ensure it activates on any page with >800 words of content (leadership, case-studies, about, writing hub articles).

### 5C. Breadcrumb navigation
**Problem**: `ui-enhancements.js` has breadcrumb auto-generation but it may not render on all pages.
**Fix**: Verify breadcrumbs appear on:
- `/writing/newsletter/` → Writing / The System Layer
- `/case-studies/` → Case Studies
- Newsletter individual issues → Writing / The System Layer / Issue Title

---

## Priority 6: Performance & SEO

### 6A. Add structured data to key pages
**Problem**: Only global `person` schema exists in `_config.yml`.
**Fix**: Add JSON-LD structured data to:
- Case studies → `Article` schema with `author`, `datePublished`
- CV page → `Person` schema with `jobTitle`, `worksFor`
- Speaking page → `Event` schema (if past events listed)
- Newsletter issues → `NewsArticle` schema

### 6B. Add Open Graph images per page
**Problem**: Most pages use the global `share-img` (me.jpg).
**Fix**: Add `share-img` to frontmatter of key pages:
- Leadership → custom OG image with leadership quote
- Case Studies → OG image per case study
- Writing Hub → branded OG image with "Writing" text

### 6C. Lazy load below-fold images
**Problem**: Photography page may load all images at once.
**Fix**: Ensure `loading="lazy"` on all `<img>` tags in collection loops (photography, poetry covers).

---

## Key Files Summary

| File | Operation | Priority |
|------|-----------|----------|
| `index.html` | Modify — restore gateway hero + add human CTA | P1 |
| `now.md` | Rewrite — expand content, add styling | P2 |
| `poetry.html` | Enhance — featured poem, about block | P2 |
| `photography.html` | Enhance — hero image, about block | P2 |
| `writing.html` | Enhance — featured section, dual CTAs | P2 |
| `writing/newsletter.html` | Enhance — stats, featured issue, cross-link | P2 |
| `writing/human-layer.html` | Enhance — stats, featured issue, cross-link | P2 |
| `code.html` | Remove or populate | P3 |
| `popular.md` | Add intro text | P3 |
| `tutorials.md` | Add intro text | P3 |
| `tags.html` | Add one-line description | P3 |
| `assets/css/site-polish.css` | Add `.page-hero`, layer accent bars, dark mode fixes | P4 |
| `_layouts/page.html` | Add conditional newsletter CTAs | P4 |
| `_includes/head.html` | Add per-page JSON-LD structured data | P6 |

---

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Gateway hero may confuse visitors expecting an executive site | Systems panel leads with executive content; Human panel is secondary |
| Newsletter CTAs on every page may feel spammy | Use subtle design; only show layer-appropriate CTA; allow opt-out via frontmatter |
| Thin pages still feel thin after adding intros | Combine with actual content creation (poems, photos, code samples) — not just CSS fixes |
| Dark mode fixes may break existing pages | Test each page in both themes before committing |
| Performance impact of newsletter CTAs on every page | CTAs are lightweight HTML/CSS only, no JS |

---

## Execution Order (Recommended)

1. **Session 1**: P1 (homepage balance) + P4A-B (page hero + accent bars) — visual foundation
2. **Session 2**: P2A-E (thin page upgrades) — content depth
3. **Session 3**: P3 (stubs) + P4C-D (card consistency + cross-page CTAs) — polish
4. **Session 4**: P5 (dark mode + accessibility) + P6 (SEO) — quality pass

## SESSION_ID (for /ccg:execute use)
- CODEX_SESSION: N/A
- GEMINI_SESSION: N/A
