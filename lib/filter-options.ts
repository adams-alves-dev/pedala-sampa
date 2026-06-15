import type {
  DistanceRange,
  FilterCategory,
  Period,
  Rhythm,
} from '../types/group'

// Canonical typed value lists (used both for chips and for validating input).
export const DISTANCE_RANGES: DistanceRange[] = [
  'up-to-20',
  '20-to-40',
  'over-40',
]
export const PERIODS: Period[] = ['morning', 'afternoon', 'night']
export const RHYTHMS: Rhythm[] = ['light', 'moderate', 'strong']

// User-facing labels (pt-BR).
export const DISTANCE_LABELS: Record<DistanceRange, string> = {
  'up-to-20': 'Até 20 km',
  '20-to-40': '20 a 40 km',
  'over-40': 'Acima de 40 km',
}
export const PERIOD_LABELS: Record<Period, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  night: 'Noite',
}
export const RHYTHM_LABELS: Record<Rhythm, string> = {
  light: 'Leve',
  moderate: 'Moderado',
  strong: 'Forte',
}

export type FilterOption = { value: string; label: string }
export type FilterGroup = {
  key: FilterCategory
  label: string
  options: FilterOption[]
}

/**
 * Build the five filter groups for the chips UI. Day and level are derived from
 * the actual data (mirrors the prototype's FILTER_DEFS); distance/period/rhythm
 * are fixed enumerations.
 */
export function buildFilterGroups(
  days: string[],
  efforts: string[],
): FilterGroup[] {
  return [
    {
      key: 'day',
      label: 'Dia da semana',
      options: days.map((value) => ({ value, label: value })),
    },
    {
      key: 'effort',
      label: 'Nível',
      options: efforts.map((value) => ({ value, label: value })),
    },
    {
      key: 'distanceRange',
      label: 'Distância',
      options: DISTANCE_RANGES.map((value) => ({
        value,
        label: DISTANCE_LABELS[value],
      })),
    },
    {
      key: 'period',
      label: 'Período',
      options: PERIODS.map((value) => ({ value, label: PERIOD_LABELS[value] })),
    },
    {
      key: 'rhythm',
      label: 'Ritmo',
      options: RHYTHMS.map((value) => ({ value, label: RHYTHM_LABELS[value] })),
    },
  ]
}
