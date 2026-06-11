import type { SugestaoResponse } from '../types/sugestao'
import { sugestaoSchema } from './sugestao-schemas'

/**
 * Assinatura mínima de um client GraphQL — injetada para facilitar teste/mocking.
 * Retorna `unknown` de propósito: o serviço estreita a resposta em runtime.
 */
export type HygraphRequest = (
  query: string,
  variables?: Record<string, unknown>,
) => Promise<unknown>

export class SugestaoError extends Error {
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
    }
  }
`

const CREATE_SUGESTAO_MUTATION = /* GraphQL */ `
  mutation createSugestao(
    $tipo: SugestaoTipo!
    $payload: Json
    $alvo: GroupWhereUniqueInput
    $justificativa: String!
    $contatoEmail: String
  ) {
    createSugestao(
      data: {
        tipo: $tipo
        payload: $payload
        alvo: { connect: $alvo }
        justificativa: $justificativa
        contatoEmail: $contatoEmail
      }
    ) {
      id
    }
  }
`

const CREATE_SUGESTAO_SEM_ALVO_MUTATION = /* GraphQL */ `
  mutation createSugestao(
    $tipo: SugestaoTipo!
    $payload: Json
    $justificativa: String!
    $contatoEmail: String
  ) {
    createSugestao(
      data: {
        tipo: $tipo
        payload: $payload
        justificativa: $justificativa
        contatoEmail: $contatoEmail
      }
    ) {
      id
    }
  }
`

/** Lê `data.<chave>.id` de uma resposta GraphQL sem depender de type casts. */
function lerIdDeResposta(data: unknown, chave: 'group' | 'createSugestao'): string | null {
  if (data && typeof data === 'object' && chave in data) {
    const node = Reflect.get(data, chave)
    if (node && typeof node === 'object' && 'id' in node) {
      const id = Reflect.get(node, 'id')
      if (typeof id === 'string') {
        return id
      }
    }
  }
  return null
}

/**
 * Valida o corpo recebido, confirma a existência do alvo (UPDATE/DELETE) e cria
 * a entry `Sugestao` em DRAFT no Hygraph. Lança `SugestaoError` com o status
 * HTTP apropriado: 400 validação, 404 alvo inexistente, 502 falha no Hygraph.
 */
export async function criarSugestao(
  body: unknown,
  hygraph: HygraphRequest,
): Promise<SugestaoResponse> {
  const parsed = sugestaoSchema.safeParse(body)

  if (!parsed.success) {
    throw new SugestaoError(
      400,
      'Sugestão inválida',
      parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    )
  }

  const { tipo, alvoId, payload, justificativa, contatoEmail } = parsed.data

  if (alvoId) {
    let alvo: unknown
    try {
      alvo = await hygraph(GROUP_EXISTS_QUERY, { id: alvoId })
    } catch {
      throw new SugestaoError(502, 'Não foi possível confirmar o grupo no momento')
    }
    if (!lerIdDeResposta(alvo, 'group')) {
      throw new SugestaoError(404, 'Grupo alvo não encontrado')
    }
  }

  const variables: Record<string, unknown> = {
    tipo,
    payload: tipo === 'DELETE' ? undefined : payload,
    justificativa,
    contatoEmail: contatoEmail || undefined,
  }
  if (alvoId) {
    variables.alvo = { id: alvoId }
  }

  let created: unknown
  try {
    created = await hygraph(
      alvoId ? CREATE_SUGESTAO_MUTATION : CREATE_SUGESTAO_SEM_ALVO_MUTATION,
      variables,
    )
  } catch {
    throw new SugestaoError(502, 'Não foi possível registrar a sugestão no momento')
  }

  const id = lerIdDeResposta(created, 'createSugestao')
  if (!id) {
    throw new SugestaoError(502, 'Não foi possível registrar a sugestão no momento')
  }

  return { ok: true, id }
}
