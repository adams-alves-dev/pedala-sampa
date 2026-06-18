import { z } from 'zod'
import { shortText } from './text-schemas'

/**
 * Schema do feedback genérico (canal de contato). Espelha as defesas do schema de
 * sugestão: `message` sanitizada (sem HTML), e-mail opcional, honeypot e token do
 * Turnstile. O honeypot/token são tratados na server route, não persistidos.
 */
export const feedbackSchema = z.object({
  message: shortText(2000).pipe(
    z.string().min(10, 'Conte um pouco mais — mínimo de 10 caracteres'),
  ),
  contactEmail: z
    .union([z.literal(''), z.email('E-mail inválido').max(200)])
    .optional(),
  turnstileToken: z.string().max(4096).optional(),
  website: z.string().max(500).optional(),
})

export type ValidatedFeedback = z.infer<typeof feedbackSchema>
