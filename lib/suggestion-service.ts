import type { SuggestionResponse } from '../types/suggestion'
import { FormError } from './form-errors'
import { readIdFromResponse, type HygraphRequest } from './hygraph-response'
import { suggestionSchema } from './suggestion-schemas'
import type { ValidatedSuggestion } from './suggestion-schemas'

// re-export p/ compat: o teste de suggestion-service importa este tipo daqui
export type { HygraphRequest }

/** Erro do fluxo de sugestão (status HTTP + issues por campo). */
export class SuggestionError extends FormError {}

const GROUP_EXISTS_QUERY = /* GraphQL */ `
  query groupExists($id: ID!) {
    group(where: { id: $id }) {
      id
      name
      groupInfos {
        id
      }
    }
  }
`

const CREATE_SUGGESTION_MUTATION = /* GraphQL */ `
  mutation createSuggestion(
    $type: SuggestionType!
    $payload: Json
    $target: GroupWhereUniqueInput
    $justification: String!
    $contactEmail: String
  ) {
    createSuggestion(
      data: {
        type: $type
        payload: $payload
        group: { connect: $target }
        justification: $justification
        contactEmail: $contactEmail
        reviewStatus: PENDING
      }
    ) {
      id
    }
  }
`

const CREATE_SUGGESTION_WITHOUT_TARGET_MUTATION = /* GraphQL */ `
  mutation createSuggestion(
    $type: SuggestionType!
    $payload: Json
    $justification: String!
    $contactEmail: String
  ) {
    createSuggestion(
      data: {
        type: $type
        payload: $payload
        justification: $justification
        contactEmail: $contactEmail
        reviewStatus: PENDING
      }
    ) {
      id
    }
  }
`

/** Lê `data.group.name` da checagem de existência (para dar contexto no aviso). */
function readGroupName(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'group' in data) {
    const node = Reflect.get(data, 'group')
    if (node && typeof node === 'object' && 'name' in node) {
      const name = Reflect.get(node, 'name')
      if (typeof name === 'string') {
        return name
      }
    }
  }
  return undefined
}

/** Lê os ids das agendas (`data.group.groupInfos[].id`) do grupo alvo. */
function readScheduleIds(data: unknown): string[] {
  if (!data || typeof data !== 'object' || !('group' in data)) {
    return []
  }
  const node = Reflect.get(data, 'group')
  if (!node || typeof node !== 'object' || !('groupInfos' in node)) {
    return []
  }
  const infos = Reflect.get(node, 'groupInfos')
  if (!Array.isArray(infos)) {
    return []
  }
  const ids: string[] = []
  for (const info of infos) {
    if (info && typeof info === 'object' && 'id' in info) {
      const id = Reflect.get(info, 'id')
      if (typeof id === 'string') {
        ids.push(id)
      }
    }
  }
  return ids
}

/** Valida o corpo cru e lança `SuggestionError` 400 com issues por campo. */
export function parseSuggestion(body: unknown): ValidatedSuggestion {
  const parsed = suggestionSchema.safeParse(body)

  if (!parsed.success) {
    throw new SuggestionError(
      400,
      'Sugestão inválida',
      parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    )
  }

  return parsed.data
}

/**
 * Confirma a existência do alvo (UPDATE/DELETE) e cria a entry `Suggestion` em
 * DRAFT no Hygraph a partir de um corpo **já validado** (use `parseSuggestion` na
 * borda). Lança `SuggestionError`: 404 alvo inexistente, 502 falha no Hygraph.
 */
export async function createSuggestion(
  input: ValidatedSuggestion,
  hygraph: HygraphRequest,
): Promise<SuggestionResponse> {
  const { type, targetId, payload, justification, contactEmail } = input

  let targetName: string | undefined
  if (targetId) {
    let target: unknown
    try {
      target = await hygraph(GROUP_EXISTS_QUERY, { id: targetId })
    } catch {
      throw new SuggestionError(
        502,
        'Não foi possível confirmar o grupo no momento',
      )
    }
    if (!readIdFromResponse(target, 'group')) {
      throw new SuggestionError(404, 'Grupo alvo não encontrado')
    }
    // nome do alvo dá contexto no aviso do Discord (o id sozinho é opaco)
    targetName = readGroupName(target)

    // corrigir/remover UMA agenda: confirma que ela é do grupo alvo (o id viaja
    // no payload e não passa pelo schema relacional — validamos aqui)
    const scheduleId = payload?.scheduleId
    if (scheduleId && !readScheduleIds(target).includes(scheduleId)) {
      throw new SuggestionError(404, 'Agenda alvo não encontrada no grupo')
    }
  }

  const variables: Record<string, unknown> = {
    type,
    // DELETE normalmente não tem payload; quando tem, é só { scheduleId } (remover
    // UMA agenda) — o schema garante isso, então persistimos o payload validado
    payload,
    justification,
    contactEmail: contactEmail || undefined,
  }
  if (targetId) {
    variables.target = { id: targetId }
  }

  let created: unknown
  try {
    created = await hygraph(
      targetId
        ? CREATE_SUGGESTION_MUTATION
        : CREATE_SUGGESTION_WITHOUT_TARGET_MUTATION,
      variables,
    )
  } catch {
    throw new SuggestionError(
      502,
      'Não foi possível registrar a sugestão no momento',
    )
  }

  const id = readIdFromResponse(created, 'createSuggestion')
  if (!id) {
    throw new SuggestionError(
      502,
      'Não foi possível registrar a sugestão no momento',
    )
  }

  return { ok: true, id, targetName }
}
