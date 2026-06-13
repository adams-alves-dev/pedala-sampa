import { z } from 'zod'
import { SUGGESTION_TYPES } from '../types/suggestion'
import { SP_BOUNDS } from './sp-bounds'

export { SP_BOUNDS }

/** Remove tags HTML e normaliza espaços — sugestões são texto puro. */
export function sanitizeText(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const shortText = (max: number) =>
  z.string().transform(sanitizeText).pipe(z.string().max(max, `Máximo de ${max} caracteres`))

const hourSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido (use o formato HH:MM)')

export const payloadSchema = z
  .object({
    name: shortText(120).pipe(z.string().min(2, 'Nome muito curto')),
    linkUrl: z
      .string()
      .trim()
      .url('Link inválido (inclua https://)')
      // o .url() do Zod aceita qualquer scheme (javascript:, data:) — só http(s) faz sentido aqui
      .regex(/^https?:\/\//i, 'Use um link http(s)')
      .max(500, 'Link longo demais'),
    address: shortText(200),
    day: shortText(40),
    startHour: hourSchema,
    effort: shortText(40),
    distanceKm: z
      .number('Distância deve ser um número')
      .positive('Distância deve ser maior que zero')
      .max(600, 'Distância improvável para um pedal'),
    rhythmKmH: z
      .number('Ritmo deve ser um número')
      .positive('Ritmo deve ser maior que zero')
      .max(60, 'Ritmo improvável para um pedal'),
    latitude: z
      .number('Latitude deve ser um número')
      .min(SP_BOUNDS.latMin, 'Latitude fora da região de São Paulo')
      .max(SP_BOUNDS.latMax, 'Latitude fora da região de São Paulo'),
    longitude: z
      .number('Longitude deve ser um número')
      .min(SP_BOUNDS.lngMin, 'Longitude fora da região de São Paulo')
      .max(SP_BOUNDS.lngMax, 'Longitude fora da região de São Paulo'),
  })
  .partial()

const baseSchema = z.object({
  type: z.enum(SUGGESTION_TYPES, 'Tipo de sugestão inválido'),
  targetId: z.string().trim().min(1).max(64).optional(),
  payload: payloadSchema.optional(),
  justification: shortText(1000).pipe(
    z.string().min(10, 'Conte um pouco mais — mínimo de 10 caracteres'),
  ),
  contactEmail: z.union([z.literal(''), z.email('E-mail inválido').max(200)]).optional(),
  turnstileToken: z.string().max(4096).optional(),
  website: z.string().max(500).optional(),
})

const REQUIRED_CREATE_FIELDS: ReadonlyArray<'name' | 'latitude' | 'longitude'> = [
  'name',
  'latitude',
  'longitude',
]

/** Conditional rules per type: target required for UPDATE/DELETE, payload for CREATE/UPDATE. */
export const suggestionSchema = baseSchema.superRefine((data, ctx) => {
  const needsTarget = data.type === 'UPDATE' || data.type === 'DELETE'
  const needsPayload = data.type === 'CREATE' || data.type === 'UPDATE'
  const filledFieldCount = Object.values(data.payload ?? {}).filter(
    (value) => value !== undefined,
  ).length

  if (needsTarget && !data.targetId) {
    ctx.addIssue({
      code: 'custom',
      path: ['targetId'],
      message: 'Informe o grupo alvo da sugestão',
    })
  }

  if (needsPayload && filledFieldCount === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['payload'],
      message:
        data.type === 'UPDATE'
          ? 'Altere ao menos um campo para sugerir uma correção'
          : 'Preencha os dados do grupo',
    })
  }

  if (data.type === 'CREATE') {
    for (const field of REQUIRED_CREATE_FIELDS) {
      if (data.payload?.[field] === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['payload', field],
          message:
            field === 'name'
              ? 'Nome do grupo é obrigatório'
              : 'Ponto de saída no mapa é obrigatório',
        })
      }
    }
  }

  if (data.type === 'DELETE' && filledFieldCount > 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['payload'],
      message: 'Pedido de remoção não deve propor dados novos',
    })
  }
})

export type ValidatedSuggestion = z.infer<typeof suggestionSchema>
