import type { Period, Rhythm } from '../types/group'

export function getEstimatedLapDuration({
  distanceKm,
  rhythmKmH,
}: {
  distanceKm: number
  rhythmKmH: number
}) {
  if (!distanceKm || !rhythmKmH || rhythmKmH <= 0) {
    return '00h:00m'
  }

  const totalMinutes = Math.round((distanceKm / rhythmKmH) * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, '0')}h:${String(minutes).padStart(2, '0')}m`
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
