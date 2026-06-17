import type { SuggestionResponse } from '../types/suggestion'
import { suggestionSchema } from './suggestion-schemas'
import type { ValidatedSuggestion } from './suggestion-schemas'

/**
 * Assinatura mínima de um client GraphQL — injetada para facilitar teste/mocking.
 * Retorna `unknown` de propósito: o serviço estreita a resposta em runtime.
 */
export type HygraphRequest = (
  query: string,
  variables?: Record<string, unknown>,
) => Promise<unknown>

export class SuggestionError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly issues?: Array<{ path: string; message: string }>,
  ) {
    super(message)
  }
}

const GROUP_EXISTS_QUERY = /* GraphQL */ `
  query groupExists($id: ID!) {
    group(where: { id: $id }) {
      id
      name
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

/** Lê `data.<key>.id` de uma resposta GraphQL sem depender de type casts. */
function readIdFromResponse(
  data: unknown,
  key: 'group' | 'createSuggestion',
): string | null {
  if (data && typeof data === 'object' && key in data) {
    const node = Reflect.get(data, key)
    if (node && typeof node === 'object' && 'id' in node) {
      const id = Reflect.get(node, 'id')
      if (typeof id === 'string') {
        return id
      }
    }
  }
  return null
}

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
 * Valida o corpo recebido, confirma a existência do alvo (UPDATE/DELETE) e cria
 * a entry `Suggestion` em DRAFT no Hygraph. Lança `SuggestionError` com o status
 * HTTP apropriado: 400 validação, 404 alvo inexistente, 502 falha no Hygraph.
 */
export async function createSuggestion(
  body: unknown,
  hygraph: HygraphRequest,
): Promise<SuggestionResponse> {
  const { type, targetId, payload, justification, contactEmail } =
    parseSuggestion(body)

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
