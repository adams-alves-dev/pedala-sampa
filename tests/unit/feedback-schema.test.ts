import { describe, expect, it } from 'vitest'
import { feedbackSchema } from '../../lib/feedback-schema'

describe('feedbackSchema', () => {
  it('aceita mensagem válida', () => {
    const result = feedbackSchema.safeParse({
      message: 'O site está ótimo, senti falta de um filtro por bairro.',
    })
    expect(result.success).toBe(true)
  })

  it('aceita e-mail opcional (vazio ou válido)', () => {
    expect(
      feedbackSchema.safeParse({
        message: 'mensagem suficientemente longa',
        contactEmail: '',
      }).success,
    ).toBe(true)
    expect(
      feedbackSchema.safeParse({
        message: 'mensagem suficientemente longa',
        contactEmail: 'foo@bar.com',
      }).success,
    ).toBe(true)
  })

  it('rejeita mensagem curta demais (mínimo de 10)', () => {
    expect(feedbackSchema.safeParse({ message: 'oi' }).success).toBe(false)
  })

  it('rejeita mensagem acima do limite (2000)', () => {
    expect(
      feedbackSchema.safeParse({ message: 'a'.repeat(2001) }).success,
    ).toBe(false)
  })

  it('rejeita e-mail inválido', () => {
    const result = feedbackSchema.safeParse({
      message: 'mensagem suficientemente longa',
      contactEmail: 'nao-e-email',
    })
    expect(result.success).toBe(false)
  })

  it('sanitiza HTML da mensagem', () => {
    const result = feedbackSchema.safeParse({
      message: '<b>ótima</b> ideia   de   filtro por bairro',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.message).toBe('ótima ideia de filtro por bairro')
    }
  })
})
