import { describe, expect, it } from 'vitest'
import { sanitizeText, sugestaoSchema } from '../../lib/sugestao-schemas'

const justificativa = 'O grupo mudou o ponto de saída no mês passado.'

const payloadValido = {
  name: 'Pedal Noturno da Sé',
  latitude: -23.55,
  longitude: -46.63,
}

describe('sanitizeText', () => {
  it('remove tags HTML e normaliza espaços', () => {
    expect(sanitizeText('  <b>Pedal</b>\n da   Sé <script>x</script> ')).toBe('Pedal da Sé x')
  })
})

describe('sugestaoSchema', () => {
  it('aceita CREATE com payload completo', () => {
    const result = sugestaoSchema.safeParse({
      tipo: 'CREATE',
      payload: payloadValido,
      justificativa,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita tipo fora do enum', () => {
    const result = sugestaoSchema.safeParse({
      tipo: 'PATCH',
      payload: payloadValido,
      justificativa,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita CREATE sem nome e coordenadas', () => {
    const result = sugestaoSchema.safeParse({
      tipo: 'CREATE',
      payload: { address: 'Praça da Sé' },
      justificativa,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'))
      expect(paths).toContain('payload.name')
      expect(paths).toContain('payload.latitude')
      expect(paths).toContain('payload.longitude')
    }
  })

  it('rejeita UPDATE sem alvoId', () => {
    const result = sugestaoSchema.safeParse({
      tipo: 'UPDATE',
      payload: { name: 'Novo nome' },
      justificativa,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita UPDATE com payload vazio', () => {
    const result = sugestaoSchema.safeParse({
      tipo: 'UPDATE',
      alvoId: 'abc123',
      payload: {},
      justificativa,
    })
    expect(result.success).toBe(false)
  })

  it('aceita DELETE sem payload', () => {
    const result = sugestaoSchema.safeParse({
      tipo: 'DELETE',
      alvoId: 'abc123',
      justificativa,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita DELETE com payload preenchido', () => {
    const result = sugestaoSchema.safeParse({
      tipo: 'DELETE',
      alvoId: 'abc123',
      payload: { name: 'Outro nome' },
      justificativa,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita coordenadas fora da região de São Paulo', () => {
    const result = sugestaoSchema.safeParse({
      tipo: 'CREATE',
      payload: { ...payloadValido, latitude: -22.9, longitude: -43.2 },
      justificativa,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita justificativa curta demais', () => {
    const result = sugestaoSchema.safeParse({
      tipo: 'CREATE',
      payload: payloadValido,
      justificativa: 'ok',
    })
    expect(result.success).toBe(false)
  })

  it('sanitiza HTML em campos de texto', () => {
    const result = sugestaoSchema.safeParse({
      tipo: 'CREATE',
      payload: { ...payloadValido, name: '<b>Pedal</b> da Sé' },
      justificativa: `<p>${justificativa}</p>`,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.payload?.name).toBe('Pedal da Sé')
      expect(result.data.justificativa).toBe(justificativa)
    }
  })

  it('aceita contatoEmail vazio e rejeita e-mail inválido', () => {
    const base = { tipo: 'CREATE', payload: payloadValido, justificativa }
    expect(sugestaoSchema.safeParse({ ...base, contatoEmail: '' }).success).toBe(true)
    expect(sugestaoSchema.safeParse({ ...base, contatoEmail: 'a@b.com' }).success).toBe(true)
    expect(sugestaoSchema.safeParse({ ...base, contatoEmail: 'não-é-email' }).success).toBe(false)
  })
})
