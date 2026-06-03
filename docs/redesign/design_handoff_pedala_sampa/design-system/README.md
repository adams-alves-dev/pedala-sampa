# Pedala Sampa — Design System

A civic **wayfinding / urban signage** system for a collaborative map of São Paulo cycling groups. Warm asphalt ink, concrete surfaces, ciclovia green, and a signal-yellow accent borrowed from street signage. Angular cuts and hard offset shadows give it a printed-sign feel; the type pairs a geometric display face with a humanist body.

Tokens are lifted from the project's Nuxt 3 redesign branch (`assets/css/main.css`) and extended with semantic roles + a few harmonious derived shades.

## Files
- `colors_and_type.css` — design tokens (color, type, spacing, motion, elevation) + semantic type classes.
- `components.css` — shared component layer (`ps-` prefix): header, CTAs, buttons, badges, chips, cards, fields, pins, states, quick view.
- `themes.css` — 6 color themes + 5 font pairings (applied via `[data-theme]` / `[data-font]` on `<html>`).
- `proto-icons.js` — line-icon set (`PS.icon(name)`), 1.75px stroke, currentColor.
- `assets/brand-logo.svg`, `assets/favicon.svg` — the bike-pin mark.
- `Design System.html` — visual showcase of every foundation + component.

## Themes (Tweakable)
`Asfalto` (default) · `Ciclovia` (verde) · `Pôr do Sol` (terracota) · `Metrô SP` (azul) · `Coral & Teal` · `Noturno` (dark, troca os tiles do mapa). Cada tema redefine a paleta core via `[data-theme]`.

## Font pairings (Tweakable)
`Sinal` Archivo+Hanken Grotesk (default) · `Grotesca` Space Grotesk+IBM Plex Sans · `Editorial` Bricolage+Public Sans · `Geo` Unbounded+Hanken · `Clássica` Syne+Sora.

## Icons
Conjunto de linha (`PS.icon('calendar'|'clock'|'gauge'|'route'|'speed'|'pin'|…)`), 24×24, traço 1.75, `currentColor`. Usados nos badges (Dia/Saída/Nível/Distância/Ritmo), botões, navegação e títulos de seção.

## Foundations

### Color
| Token | Hex | Role |
|---|---|---|
| `--color-asphalt` | `#1A120B` | ink, dark surfaces (header) |
| `--color-concrete` | `#E8E0D0` | app background |
| `--color-paper` | `#FFF8EE` | cards, panels |
| `--color-bike-green` | `#00796B` | primary brand accent, selection |
| `--color-sign-yellow` | `#FFB300` | CTAs, highlights, focus ring |
| `--color-alert-red` | `#E53935` | errors, destructive |
| `--color-transit-blue` | `#1565C0` | links, info |
| `--color-border` | `#C8BFA8` | warm concrete borders |

### Type
- **Display:** Archivo (600/700/800) — headings, group names, brand (default "Sinal" pairing).
- **Body / UI:** Hanken Grotesk (400/600/800) — copy, labels, data (tabular-nums).
- Five pairings ship as a Tweak; scale runs `--text-xs` (11px) → `--text-3xl` (clamp to 80px).

### Signature moves
- **Parallelogram CTA** (`.ps-cta`) — yellow signage button with a slanted clip-path and a hard offset shadow on hover.
- **Hard offset shadow** (`--shadow-hard`, `4px 4px 0`) — printed-sign depth, no blur.
- **Accent-rail card** (`.ps-card`) — 5px green rail flips on hover/selection.
- **Teardrop pin** (`.ps-pin`) — numbered map markers; selected grows + turns yellow.
- **Angular header** — asphalt bar with a cut bottom-right corner.

## Usage
Load fonts, then the two stylesheets:
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Sora:wght@400;600;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="colors_and_type.css" />
<link rel="stylesheet" href="components.css" />
```
Never invent colors or type outside these tokens. New shades should be derived in oklch from the core palette.
