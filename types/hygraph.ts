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

// --- Input types das mutations de curadoria (Content API) ---
// Modelam apenas os campos que a CLI escreve. Nomes e tipos conferidos por
// introspection do schema do Hygraph: `distance` é Float, `rhythm` é Int,
// `link` é o scalar RichTextAST e `departureLocation` é um Location.

export type LocationInput = {
  latitude: number
  longitude: number
}

/**
 * `RichTextAST` é um scalar no Hygraph. Modelamos só o necessário para gravar
 * um parágrafo com um único link — o único uso atual (o `link` do grupo).
 */
export type RichTextNode = {
  type?: string
  text?: string
  href?: string
  openInNewTab?: boolean
  children?: RichTextNode[]
}

export type RichTextAst = {
  children: RichTextNode[]
}

export type GroupInfoCreateInput = {
  day: string
  startHour: string
  effort: string
  distance: number
  rhythm: number
  address?: string
}

export type GroupCreateInput = {
  name: string
  slug: string
  departureLocation: LocationInput
  link?: RichTextAst
  groupInfos?: { create: GroupInfoCreateInput[] }
}

export type GroupUpdateInput = {
  name?: string
  slug?: string
  departureLocation?: LocationInput
  link?: RichTextAst
}

export type GroupInfoUpdateInput = {
  address?: string
  day?: string
  startHour?: string
  effort?: string
  distance?: number
  rhythm?: number
}
