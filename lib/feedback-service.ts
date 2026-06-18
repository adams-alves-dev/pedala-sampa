import type { FeedbackResponse } from '../types/feedback'
import { feedbackSchema } from './feedback-schema'
import type { ValidatedFeedback } from './feedback-schema'
import { FormError } from './form-errors'
import { readIdFromResponse, type HygraphRequest } from './hygraph-response'

/** Erro do fluxo de feedback (status HTTP + issues por campo). */
export class FeedbackError extends FormError {}

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
 * Cria a entry `Feedback` em DRAFT no Hygraph a partir de um corpo **já validado**
 * (use `parseFeedback` na borda). Lança `FeedbackError` 502 se o Hygraph falhar.
 */
export async function createFeedback(
  input: ValidatedFeedback,
  hygraph: HygraphRequest,
): Promise<FeedbackResponse> {
  const { message, contactEmail } = input

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
