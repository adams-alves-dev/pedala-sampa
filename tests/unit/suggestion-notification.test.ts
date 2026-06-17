import { describe, expect, it, vi } from 'vitest'
import {
  buildDiscordMessage,
  sendSuggestionNotice,
} from '../../lib/suggestion-notification'
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

  it('CREATE com targetId: rotula "nova agenda" e resume a agenda', () => {
    const msg = buildDiscordMessage({
      ...base,
      targetId: 'grp1',
      payload: {
        day: 'Quinta',
        startHour: '19:00',
        effort: 'Avançado',
        distanceKm: 45,
        rhythmKmH: 28,
      },
    })
    expect(msg.content).toContain('nova agenda')
    expect(msg.content).not.toContain('novo grupo')
    expect(msg.content).toContain('`grp1`')
    expect(msg.content).toContain('**Agenda:**')
    expect(msg.content).toContain('Quinta')
    expect(msg.content).toContain('45 km')
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

  it('omite o contato quando é string vazia (não só ausente)', () => {
    const msg = buildDiscordMessage({
      ...base,
      contactEmail: '',
      payload: { name: 'X' },
    })
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

describe('sendSuggestionNotice', () => {
  const notice: NewSuggestionNotice = {
    id: 'x1',
    type: 'CREATE',
    justification: 'oi',
    payload: { name: 'Grupo G' },
  }

  it('no-op quando não há webhook URL (não chama o transporte)', async () => {
    const send = vi.fn()
    await sendSuggestionNotice('', notice, send)
    await sendSuggestionNotice(undefined, notice, send)
    expect(send).not.toHaveBeenCalled()
  })

  it('envia a mensagem montada para a URL configurada', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    await sendSuggestionNotice('http://hook', notice, send)
    expect(send).toHaveBeenCalledWith(
      'http://hook',
      expect.objectContaining({
        content: expect.stringContaining('**Grupo:** Grupo G'),
        allowed_mentions: { parse: [] },
      }),
    )
  })

  it('engole erro do transporte sem relançar (não derruba o cadastro)', async () => {
    const send = vi.fn().mockRejectedValue(new Error('discord fora do ar'))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(
      sendSuggestionNotice('http://hook', notice, send),
    ).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
