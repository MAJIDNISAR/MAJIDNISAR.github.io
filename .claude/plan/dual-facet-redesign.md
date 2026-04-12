# Dual-Facet Website Redesign: Systems Layer + Human Layer

## Concept

Two lenses into one person. Not two separate sites — one site with **two modes of seeing**.

| Facet | Brand | Color | Typography | Content |
|-------|-------|-------|------------|---------|
| **The Systems Layer** | Professional | Blue `#2563EB` | Inter + Playfair Display | Leadership, Engineering, AI, Case Studies, Newsletter, CV, Speaking |
| **The Human Layer** | Personal | Amber `#B45309` | Cormorant Garamond + Source Serif Pro | Poetry, Photography, Reflections, Kashmir, Personal Essays |

The existing newsletter brand "THE SYSTEM LAYER" becomes the professional pillar. The Human Layer is everything else — the poet, photographer, thinker from Kashmir.

---

## Task Type
- [x] Frontend (UI/UX, layouts, CSS, navigation)
- [ ] Backend
- [x] Fullstack (Jekyll templating + front-end)

---

## Information Architecture

### Homepage: The Gateway

Split-screen hero that presents both facets simultaneously:

```
┌──────────────────────────────────────────────────────────┐
│                    MAJID NISAR                            │
│                                                          │
│   ┌─────────────────────┐  ┌─────────────────────────┐  │
│   │  THE SYSTEMS LAYER  │  │   THE HUMAN LAYER       │  │
│   │                     │  │                          │  │
│   │  Building software  │  │  Poetry. Photography.   │  │
│   │  organizations,     │  │  A life shaped by       │  │
│   │  AI products, and   │  │  Kashmir's mountains    │  │
│   │  systems of         │  │  and rivers.            │  │
│   │  execution.         │  │                          │  │
│   │                     │  │                          │  │
│   │  [Enter →]          │  │  [Enter →]              │  │
│   │                     │  │                          │  │
│   │  Blue accent        │  │  Amber accent           │  │
│   │  Clean, structured  │  │  Warm, textured         │  │
│   └─────────────────────┘  └─────────────────────────┘  │
│                                                          │
│            ── or scroll for the full picture ──           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Below the fold: unified content stream            │  │
│  │  (latest from both layers, interleaved by date)    │  │
│  │  Each card tagged with its layer                   │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Navigation: Layer-Aware

```
MAJID NISAR  |  Systems ▾  |  Human ▾  |  About  |  Contact  |  Work With Me

Systems ▾                    Human ▾
├── Leadership               ├── Poetry
├── Case Studies              ├── Photography
├── Newsletter                ├── Reflections
├── Speaking                  ├── About Me
├── Projects                  └── Now
└── CV
```

### URL Structure (unchanged — no breaking links)

No URL changes needed. The facets are a **navigation and visual concept**, not a URL reorganization. Existing permalinks stay intact.

### Page-to-Layer Mapping

| Page | Layer | Color Accent | Rationale |
|------|-------|-------------|-----------|
| `/` | Both (gateway) | Split | Entry point |
| `/leadership/` | Systems | Blue | Professional methodology |
| `/case-studies/` | Systems | Blue | Professional proof |
| `/writing/` | Both | Contextual | Hub for all writing |
| `/writing/newsletter/` | Systems | Blue | THE SYSTEM LAYER brand |
| `/speaking/` | Systems | Blue | Professional platform |
| `/projects/` | Systems | Blue | Technical work |
| `/cv/` | Systems | Blue | Career |
| `/work-with-me/` | Systems | Blue | Business |
| `/poetry/` | Human | Amber | Creative expression |
| `/photography/` | Human | Amber | Visual art |
| `/aboutme/` | Human | Amber | Personal story |
| `/now/` | Human | Amber | Current life |
| `/contact/` | Both | Neutral | Shared |
| Blog posts | Tagged | By content-type | `content-type` front matter drives it |

---

## Visual Design System

### Layer Signatures

Each layer has a distinct visual treatment — subtle but unmistakable.

**Systems Layer pages:**
- Blue accent color (`#2563EB`)
- Inter headings (clean, geometric)
- Structured grid layouts
- Sharp corners, thin borders
- Background: pure white `#FFFFFF` or very light gray
- Subtle grid/dot pattern texture (optional)
- Navigation accent: blue underline

**Human Layer pages:**
- Amber accent color (`#B45309`)
- Cormorant Garamond headings (literary, warm)
- Organic layouts (wider margins, more whitespace)
- Softer corners, warmer borders
- Background: warm cream `#FAFAF8`
- Paper/texture feel (optional)
- Navigation accent: amber underline

