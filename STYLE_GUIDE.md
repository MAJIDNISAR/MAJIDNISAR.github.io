# Style Guide — Majid Nisar

This style guide documents the voice, tone, and visual design standards for the website. It serves as a reference for maintaining consistency across all content and design decisions.

---

## 1. Brand Identity

### Core Positioning
**Technology leadership for software, AI products, and systems of execution.**

The website represents a hybrid professional-personal brand that combines:
- **Professional depth**: Technology leadership, AI implementation, engineering execution
- **Humanistic breadth**: Writing, photography, poetry, philosophical reflection

### Brand Pillars
1. **Technical Authority** — Deep expertise in software engineering, AI/ML, and distributed systems
2. **Leadership Philosophy** — Operating models, team building, organizational design
3. **Creative Expression** — Writing, photography, and reflective thinking
4. **Practical Execution** — Bias toward action, measurable outcomes, real-world impact

---

## 2. Voice & Tone

### Voice Characteristics
Our voice is consistent across all content, while tone adapts to context:

| Trait | Description |
|-------|-------------|
| **Thoughtful** | Careful consideration of ideas; nothing superficial |
| **Precise** | Specific language; avoids vague generalities |
| **Warm** | Human and approachable, never cold or mechanical |
| **Authoritative** | Confident without being arrogant; earned through experience |
| **Reflective** | Willing to explore complexity and ambiguity |

### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| Technical articles | Precise, instructional, grounded | "Here's how the system works, step by step" |
| Leadership essays | Reflective, principled, practical | "What I've learned about building teams" |
| Personal writing | Intimate, lyrical, honest | "On grief, beauty, and the spaces between" |
| Case studies | Results-oriented, specific, credible | "Reduced latency by 40% through architectural changes" |
| Newsletter | Conversational, curious, connective | "A few things I've been thinking about lately" |

### Writing Principles

1. **Show, don't tell** — Use specific examples over abstract claims
2. **Earn the adjective** — Don't call something "revolutionary"; let readers decide
3. **Respect the reader's intelligence** — No dumbing down, but also no unnecessary complexity
4. **Embrace productive tension** — It's okay to hold two ideas in tension
5. **End with something usable** — Even philosophical pieces should leave the reader with something actionable

---

## 3. Visual Design System

### Design Tokens

All visual design is governed by CSS custom properties defined in `assets/css/design-system.css`.

#### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-display` | Playfair Display, Georgia, serif | Headlines (H1-H3) |
| `--font-ui` | Inter, system sans-serif | Navigation, buttons, H4-H6 |
| `--font-body` | Source Serif Pro, Georgia, serif | Body text, articles |
| `--font-mono` | JetBrains Mono, monospace | Code, metadata, dates |

#### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-color` | #2563EB (Blue) | Primary actions, links, professional content |
| `--accent-warm` | #B45309 (Amber) | Personal/creative content, newsletter |
| `--accent-code` | #059669 (Emerald) | Technical content, code, projects |
| `--text-color` | #1C1917 (Stone) | Primary text |
| `--text-muted` | #78716C (Warm gray) | Secondary text, metadata |
| `--background-color` | #FAFAF8 (Off-white) | Page background |

#### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | 0.25rem (4px) | Tight spacing, icon gaps |
| `--spacing-sm` | 0.5rem (8px) | Component internal spacing |
| `--spacing-md` | 1rem (16px) | Standard paragraph spacing |
| `--spacing-lg` | 1.5rem (24px) | Section padding |
| `--spacing-xl` | 2rem (32px) | Major section spacing |
| `--spacing-2xl` | 3rem (48px) | Hero sections |
| `--spacing-3xl` | 4rem (64px) | Page-level spacing |

### Component Library

#### Buttons

```html
<!-- Primary CTA -->
<a href="#" class="btn btn-primary">Get in Touch</a>

<!-- Secondary action -->
<a href="#" class="btn btn-secondary">Learn More</a>

<!-- Tertiary/Ghost -->
<a href="#" class="btn btn-tertiary">Read Essay</a>
```

#### Cards

```html
<div class="card">
  <div class="card-body">
    <h3 class="card-title">Card Title</h3>
    <p class="card-text">Card description text goes here.</p>
  </div>
</div>
```

#### Badges/Tags

```html
<span class="badge">Leadership</span>
<span class="badge badge-warm">Newsletter</span>
<span class="badge badge-code">Engineering</span>
```

---

## 4. Content Guidelines

### Page-Specific Guidelines

