# 틈 Design System

## 0. Research Log

- Embedded refs: shortlisted Airbnb, Figma, and Notion → picked the `taste-skill` execution rules with Airbnb's warm, human-scale mobile patterns; the pink CTA is adapted to `틈`'s local campus context, not copied branding.
- Lazyweb: skipped for this bootstrap-only route because the restricted network cannot safely fetch external UI screenshots; product-screen research is deferred to the full experience implementation.
- Imagen drafts: skipped for this bootstrap-only route; the planned 1200×675 representative image will be created as a dedicated submission artifact.

## 1. Atmosphere & Identity

`틈` feels like a friendly note from a sharp senior who knows the campus well: optimistic, active, and locally useful. Its signature is the **gap marker**—a vivid coral waypoint that makes the time between classes feel claimed rather than empty.

## 2. Color

| Role | Token | Value | Usage |
|---|---|---|---|
| Canvas | `--canvas` | `#FFFDF9` | Page background |
| Surface | `--surface` | `#FFFFFF` | Cards and controls |
| Ink | `--ink` | `#222222` | Primary text |
| Muted | `--muted` | `#6A6A6A` | Supporting text |
| Divider | `--divider` | `#DDDDDD` | Low-emphasis boundaries |
| Accent | `--accent` | `#E94B62` | Primary action and active state |
| Accent pressed | `--accent-pressed` | `#C93C51` | Press state |
| Focus | `--focus` | `#222222` | Keyboard ring |
| Success | `--success` | `#147A56` | Positive availability |
| Warning | `--warning` | `#9A5B00` | Caution and crowd state |

Accent is reserved for purposeful actions and the active recommendation state; all other hierarchy comes from type, spacing, and tonal surfaces.

## 3. Typography

- Primary: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Display: 40px / 700 / 1.1 for page-level moments
- H1: 32px / 700 / 1.2
- H2: 24px / 700 / 1.3
- Body: 16px / 500 / 1.55
- Supporting: 14px / 500 / 1.5
- Caption: 12px / 600 / 1.4

Body text does not fall below 14px. Type is Korean-first and avoids decorative all-caps labels.

## 4. Spacing & Layout

All spacing uses a 4px base: `--space-1` 4px, `--space-2` 8px, `--space-3` 12px, `--space-4` 16px, `--space-5` 20px, `--space-6` 24px, `--space-8` 32px, `--space-10` 40px, `--space-12` 48px, `--space-16` 64px. The app is 390px-first with 16px mobile gutters; desktop content is capped at 1120px.

## 5. Components

### App shell

- **Structure**: `header` + `main` + optional `nav`
- **Spacing**: mobile gutter and `--space-6` vertical rhythm
- **States**: responsive at 640px, 768px, and 1024px
- **Accessibility**: a single `main` landmark; visible focus ring for interactive descendants

### Primary action

- **Structure**: native `button` with text label
- **Spacing**: `--space-3` horizontal and `--space-2` vertical minimum; touch target at least 44px
- **States**: accent default, darker pressed, 2px ink focus ring, disabled when unavailable
- **Motion**: transform and opacity only, 150ms maximum; removed under reduced motion

### Information card

- **Structure**: heading plus concise supporting text
- **Spacing**: `--space-4` internal and `--space-4` between cards
- **States**: neutral default, active accent marker, explicit empty/error copy
- **Accessibility**: never communicates priority by color alone

## 6. Motion & Interaction

Interactive feedback uses only `transform` and `opacity` over 150–250ms with `ease-out`. Focus and active feedback remain visible without motion, and `prefers-reduced-motion` disables non-essential transitions.

## 7. Depth & Surface

The surface strategy is **mixed**: white cards use the documented divider plus a low three-layer shadow (`0 0 0 1px rgba(0,0,0,.02), 0 2px 6px rgba(0,0,0,.04), 0 4px 8px rgba(0,0,0,.08)`) only when elevated. The canvas remains warm rather than stark white.

## 8. Accessibility & Accepted Debt

Every control has an accessible name, 44px minimum touch target, strong keyboard focus, and no color-only status. The bootstrap screen has no decorative motion. Accepted debt: final campus-map and data-heavy recommendation cards require route-level keyboard and responsive visual QA when they are implemented.