**Shared/Gateway:**
- Both accents present
- Split visual treatment on homepage
- Neutral on shared pages (contact)

### CSS Implementation

Add a `data-layer` attribute to `<body>` via front matter:

```yaml
# In post/page front matter
layer: systems  # or "human" or "both"
```

```css
/* Layer-specific accent overrides */
[data-layer="systems"] {
  --accent: #2563EB;
  --accent-hover: #1D4ED8;
  --heading-font: 'Inter', sans-serif;
  --bg-tint: #FFFFFF;
  --border-style: 1px solid #E5E7EB;
}

[data-layer="human"] {
  --accent: #B45309;
  --accent-hover: #92400E;
  --heading-font: 'Cormorant Garamond', serif;
  --bg-tint: #FAFAF8;
  --border-style: 1px solid #E7E5E4;
}
```

This is **one CSS file addition** (~100 lines) that layers on top of the existing design system. No rewrite needed.

### Navigation Treatment

Active layer indicated by accent color on nav items:

```css
[data-layer="systems"] .nav-systems { border-bottom: 2px solid #2563EB; }
[data-layer="human"] .nav-human { border-bottom: 2px solid #B45309; }
```

---

## Implementation Steps

### Phase 0: Safety Branch (10 min)
1. Create branch `feat/dual-facet` from `master`
2. All work happens here — fully scrappable via `git branch -D feat/dual-facet`
3. Test locally with `bundle exec jekyll serve --livereload`

**Deliverable:** Clean branch, no risk to production site.

### Phase 1: Front Matter Tagging (20 min)
1. Add `layer: systems` or `layer: human` to every page's front matter
2. Add `layer` to `_config.yml` defaults per collection:
   ```yaml
   defaults:
     - scope: { path: "_poetry" }
       values: { layer: "human" }
     - scope: { path: "_photos" }
       values: { layer: "human" }
     - scope: { path: "_newsletter" }
       values: { layer: "systems" }
   ```
3. Tag existing 24 blog posts by `content-type` → layer mapping:
   - `content-type: technical` → `layer: systems`
   - `content-type: essay` → `layer: systems` (most are professional)
   - `content-type: reflection` → `layer: human`
   - `content-type: poetry` → `layer: human`

**Deliverable:** Every page knows which layer it belongs to.

### Phase 2: Layout Integration (30 min)
1. In `_layouts/base.html`, add `data-layer="{{ page.layer | default: 'both' }}"` to `<body>`
2. Create `assets/css/layers.css` (~120 lines):
   - Layer-specific CSS custom property overrides
   - Nav accent indicators
   - Subtle background tint differences
   - Heading font switching
3. Load `layers.css` in `base.html` after `design-system.css`

**Deliverable:** Every page visually reflects its layer. Existing styles untouched.

### Phase 3: Navigation Redesign (45 min)
1. Restructure `_includes/nav.html`:
   - Replace flat navbar links with two dropdown groups: "Systems" and "Human"
   - Keep "About", "Contact", "Work With Me" as top-level
   - Active layer highlighted with accent color
2. Update `_config.yml` navbar-links to new structure:
   ```yaml
   navbar-links:
     Systems:
       - Leadership: "/leadership/"
       - Case Studies: "/case-studies/"
       - Newsletter: "/writing/newsletter/"
       - Speaking: "/speaking/"
       - Projects: "/projects/"
       - CV: "/cv/"
     Human:
       - Poetry: "/poetry/"
       - Photography: "/photography/"
       - Reflections: "/writing/"
       - Now: "/now/"
     About: "/aboutme/"
     Contact: "/contact/"
     Work With Me: "/work-with-me/"
   ```
3. Style dropdowns with layer-appropriate accent colors

**Deliverable:** Navigation clearly communicates the two facets.

### Phase 4: Homepage Redesign (1-2 hours)
1. Replace current `index.html` hero with split-panel gateway:
   - Left panel: Systems Layer (blue tinted, Inter typography)
   - Right panel: Human Layer (amber tinted, Cormorant Garamond)
   - Each panel has tagline + CTA button leading into that world
   - On mobile: stacked vertically, Systems on top
2. Below the fold: unified "Latest" stream
   - Pulls from all collections (posts, newsletter, poetry, photos)
   - Each card has a small layer badge (blue dot for Systems, amber for Human)
   - Sorted by date
