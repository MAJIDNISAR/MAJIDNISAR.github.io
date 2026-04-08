# Implementation Plan — Full CSS Consolidation & Style Unification

[Overview]
Consolidate all page-specific CSS into a single shared design system, using the homepage (index.html / index.css) as the canonical standard for card styling, section layout, testimonials, typography, and visual treatment across every page and blog post.

The website currently suffers from five competing CSS layers that each define their own card, surface, heading, and layout patterns:
- `index.css` — homepage-only premium editorial system (the gold standard)
- `executive.css` — case-studies, leadership, work-with-me, speaking, contact, chat, address, media-kit pages
- `aboutme.css` — about page only
- `premium-theme.css` — blog post/preview card overrides
- `modern-design.css` — generic card/button/hero system

This creates visual inconsistency: cards on the homepage have 26px radius, glassmorphic gradients, decorative blobs, and hover-lift; executive pages have 24px radius with slightly different gradients; the about page has simpler flat cards; blog posts use yet another card pattern from premium-theme.css.

**Strategy:** Extract the homepage's design language into a new shared component CSS file (`shared-components.css`) loaded globally. Refactor each page's HTML to use the shared class vocabulary. Slim down or remove page-specific CSS files. Add the homepage testimonial carousel to the about page.

[Types]
No programmatic type changes. This is a CSS/HTML refactoring task.

The shared class vocabulary (extracted from homepage patterns) will be:

**Card classes:**
- `.card-surface` — base card: border, radius, gradient bg, shadow, overflow hidden, relative positioning
- `.card-surface:hover` — translateY(-4px), enhanced shadow, accent border
- `.card-surface::before` — optional decorative radial-gradient blob
- `.card-surface--hero` — larger padding, 30px radius (for hero/intro sections)
- `.card-surface--compact` — smaller padding variant

**Section classes:**
- `.section-shell` — max-width 1100px, margin auto, padding, margin-bottom
- `.section-header` — grid gap 0.35rem, margin-bottom 1.8rem
- `.section-heading` — Playfair Display, clamp(1.8rem, 4vw, 2.8rem)
- `.section-kicker` — JetBrains Mono, uppercase, xs font, widest letter-spacing

**Grid classes:**
- `.grid-12` — 12-column grid, gap 1.2rem
- `.grid-3` — 3-column equal grid
- `.grid-2` — 2-column equal grid
- `.grid-1` — single column
- `.col-span-4`, `.col-span-6`, `.col-span-8`, `.col-span-12` — column spans

**Metric/proof card classes:**
- `.metric-value` — large display font (Playfair), warm accent color
- `.metric-label` — small muted text

**Testimonial classes (reusable):**
- `.testimonials-section`, `.testimonials-stage`, `.testimonials-carousel`, `.testimonials-track`
- `.testimonial-card`, `.testimonial-qualities`, `.testimonial-quality`
- `.testimonial-quote`, `.testimonial-author`, `.testimonial-avatar`, `.testimonial-meta`

[Files]
Create one new shared CSS file, modify the global CSS load list, refactor 10+ page HTML files, and slim down 3 page-specific CSS files.

### New files:
1. **`assets/css/shared-components.css`** — Extracted homepage card/section/grid/metric system as reusable classes. This is the single source of truth for visual components.

### Modified files:

**Global config:**
2. **`_layouts/base.html`** — Add `shared-components.css` to common-css list (after design-system.css, before page-specific CSS files like animations.css)

**Page HTML refactors (use shared classes):**
3. **`aboutme.html`** — Replace `.about-shell`/`.about-card`/`.about-panel` with `.section-shell`/`.card-surface`/`.card-surface--compact`. Add testimonials section using the homepage pattern (Jekyll Liquid loop from `_data/testimonials.yml`).
4. **`case-studies.html`** — Replace `.exec-hero`/`.exec-card`/`.exec-proof-card` with `.card-surface--hero`/`.card-surface`/`.card-surface` + `.metric-value`/`.metric-label`.
5. **`leadership.html`** — Same executive→shared class migration.
6. **`work-with-me.html`** — Same executive→shared class migration.
7. **`speaking.html`** — Same executive→shared class migration.
8. **`contact.html`** — Same executive→shared class migration.
9. **`chat.html`** — Same executive→shared class migration.
10. **`address.html`** — Same executive→shared class migration.
11. **`media-kit.html`** — Same executive→shared class migration.
12. **`KashurQuranBlog.md`** — Ensure blog post styling is consistent.
13. **`index.html`** — Add shared classes alongside existing homepage-specific classes (dual-class approach for backward compatibility).

**CSS file modifications:**
14. **`assets/css/aboutme.css`** — Remove card/surface/shadow rules that are now in shared-components.css. Keep only about-page-specific layout rules (grid column ratios).
15. **`assets/css/executive.css`** — Remove card/surface/shadow/radius rules now in shared-components.css. Keep only executive-page-specific layout rules (proof-band grid, principle label).
16. **`assets/css/premium-theme.css`** — Remove competing card/surface definitions for blog posts. Keep only blog-specific overrides (reading progress, footer, intro-header).
17. **`assets/css/modern-design.css`** — Remove competing `.card` definition. Keep dark mode tokens, navbar overrides, hero section, and animation keyframes.

**Blog layout:**
18. **`_layouts/post.html`** — Add `.card-surface` class to the blog post container for consistent card treatment.
19. **`_layouts/page.html`** — Add `.section-shell` class to the page container.

**JS:**
20. **`assets/js/ui-enhancements.js`** — Already fixed (testimonial guard). No further changes needed unless the SocialProof testimonial carousel needs to use the new shared class names.

[Functions]
No JavaScript function changes required beyond the already-applied testimonial guard.

