import type { SuggestionGroupPayload } from '../types/suggestion'
import type {
  GroupCreateInput,
  GroupInfoCreateInput,
  GroupInfoUpdateInput,
  GroupUpdateInput,
  LocationInput,
  RichTextAst,
} from '../types/hygraph'

/**
 * Gera um slug a partir do nome: minúsculas, sem acentos, separado por hífens.
 * Ex.: "Pedal da Sé" → "pedal-da-se". A checagem de colisão é I/O (fica na CLI).
 */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Monta o AST de rich-text de um parágrafo com um único link. O Hygraph gera o
 * HTML a partir desse AST, e a leitura (`extractLinkUrl` em `group-normalizers`)
 * reextrai a URL do HTML — por isso o `link` segue funcionando no site.
 */
export function buildLinkAst(url: string, label: string): RichTextAst {
  return {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            href: url,
            openInNewTab: true,
            children: [{ text: label }],
          },
        ],
      },
    ],
  }
}

/** O CMS guarda horários como "20:30h"; o payload traz "20:30". */
export function normalizeStartHour(value: string): string {
  const trimmed = value.trim()
  return /h$/i.test(trimmed) ? trimmed : `${trimmed}h`
}

/**
 * Monta o `GroupInfoCreateInput` a partir do payload, ou `null` se a agenda
 * estiver incompleta. O `GroupInfo` exige day/startHour/effort/distance/rhythm,
 * mas uma sugestão CREATE pode trazer só name+lat+lng — nesse caso não há agenda.
 */
export function groupInfoCreateInputFromPayload(
  payload: SuggestionGroupPayload,
): GroupInfoCreateInput | null {
  const { day, startHour, effort, distanceKm, rhythmKmH, address } = payload
  if (
    day === undefined ||
    startHour === undefined ||
    effort === undefined ||
    distanceKm === undefined ||
    rhythmKmH === undefined
  ) {
    return null
  }
  const input: GroupInfoCreateInput = {
    day,
    startHour: normalizeStartHour(startHour),
    effort,
    distance: distanceKm,
    rhythm: Math.round(rhythmKmH), // `rhythm` é Int! no Hygraph
  }
  if (address !== undefined) {
    input.address = address
  }
  return input
}

/** A agenda do payload está completa o suficiente para virar um GroupInfo? */
export function isScheduleComplete(payload: SuggestionGroupPayload): boolean {
  return groupInfoCreateInputFromPayload(payload) !== null
}

/**
 * Monta o `GroupCreateInput` de uma sugestão CREATE, ou `null` se faltar um
 * campo obrigatório do grupo (name/lat/lng). O `slug` é resolvido fora (a
 * checagem de colisão é I/O). O GroupInfo aninhado só entra com agenda completa.
 */
export function groupCreateInputFromPayload(
  payload: SuggestionGroupPayload,
  slug: string,
): GroupCreateInput | null {
  const { name, latitude, longitude, linkUrl } = payload
  if (name === undefined || latitude === undefined || longitude === undefined) {
    return null
  }
  const input: GroupCreateInput = {
    name,
    slug,
    departureLocation: { latitude, longitude },
  }
  if (linkUrl !== undefined) {
    input.link = buildLinkAst(linkUrl, name)
  }
  const schedule = groupInfoCreateInputFromPayload(payload)
  if (schedule) {
    input.groupInfos = { create: [schedule] }
  }
  return input
}

export type GroupUpdateParts = {
  group?: GroupUpdateInput
  groupInfo?: GroupInfoUpdateInput
}

/** Snapshot atual do grupo, para completar updates parciais. */
export type CurrentGroup = {
  name: string
  departureLocation: LocationInput
}

/**
 * Roteia o diff de uma sugestão UPDATE entre `Group` e `GroupInfo`. Os campos de
 * agenda (address/day/startHour/effort/distance/rhythm) vão para o GroupInfo; o
 * resto vai para o Group. `LocationInput` exige lat+lng juntos, então um diff
 * parcial é completado com o valor atual; o rótulo do link idem (usa o nome).
 */
export function splitUpdatePayload(
  diff: SuggestionGroupPayload,
  current: CurrentGroup,
): GroupUpdateParts {
  const group: GroupUpdateInput = {}
  const groupInfo: GroupInfoUpdateInput = {}

  if (diff.name !== undefined) {
    group.name = diff.name
  }
  if (diff.linkUrl !== undefined) {
    group.link = buildLinkAst(diff.linkUrl, diff.name ?? current.name)
  }
  if (diff.latitude !== undefined || diff.longitude !== undefined) {
    group.departureLocation = {
      latitude: diff.latitude ?? current.departureLocation.latitude,
      longitude: diff.longitude ?? current.departureLocation.longitude,
    }
  }

  if (diff.address !== undefined) {
    groupInfo.address = diff.address
  }
  if (diff.day !== undefined) {
    groupInfo.day = diff.day
  }
  if (diff.startHour !== undefined) {
    groupInfo.startHour = normalizeStartHour(diff.startHour)
  }
  if (diff.effort !== undefined) {
    groupInfo.effort = diff.effort
  }
  if (diff.distanceKm !== undefined) {
    groupInfo.distance = diff.distanceKm
  }
  if (diff.rhythmKmH !== undefined) {
    groupInfo.rhythm = Math.round(diff.rhythmKmH)
  }

  const parts: GroupUpdateParts = {}
  if (Object.keys(group).length > 0) {
    parts.group = group
  }
  if (Object.keys(groupInfo).length > 0) {
    parts.groupInfo = groupInfo
  }
  return parts
}
