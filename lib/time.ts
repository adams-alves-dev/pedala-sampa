import type { Period, Rhythm } from '../types/group'

/** Duração estimada da volta — `null` quando distância/ritmo não foram informados. */
export function getEstimatedLapDuration({
  distanceKm,
  rhythmKmH,
}: {
  distanceKm: number
  rhythmKmH: number
}): string | null {
  if (!distanceKm || !rhythmKmH || rhythmKmH <= 0) {
    return null
  }

  const totalMinutes = Math.round((distanceKm / rhythmKmH) * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, '0')}h:${String(minutes).padStart(2, '0')}m`
}

/**
 * Inverso de `getEstimatedLapDuration`: ritmo médio (km/h) a partir da distância
 * e da duração. Para quem sabe quanto tempo o pedal dura, mas não o km/h.
 * `null` quando os dados não permitem o cálculo. Arredonda em 1 casa decimal.
 */
export function getRhythmFromDistanceAndDuration({
  distanceKm,
  durationMinutes,
}: {
  distanceKm: number
  durationMinutes: number
}): number | null {
  if (!distanceKm || !durationMinutes || durationMinutes <= 0) {
    return null
  }

  const rhythm = distanceKm / (durationMinutes / 60)
  return Math.round(rhythm * 10) / 10
}

export function getPeriodFromHour(startHour: string): Period {
  const [rawHour] = startHour.split(':')
  const hour = Number(rawHour)

  if (Number.isNaN(hour)) {
    return 'night'
  }

  if (hour >= 5 && hour <= 11) {
    return 'morning'
  }

  if (hour >= 12 && hour <= 17) {
    return 'afternoon'
  }

  return 'night'
}

export function getRhythmCategory(rhythmKmH: number): Rhythm {
  if (rhythmKmH < 16) {
    return 'light'
  }

  if (rhythmKmH <= 22) {
    return 'moderate'
  }

  return 'strong'
}
