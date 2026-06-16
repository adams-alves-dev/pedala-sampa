import { describe, expect, it } from 'vitest'
import { buildDiscordMessage } from '../../lib/suggestion-notification'
import type { NewSuggestionNotice } from '../../lib/suggestion-notification'

const base: NewSuggestionNotice = {
  id: 'abc123',
  type: 'CREATE',
  justification: 'grupo novo do meu bairro',
}

describe('buildDiscordMessage', () => {
  it('CREATE: inclui nome do grupo, justificativa, contato e id', () => {
    const msg = buildDiscordMessage({
      ...base,
      payload: { name: 'Pedal da Sé' },
      contactEmail: 'foo@bar.com',
    })
    expect(msg.content).toContain('novo grupo')
    expect(msg.content).toContain('**Grupo:** Pedal da Sé')
    expect(msg.content).toContain('grupo novo do meu bairro')
    expect(msg.content).toContain('**Contato:** foo@bar.com')
    expect(msg.content).toContain('id: abc123')
  })

  it('UPDATE: mostra o alvo e os campos alterados', () => {
    const msg = buildDiscordMessage({
      ...base,
      type: 'UPDATE',
      targetId: 'grp1',
      payload: { distanceKm: 50, startHour: '08:00' },
    })
    expect(msg.content).toContain('correção')
    expect(msg.content).toContain('`grp1`')
    expect(msg.content).toContain('**Campos:** distanceKm, startHour')
  })

  it('DELETE: mostra o alvo, sem listar campos', () => {
    const msg = buildDiscordMessage({
      ...base,
      type: 'DELETE',
      targetId: 'grp1',
    })
    expect(msg.content).toContain('remoção')
    expect(msg.content).toContain('`grp1`')
    expect(msg.content).not.toContain('Campos:')
  })

  it('omite o contato quando ausente', () => {
    const msg = buildDiscordMessage({ ...base, payload: { name: 'X' } })
    expect(msg.content).not.toContain('Contato:')
  })

  it('sempre neutraliza menções (anti @everyone injetado na justificativa)', () => {
    const msg = buildDiscordMessage({
      ...base,
      justification: 'me marca @everyone agora',
    })
    expect(msg.allowed_mentions).toEqual({ parse: [] })
  })

  it('trunca o conteúdo acima do limite do Discord (2000)', () => {
    const msg = buildDiscordMessage({
      ...base,
      justification: 'x'.repeat(2500),
    })
    expect(msg.content.length).toBeLessThanOrEqual(2000)
    expect(msg.content.endsWith('…')).toBe(true)
  })
})
