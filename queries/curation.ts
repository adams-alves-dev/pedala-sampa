// Queries e mutations usadas só pela CLI de curadoria (`scripts/curate.ts`).
// Todas falam a Content API do Hygraph, com o token privilegiado de curadoria.

/**
 * Sugestões pendentes (em DRAFT), mais antigas primeiro. O `first: 100` é o teto
 * do Hygraph por página — sem ele a API devolve só as 10 primeiras em silêncio.
 */
export const PENDING_SUGGESTIONS_QUERY = /* GraphQL */ `
  query pendingSuggestions {
    suggestions(
      where: { reviewStatus: PENDING }
      stage: DRAFT
      orderBy: createdAt_ASC
      first: 100
    ) {
      id
      type
      payload
      justification
      contactEmail
      createdAt
      group {
        id
        slug
        name
      }
    }
  }
`

/**
 * Uma sugestão específica por id (em DRAFT), para o caminho `--id`. Buscar no
 * servidor evita o falso negativo de filtrar a página de pendentes no cliente.
 * Traz `reviewStatus` para avisar quando a sugestão já não está mais pendente.
 */
export const SUGGESTION_BY_ID_QUERY = /* GraphQL */ `
  query suggestionById($id: ID!) {
    suggestion(where: { id: $id }, stage: DRAFT) {
      id
      type
      payload
      justification
      contactEmail
      createdAt
      reviewStatus
      group {
        id
        slug
        name
      }
    }
  }
`

/**
 * Checagem de colisão de slug antes de criar um grupo. Consulta em `stage: DRAFT`
 * (não no PUBLISHED default) para também enxergar grupos criados pela própria CLI
 * que ainda não foram publicados — senão a colisão escaparia e geraria duplicata.
 */
export const GROUP_BY_SLUG_QUERY = /* GraphQL */ `
  query groupBySlug($slug: String!) {
    group(where: { slug: $slug }, stage: DRAFT) {
      id
    }
  }
`

/** Estado atual do grupo no UPDATE: nome/local (p/ completar diffs) + agendas. */
export const GROUP_FOR_UPDATE_QUERY = /* GraphQL */ `
  query groupForUpdate($id: ID!) {
    group(where: { id: $id }, stage: DRAFT) {
      id
      name
      departureLocation {
        latitude
        longitude
      }
      groupInfos(orderBy: createdAt_ASC) {
        id
      }
    }
  }
`

export const CREATE_GROUP_MUTATION = /* GraphQL */ `
  mutation createGroup($data: GroupCreateInput!) {
    createGroup(data: $data) {
      id
      slug
    }
  }
`

export const UPDATE_GROUP_MUTATION = /* GraphQL */ `
  mutation updateGroup($id: ID!, $data: GroupUpdateInput!) {
    updateGroup(where: { id: $id }, data: $data) {
      id
    }
  }
`

export const UPDATE_GROUP_INFO_MUTATION = /* GraphQL */ `
  mutation updateGroupInfo($id: ID!, $data: GroupInfoUpdateInput!) {
    updateGroupInfo(where: { id: $id }, data: $data) {
      id
    }
  }
`

/** Marca a sugestão (APPROVED/REJECTED) no draft — nunca publica a Suggestion. */
export const MARK_SUGGESTION_MUTATION = /* GraphQL */ `
  mutation markSuggestion($id: ID!, $status: SuggestionStatus!) {
    updateSuggestion(where: { id: $id }, data: { reviewStatus: $status }) {
      id
    }
  }
`