The homepage testimonial carousel JS (in index.html or a separate JS file) drives the `.testimonials-*` classes. The about page will reuse this same JS by including the same HTML structure and class names. The existing carousel initialization script from `assets/js/modern-features.js` or inline `<script>` in index.html should be extracted into a shared include if it isn't already.

**Check needed:** Verify where the homepage testimonial carousel JS lives (inline in index.html vs. a separate file) and ensure it initializes for any page containing `.testimonials-section`.

[Classes]
CSS class consolidation mapping — old page-specific classes → new shared classes.

### About page (`aboutme.html`):
| Old class | New class | Notes |
|-----------|-----------|-------|
| `.about-shell` | `.section-shell` | Same max-width/margin/padding |
| `.about-grid` | `.grid-12` with col-spans | 2fr/1fr → col-span-8 + col-span-4 |
| `.about-card` | `.card-surface` | Unified card appearance |
| `.about-panel` | `.card-surface .card-surface--compact` | Sidebar panels |
| `.about-lead` | `.section-lead` (new) | Lead paragraph with border-left accent |
| `.about-list` | keep as-is | Layout-only, no visual conflict |

### Executive pages (case-studies, leadership, work-with-me, speaking, contact, chat, address, media-kit):
| Old class | New class | Notes |
|-----------|-----------|-------|
| `.executive-page` | `.section-shell` | Same container pattern |
| `.exec-hero` | `.card-surface .card-surface--hero` | Hero card with larger padding/radius |
| `.exec-kicker` | `.section-kicker` | Already in typography.css |
| `.exec-lead` | `.section-lead` | Lead paragraph styling |
| `.exec-section-title` | `.section-heading` | Unified heading |
| `.exec-card` | `.card-surface` | Standard card |
| `.exec-proof-card` | `.card-surface` | With `.metric-value` + `.metric-label` children |
| `.exec-proof-metric` | `.metric-value` | Display number styling |
| `.exec-proof-label` | `.metric-label` | Muted description |
| `.exec-proof-band` | `.grid-3` | 3-column grid |
| `.exec-grid--two` | `.grid-2` | 2-column grid |
| `.exec-grid--three` | `.grid-3` | 3-column grid |
| `.exec-principle` | `.card-surface` + custom grid | Principle cards keep 2-col inner grid |
| `.case-study-detail` | `.card-surface .card-surface--hero` | Same as hero card treatment |
| `.case-study-meta span` | `.section-kicker` variant or `.tag-pill` | Meta tag pills |

### Blog posts:
| Old class | New class | Notes |
|-----------|-----------|-------|
| `.blog-post` (from premium-theme.css) | `.card-surface` wrapper | Blog content gets card treatment |
| `.post-preview` (from beautifuljekyll.css) | `.card-surface` | Blog list cards |

[Dependencies]
No new package dependencies. This is purely CSS/HTML refactoring.

Google Fonts are already loaded globally via `base.html` common-ext-css (Playfair Display, Cormorant Garamond, Inter, Source Serif Pro, JetBrains Mono).

The design token system is already available globally via `design-system.css` (added in previous fix) and `typography.css`.

[Testing]
Visual regression testing across all pages after each refactoring phase.

### Testing approach:
1. **Before starting:** Take screenshots of every page in both light and dark mode for comparison.
2. **After shared-components.css creation:** Verify homepage still renders identically (no regressions from adding shared classes).
3. **After each page refactor:** Compare against homepage card appearance — border-radius, shadow, gradient, hover behavior, dark mode should all match.
4. **Specific test cases:**
   - Homepage testimonials: Carousel functionality preserved
   - About page testimonials: New carousel renders and functions correctly
   - Executive pages: Cards, metrics, grids, hover states all match homepage
   - Blog posts: Post content card, post preview cards match homepage
   - Dark mode: All pages render correctly in dark theme
   - Responsive: All pages work at 1200px, 900px, 640px, 480px breakpoints
   - Reduced motion: Hover animations disabled per user preference
5. **Browser testing:** Verify in Chrome, Safari (webkit prefix), Firefox, Edge.

[Implementation Order]
Execute in phases to minimize risk and allow incremental verification.

1. **Phase 0 — Snapshot:** Capture current state screenshots of all pages (homepage, about, case-studies, leadership, work-with-me, speaking, blog post, KashurQuran) in light+dark mode.

2. **Phase 1 — Create shared-components.css:** Extract homepage card/section/grid/metric patterns into `assets/css/shared-components.css`. Define the shared class vocabulary. Add to `base.html` common-css list after design-system.css.

3. **Phase 2 — Homepage backward compatibility:** Add shared classes to index.html elements alongside existing classes. Verify no visual regression on homepage.

4. **Phase 3 — About page refactor:** Refactor `aboutme.html` to use shared classes. Add testimonials section (copy pattern from index.html). Slim `aboutme.css`. Verify about page matches homepage card appearance.

5. **Phase 4 — Executive pages refactor:** Refactor all executive.css pages (case-studies, leadership, work-with-me, speaking, contact, chat, address, media-kit) to use shared classes. Slim `executive.css`. Verify each page.

6. **Phase 5 — Blog post refactor:** Update `_layouts/post.html` and `_layouts/page.html` to use shared card/section classes. Slim `premium-theme.css` competing card rules. Verify blog posts match.

7. **Phase 6 — Cleanup:** Remove dead CSS rules from `aboutme.css`, `executive.css`, `premium-theme.css`, `modern-design.css`. Audit for any remaining Lora/Open Sans font references. Final cross-page visual comparison.

8. **Phase 7 — Dark mode & responsive audit:** Verify all pages in dark mode and at all responsive breakpoints. Fix any regressions.
