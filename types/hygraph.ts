export type HygraphGeoPoint = {
  latitude?: number | null
  longitude?: number | null
}

export type HygraphLink = {
  text?: string | null
  html?: string | null
}

export type HygraphGroupInfo = {
  id: string
  address?: string | null
  day?: string | null
  startHour?: string | null
  effort?: string | null
  distance?: number | null
  rhythm?: number | null
  rating?: number | null
}

export type HygraphGroup = {
  id: string
  name?: string | null
  slug?: string | null
  link?: HygraphLink | null
  departureLocation?: HygraphGeoPoint | null
  groupInfos?: HygraphGroupInfo[] | null
}
