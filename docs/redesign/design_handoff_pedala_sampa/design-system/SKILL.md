# Pedala Sampa Design System — Skill

Use this design system for anything in the Pedala Sampa product: the map explorer, group pages, contribution flows, and marketing/about pages.

## When to use
Any screen, component, or page for Pedala Sampa — a collaborative map of São Paulo cycling groups.

## How to use
1. Load fonts (Syne + Sora) and both stylesheets: `colors_and_type.css`, then `components.css`.
2. Use `ps-` prefixed component classes; never hand-roll equivalents.
3. Reference color/type/spacing only through `--*` tokens defined in `colors_and_type.css`. Look up the exact token name before using `var(--…)`.
4. For new shades, derive in oklch from the core palette — don't introduce unrelated hues.

## Aesthetic in one line
Urban civic **wayfinding**: warm asphalt ink on concrete, ciclovia green for selection, signal-yellow parallelogram CTAs, hard offset shadows (no blur), angular clipped surfaces. Syne display + Sora body.

## Key components
- `.ps-header` — asphalt bar, cut bottom-right corner.
- `.ps-cta` — yellow parallelogram CTA (primary action: "Sugerir grupo").
- `.ps-btn` (`--solid`, `--ghost`, `--sm`, `--block`) — secondary actions.
- `.ps-card` (`--selected`) — group card with accent rail.
- `.ps-chip` (`--active`, `--count`) — filter tags + result count.
- `.ps-badge` inside `.ps-badges` — Dia / Saída / Nível / Distância / Ritmo.
- `.ps-pin` (`--selected`) — numbered teardrop map markers.
- `.ps-search`, `.ps-input`, `.ps-select`, `.ps-fieldlabel` — forms.
- `.ps-quickview`, `.ps-state` (`--error`) — quick view + empty/error.

## Don'ts
- No gradients, no blurred shadows, no rounded-pill cards.
- No fonts beyond Syne/Sora. No emoji as UI.
- Don't invent colors outside the eight core tokens + derived shades.
