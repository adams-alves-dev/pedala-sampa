export type GeoPoint = {
  latitude: number
  longitude: number
}

export type GroupLink = {
  label?: string
  url?: string
  html?: string
}

export type GroupSchedule = {
  id: string
  day: string
  startHour: string
  effort: string
  distanceKm: number
  rhythmKmH: number
  rating?: number
}

export type Group = {
  id: string
  name: string
  slug: string
  departureAddress?: string
  departureLocation: GeoPoint
  link?: GroupLink
  schedules: GroupSchedule[]
}

export type DistanceRange = 'up-to-20' | '20-to-40' | 'over-40'
export type Period = 'morning' | 'afternoon' | 'night'
export type Rhythm = 'light' | 'moderate' | 'strong'

/** Filter categories with single selection (chips). */
export type FilterCategory =
  | 'day'
  | 'effort'
  | 'distanceRange'
  | 'period'
  | 'rhythm'

export type GroupFilters = {
  query: string
  day: string // '' = all
  effort: string // '' = all
  distanceRange?: DistanceRange
  period: Period | '' // '' = all
  rhythm: Rhythm | '' // '' = all
}
