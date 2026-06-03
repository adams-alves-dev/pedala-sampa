/**
 * Pedala Sampa line-icon set (ported from proto-icons.js).
 * 24×24, 1.75 stroke, currentColor, round caps — matches the signage aesthetic.
 * Paths are static and trusted (no user input) — safe for v-html.
 */
export const ICON_PATHS = {
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  gauge: '<path d="M4 19a8 8 0 1 1 16 0"/><path d="M12 19l4.5-6"/><circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none"/>',
  route: '<circle cx="5.5" cy="18.5" r="2.4"/><circle cx="18.5" cy="5.5" r="2.4"/><path d="M8 18.5h6a3.5 3.5 0 0 0 0-7H10a3.5 3.5 0 0 1 0-7h6"/>',
  speed: '<circle cx="12" cy="13" r="8.5"/><path d="M12 13l4-3.5M12 4.5v1.5"/>',
  pin: '<path d="M12 21.5s7-6.2 7-11.2A7 7 0 0 0 5 10.3c0 5 7 11.2 7 11.2Z"/><circle cx="12" cy="10" r="2.6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l4.5 4.5"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2.2"/><circle cx="8" cy="17" r="2.2"/>',
  arrowUR: '<path d="M7 17L17 7M9 7h8v8"/>',
  bike: '<circle cx="6" cy="17" r="3.4"/><circle cx="18" cy="17" r="3.4"/><path d="M6 17l4.5-8H14M9 9h6l2.5 8M14 9l-2 4.5h-6"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 3v2.2M12 18.8V21M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M3 12h2.2M18.8 12H21M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>',
  moon: '<path d="M20 14.2A8 8 0 1 1 9.8 4 6.4 6.4 0 0 0 20 14.2Z"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  chevronRight: '<path d="M9 6l6 6-6 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chat: '<path d="M4 5.5h16v11H9l-4 3.5v-3.5H4Z"/><path d="M8.5 11h7M8.5 8.2h4.5"/>',
  pencil: '<path d="M14.5 5.5l4 4M4 20l1-4.5L16 4.5a2 2 0 0 1 3 3L8 18.5 4 20Z"/>',
  layers: '<path d="M12 3.5l9 5-9 5-9-5 9-5Z"/><path d="M3 13.5l9 5 9-5"/>',
  map: '<path d="M9 4.5L3.5 7v12.5L9 17l6 2.5 5.5-2.5V4.5L15 7 9 4.5Z"/><path d="M9 4.5V17M15 7v12.5"/>',
  flag: '<path d="M6 21V4M6 5h11l-2.5 4L17 13H6"/>',
  users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 6.2a3 3 0 0 1 0 5.6M16.5 14.2A5.5 5.5 0 0 1 20.5 19.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  sparkle: '<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3Z"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2Z"/>',
}

export type IconName = keyof typeof ICON_PATHS

/** Semantic badge keys (English). UI labels live in BADGE_LABEL. */
export type BadgeKey = 'day' | 'departure' | 'level' | 'distance' | 'rhythm' | 'avgLap'

/** Badge key → icon name (mirrors PS.BADGE_ICON from the handoff). */
export const BADGE_ICON: Record<BadgeKey, IconName> = {
  day: 'calendar',
  departure: 'clock',
  level: 'gauge',
  distance: 'route',
  rhythm: 'speed',
  avgLap: 'compass',
}

/** Badge key → user-facing label (pt-BR). */
export const BADGE_LABEL: Record<BadgeKey, string> = {
  day: 'Dia',
  departure: 'Saída',
  level: 'Nível',
  distance: 'Distância',
  rhythm: 'Ritmo',
  avgLap: 'Volta média',
}
