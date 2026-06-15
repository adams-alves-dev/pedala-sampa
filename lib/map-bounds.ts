import type { FitBoundsOptions, LatLngTuple } from 'leaflet'
import type { GeoPoint } from '../types/group'

/** Max zoom for programmatic moves (selection fly or filter refit). */
export const FLY_ZOOM = 14

/**
 * Fraction of the map height the mobile bottom sheet may cover. Used as bottom
 * padding when fitting bounds and (halved) as the centre shift when flying to a
 * single pin, so the pin lands at the same height in both moves.
 */
export const SHEET_OVERLAP = 0.4

const FIT_PADDING = 48

export function groupsToPoints(
  groups: { departureLocation: GeoPoint }[],
): LatLngTuple[] {
  return groups.map((group) => [
    group.departureLocation.latitude,
    group.departureLocation.longitude,
  ])
}

export function buildFitOptions(
  mapHeight: number,
  isMobile: boolean,
): FitBoundsOptions {
  return {
    paddingTopLeft: [FIT_PADDING, FIT_PADDING],
    paddingBottomRight: [
      FIT_PADDING,
      isMobile ? mapHeight * SHEET_OVERLAP : FIT_PADDING,
    ],
    maxZoom: FLY_ZOOM,
  }
}