3. Keep existing sections (outcomes, testimonials, engagement) but place them after the unified stream
4. Update `assets/css/index.css` for the new hero layout

**Deliverable:** Homepage immediately communicates the dual nature of the site.

### Phase 5: Footer Update (20 min)
1. Update `_includes/footer.html` to organize links by layer:
   ```
   THE SYSTEMS LAYER          THE HUMAN LAYER           CONNECT
   Leadership                 Poetry                    Contact
   Case Studies               Photography               Work With Me
   Newsletter                 Reflections               LinkedIn
   Speaking                   Now                       Twitter
   Projects                                             GitHub
   CV
   ```

**Deliverable:** Footer mirrors the navigation concept.

### Phase 6: Content Polish (30 min)
1. Add layer-specific hero treatments:
   - Systems pages: clean gradient hero, blue accent
   - Human pages: warm photography hero or textured background
2. Add a small "layer indicator" pill/badge in the page header area:
   - `THE SYSTEMS LAYER` (blue) or `THE HUMAN LAYER` (amber)
   - Subtle, not in-your-face — like a magazine section label
3. On the About page, explicitly tell the story of both layers — why they exist together

**Deliverable:** Every page feels intentionally placed in its world.

---

## Key Files to Modify

| File | Operation | Description |
|------|-----------|-------------|
| `_config.yml` | Modify | navbar-links restructure, collection defaults for `layer` |
| `_layouts/base.html:~L2` | Modify | Add `data-layer` attribute to `<body>` tag |
| `assets/css/layers.css` | **Create** | Layer-specific CSS overrides (~120 lines) |
| `_includes/nav.html` | Modify | Two-dropdown nav (Systems / Human) |
| `index.html` | Modify | Split-panel hero gateway |
| `assets/css/index.css` | Modify | Homepage hero styles for split layout |
| `_includes/footer.html` | Modify | Layer-organized footer columns |
| `aboutme.html` | Modify | Add `layer: human` front matter |
| `leadership.html` | Modify | Add `layer: systems` front matter |
| `case-studies.html` | Modify | Add `layer: systems` front matter |
| `cv.html` | Modify | Add `layer: systems` front matter |
| `speaking.html` | Modify | Add `layer: systems` front matter |
| `writing.html` | Modify | Add `layer: both` front matter |
| `photography.html` | Modify | Already `layer: human` via collection default |
| `poetry.html` | Modify | Already `layer: human` via collection default |
| `contact.html` | Modify | Add `layer: both` front matter |
| `work-with-me.html` | Modify | Add `layer: systems` front matter |
| 24 `_posts/*.md` | Modify | Add `layer` based on content-type |

---

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing URLs | No URL changes — layer is visual/navigational only |
| Mobile layout breaks on split hero | Progressive: stacked on mobile, side-by-side on desktop |
| Too many CSS files (already 19) | `layers.css` is additive, ~120 lines. No new complexity. |
| Looks gimmicky instead of intentional | Keep treatment subtle — color accent + font shift + section label. No heavy theming. |
| Want to scrap the whole thing | Everything on `feat/dual-facet` branch. `git checkout master` to undo. |
| Performance regression | No new JS, no new fonts (all already loaded). Minimal CSS addition. |

---

## Local Testing Workflow

```bash
# 1. Create safety branch
git checkout -b feat/dual-facet

# 2. After each phase, test locally
bundle exec jekyll serve --livereload --port 4000

# 3. Check both layers work
# Visit: http://localhost:4000 (gateway)
# Visit: http://localhost:4000/leadership/ (systems)
# Visit: http://localhost:4000/poetry/ (human)

# 4. If it works → merge to master → push to GitHub Pages
git checkout master
git merge feat/dual-facet
git push

# 5. If it doesn't work → scrap it
git checkout master
git branch -D feat/dual-facet
```

---

## Design Philosophy

> "I am not two people. I am one person who thinks in systems and feels in poetry."

The dual-facet approach doesn't split the site — it gives visitors **permission to see both dimensions**. A recruiter lands on the Systems side and finds leadership depth. A reader lands on the Human side and finds contemplation. Both discover the other layer exists, and that's the point — **the whole person is the differentiator.**

The visual treatment is **subtle, not theatrical**. A font shift, a color accent, a section label. The content does the heavy lifting. The design just whispers: *you're in a different room of the same house.*

---

## SESSION_ID (for reference)
- CODEX_SESSION: N/A (built-in analysis used)
- GEMINI_SESSION: N/A (built-in analysis used)