#### Home Page (index.html)
- **Purpose**: Establish credibility and direct visitors to relevant content
- **Hero**: Clear value proposition in one sentence
- **Sections**: Maximum 5 sections with clear hierarchy
- **CTA**: Primary CTA should be "Work With Me" or "Get in Touch"

#### About Page (aboutme.html)
- **Purpose**: Build trust through authentic narrative
- **Structure**: Professional credentials + personal dimension
- **Tone**: First-person, reflective but not self-indulgent
- **Include**: Career highlights, leadership philosophy, personal interests

#### Writing Hub (writing.html)
- **Purpose**: Central access point for all written content
- **Categories**: Leadership, Engineering, AI/ML, Essays
- **Filtering**: Clear category filters with visual distinction
- **Layout**: Card-based grid with consistent metadata

#### Case Studies (case-studies.html)
- **Purpose**: Demonstrate capability through specific examples
- **Structure**: Problem → Approach → Outcome
- **Metrics**: Include specific, measurable results
- **Tone**: Confident but not boastful; let results speak

### Microcopy Standards

| Element | Guideline | Example |
|---------|-----------|---------|
| Button text | Action-oriented, specific | "Start a Conversation" not "Submit" |
| Link text | Descriptive of destination | "Read the full essay" not "Click here" |
| Form labels | Clear and concise | "Email address" not "Email" |
| Error messages | Helpful and non-judgmental | "Please enter a valid email" not "Invalid input" |
| Empty states | Guide to next action | "No posts yet. Subscribe to be notified." |

---

## 5. Accessibility Standards

### WCAG 2.1 AA Compliance

1. **Color Contrast**
   - Normal text: minimum 4.5:1 contrast ratio
   - Large text (18px+): minimum 3:1 contrast ratio
   - UI components: minimum 3:1 contrast ratio

2. **Keyboard Navigation**
   - All interactive elements must be focusable
   - Visible focus indicators on all interactive elements
   - Logical tab order following visual layout

3. **Screen Reader Support**
   - Meaningful alt text for all informative images
   - Decorative images marked with empty alt=""
   - ARIA labels where native semantics are insufficient

4. **Motion & Animation**
   - Respect `prefers-reduced-motion` media query
   - No auto-playing content that cannot be paused
   - Animations should enhance, not distract

---

## 6. Dark Mode

### Design Token Adjustments

Dark mode uses the same design tokens with adjusted values:

```css
[data-theme="dark"] {
  --text-color: #E7E5E4;
  --background-color: #1C1917;
  --surface-card: #292524;
  --border-color: #44403C;
  /* ... */
}
```

### Dark Mode Guidelines
- Maintain contrast ratios in dark mode
- Avoid pure black (#000) backgrounds; use dark gray
- Reduce saturation of accent colors slightly
- Test all components in both light and dark modes

---

## 7. Responsive Design

### Breakpoints

| Name | Min Width | Target Devices |
|------|-----------|----------------|
| Mobile | 0px | Phones (portrait) |
| Mobile Landscape | 480px | Phones (landscape) |
| Tablet | 768px | Tablets, small laptops |
| Desktop | 1024px | Laptops, desktops |
| Large Desktop | 1280px | Large monitors |

### Mobile-First Principles
1. Design for mobile first, then enhance for larger screens
2. Touch targets minimum 44×44px
3. Font sizes legible without zooming (minimum 16px)
4. Critical content and actions accessible without scrolling excessively

---

## 8. Performance Guidelines

### Targets
- **Page Load**: < 2 seconds on 3G connection
- **First Contentful Paint**: < 1.5 seconds
- **Lighthouse Score**: > 90 for Performance, Accessibility, Best Practices, SEO

### Optimization Strategies
1. **Images**: WebP format with fallbacks; lazy loading for below-fold images
2. **CSS**: Critical CSS inlined; non-critical CSS deferred
3. **JavaScript**: Minimize JS; defer non-critical scripts
4. **Fonts**: Use `font-display: swap`; preload critical fonts

---

## 9. SEO Guidelines

### On-Page SEO
- **Title tags**: 50-60 characters, primary keyword near the beginning
- **Meta descriptions**: 150-160 characters, compelling and descriptive
- **Heading hierarchy**: One H1 per page; logical H2-H6 structure
- **URL structure**: Clean, descriptive URLs with keywords

### Content SEO
- Target 1-2 primary keywords per page
- Include related semantic keywords naturally
- Internal linking to related content
- Regular content updates for freshness

---

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-08 | Initial style guide creation |

---

*This style guide is a living document. Updates should be made as the brand and design system evolve.*