import { describe, expect, it } from 'vitest'
import { sanitizeText, suggestionSchema } from '../../lib/suggestion-schemas'

const justification = 'O grupo mudou o ponto de saída no mês passado.'

const validPayload = {
  name: 'Pedal Noturno da Sé',
  latitude: -23.55,
  longitude: -46.63,
}

describe('sanitizeText', () => {
  it('remove tags HTML e normaliza espaços', () => {
    expect(sanitizeText('  <b>Pedal</b>\n da   Sé <script>x</script> ')).toBe(
      'Pedal da Sé x',
    )
  })
})

describe('suggestionSchema', () => {
  it('aceita CREATE com payload completo', () => {
    const result = suggestionSchema.safeParse({
      type: 'CREATE',
      payload: validPayload,
      justification,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita tipo fora do enum', () => {
    const result = suggestionSchema.safeParse({
      type: 'PATCH',
      payload: validPayload,
      justification,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita CREATE sem nome e coordenadas', () => {
    const result = suggestionSchema.safeParse({
      type: 'CREATE',
      payload: { address: 'Praça da Sé' },
      justification,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'))
      expect(paths).toContain('payload.name')
      expect(paths).toContain('payload.latitude')
      expect(paths).toContain('payload.longitude')
    }
  })

  it('rejeita UPDATE sem targetId', () => {
    const result = suggestionSchema.safeParse({
      type: 'UPDATE',
      payload: { name: 'Novo nome' },
      justification,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita UPDATE com payload vazio', () => {
    const result = suggestionSchema.safeParse({
      type: 'UPDATE',
      targetId: 'abc123',
      payload: {},
      justification,
    })
    expect(result.success).toBe(false)
  })

  it('aceita DELETE sem payload', () => {
    const result = suggestionSchema.safeParse({
      type: 'DELETE',
      targetId: 'abc123',
      justification,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita DELETE com payload preenchido', () => {
    const result = suggestionSchema.safeParse({
      type: 'DELETE',
      targetId: 'abc123',
      payload: { name: 'Outro nome' },
      justification,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita coordenadas fora da região de São Paulo', () => {
    const result = suggestionSchema.safeParse({
      type: 'CREATE',
      payload: { ...validPayload, latitude: -22.9, longitude: -43.2 },
      justification,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita justificativa curta demais', () => {
    const result = suggestionSchema.safeParse({
      type: 'CREATE',
      payload: validPayload,
      justification: 'ok',
    })
    expect(result.success).toBe(false)
  })

  it('sanitiza HTML em campos de texto', () => {
    const result = suggestionSchema.safeParse({
      type: 'CREATE',
      payload: { ...validPayload, name: '<b>Pedal</b> da Sé' },
      justification: `<p>${justification}</p>`,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.payload?.name).toBe('Pedal da Sé')
      expect(result.data.justification).toBe(justification)
    }
  })

  it('aceita linkUrl http(s) e rejeita outros schemes', () => {
    const base = { type: 'CREATE', justification }
    const withLink = (linkUrl: string) =>
      suggestionSchema.safeParse({
        ...base,
        payload: { ...validPayload, linkUrl },
      })
    expect(withLink('https://instagram.com/pedal').success).toBe(true)
    expect(withLink('http://exemplo.com.br/grupo').success).toBe(true)
    expect(withLink('javascript:alert(document.cookie)').success).toBe(false)
    expect(withLink('data:text/html,<script>alert(1)</script>').success).toBe(
      false,
    )
    expect(withLink('ftp://exemplo.com/arquivo').success).toBe(false)
  })

  it('aceita contactEmail vazio e rejeita e-mail inválido', () => {
    const base = { type: 'CREATE', payload: validPayload, justification }
    expect(
      suggestionSchema.safeParse({ ...base, contactEmail: '' }).success,
    ).toBe(true)
    expect(
      suggestionSchema.safeParse({ ...base, contactEmail: 'a@b.com' }).success,
    ).toBe(true)
    expect(
      suggestionSchema.safeParse({ ...base, contactEmail: 'não-é-email' })
        .success,
    ).toBe(false)
  })
})
