# Implementation Plan: Homepage Mixed Balance

## Context
The homepage was recently rewritten to be purely executive/Systems-layer focused (`layer: systems`). The user's site identity is built on a **dual-facet** concept — Systems (technology/leadership) and Human (poetry/photography/Kashmir). The homepage should reflect both layers as a gateway, not just one side.

The CSS infrastructure for this already exists: `.gateway-hero`, `.gateway-panel--systems`, `.gateway-panel--human`, `.human-layer-cta-*` classes, and `data-layer="gateway"` support are all built and ready.

## Task Type
- [x] Frontend (HTML structure + CSS)
- [ ] Backend
- [ ] Fullstack

## Technical Solution

**Strategy**: Keep the executive content (it's strong) but wrap it in a dual-layer gateway frame. The homepage becomes the *bridge* between both layers rather than belonging exclusively to one.

### Key design principles:
1. **Lead with both identities** — Gateway hero shows Systems + Human side-by-side
2. **Executive content stays** — Themes, outcomes, case studies, work-with-me remain (they're the professional backbone)
3. **Human Layer gets representation** — Poetry/photography CTA section, human-layer newsletter CTA, and the stream already shows mixed content
4. **Page layer = gateway** — Neutral warm-white canvas, not blue-grid

## Implementation Steps

### Step 1: Change page layer from `systems` to `gateway`
**File**: `index.html` (line 7)
```yaml
layer: gateway   # was: systems
```
This activates neutral warm-white page background and dual-layer ambient styling.

### Step 2: Restore gateway hero with executive substance
**File**: `index.html` — Replace `exec-hero` section with a hybrid:
- Keep the `.gateway-hero` dual-panel structure (Systems panel left, Human panel right)
- **Systems panel**: Keep the executive headline, description, and CTAs from exec-hero but inside the panel
- **Human panel**: Poetry/photography/Kashmir identity with links to those sections
- Scroll prompt below

### Step 3: Keep exec-focus ("Current Focus + Best Fit")
No changes. This section works as a bridge between the hero and the detail sections.

### Step 4: Add Human Layer CTA alongside Systems newsletter
**File**: `index.html` — After `{% include newsletter-cta.html %}`, add:
```liquid
{% include human-layer-cta.html %}
```
This restores the amber-themed poetry/photography CTA that mirrors the blue Systems newsletter CTA.

### Step 5: Keep all executive sections intact
No changes to: authority-strip, themes-section, outcomes-section, case-study-section, monetization-section, visitors-section, testimonials.

### Step 6: Verify stream-section shows mixed content
The stream-section already renders `stream-card--systems` and `stream-card--human` variants. With `future: true` in config, Human Layer posts should appear alongside System Layer newsletters. No code change needed.

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `index.html:7` | Modify | Change `layer: systems` → `layer: gateway` |
| `index.html:22-79` | Replace | Swap exec-hero for gateway hero with executive content |
| `index.html:~272` | Add line | Add `{% include human-layer-cta.html %}` after newsletter CTA |
| `assets/css/index.css` | No change | Gateway hero styles already exist in layers.css |

## Expected Result

```
Page layout (top to bottom):
─────────────────────────────────
│ GATEWAY HERO (two panels)      │
│ ┌─────────┐ ┌──────────┐      │
│ │ Systems │ │  Human   │      │
│ │ Tech    │ │ Poetry   │      │
│ │ Leader  │ │ Kashmir  │      │
│ └─────────┘ └──────────┘      │
│ "scroll for the full picture"  │
─────────────────────────────────
│ Current Focus + Best Fit       │
─────────────────────────────────
│ Work With Me (3 cards)         │
─────────────────────────────────
│ 18+  50+  0→1  4  (metrics)   │
─────────────────────────────────
│ Signature Themes (2×2 grid)   │
─────────────────────────────────
│ Selected Outcomes (4 cards)    │
─────────────────────────────────
│ Case Studies (3 cards)         │
─────────────────────────────────
│ Latest Thinking (mixed stream) │
─────────────────────────────────
│ ◈ THE SYSTEM LAYER (blue CTA) │
─────────────────────────────────
│ ◇ THE HUMAN LAYER (amber CTA) │
─────────────────────────────────
│ For Different Visitors (5)     │
─────────────────────────────────
│ What Colleagues Say (carousel) │
─────────────────────────────────
```

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Gateway hero may feel less "executive" than the previous exec-hero | Keep executive copy in Systems panel (same headline, CTAs); the dual-panel actually demonstrates range |
| Human Layer has less published content (only 2 posts vs 7 newsletters) | Stream section auto-sorts by date; content will fill as more Human Layer posts are published |
| Page load: gateway hero has more elements than exec-hero | All CSS is pre-built; no new JS needed; images are lazy-loaded |

## Verification
1. `bundle exec jekyll build` — success
2. Open homepage — dual-panel hero visible with Systems (blue) and Human (amber) panels
3. Scroll down — all executive sections intact
4. Both newsletter CTAs visible (blue System Layer + amber Human Layer)
5. Latest Thinking stream shows both layer types
6. Toggle dark mode — both panels adapt correctly
7. Resize to mobile — panels stack vertically
8. Check `data-layer="gateway"` on body element in DevTools

## SESSION_ID (for /ccg:execute use)
- CODEX_SESSION: N/A (single-model analysis)
- GEMINI_SESSION: N/A (single-model analysis)
