import type { FeedbackResponse } from '../types/feedback'
import { feedbackSchema } from './feedback-schema'
import type { ValidatedFeedback } from './feedback-schema'
import { readIdFromResponse, type HygraphRequest } from './hygraph-response'

export class FeedbackError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly issues?: Array<{ path: string; message: string }>,
  ) {
    super(message)
  }
}

const CREATE_FEEDBACK_MUTATION = /* GraphQL */ `
  mutation createFeedback($message: String!, $contactEmail: String) {
    createFeedback(data: { message: $message, contactEmail: $contactEmail }) {
      id
    }
  }
`

/** Valida o corpo cru e lança `FeedbackError` 400 com issues por campo. */
export function parseFeedback(body: unknown): ValidatedFeedback {
  const parsed = feedbackSchema.safeParse(body)

  if (!parsed.success) {
    throw new FeedbackError(
      400,
      'Feedback inválido',
      parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    )
  }

  return parsed.data
}

/**
 * Valida o corpo recebido e cria a entry `Feedback` em DRAFT no Hygraph. Lança
 * `FeedbackError` com o status HTTP apropriado: 400 validação, 502 falha no Hygraph.
 */
export async function createFeedback(
  body: unknown,
  hygraph: HygraphRequest,
): Promise<FeedbackResponse> {
  const { message, contactEmail } = parseFeedback(body)

  let created: unknown
  try {
    created = await hygraph(CREATE_FEEDBACK_MUTATION, {
      message,
      contactEmail: contactEmail || undefined,
    })
  } catch {
    throw new FeedbackError(
      502,
      'Não foi possível registrar o feedback no momento',
    )
  }

  const id = readIdFromResponse(created, 'createFeedback')
  if (!id) {
    throw new FeedbackError(
      502,
      'Não foi possível registrar o feedback no momento',
    )
  }

  return { ok: true, id }
}
