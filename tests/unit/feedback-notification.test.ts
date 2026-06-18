import { describe, expect, it, vi } from 'vitest'
import {
  buildFeedbackMessage,
  sendFeedbackNotice,
} from '../../lib/feedback-notification'

describe('buildFeedbackMessage', () => {
  it('inclui a mensagem e o id', () => {
    const msg = buildFeedbackMessage({ id: 'fb-1', message: 'ótima ideia' })
    expect(msg.content).toContain('Novo feedback')
    expect(msg.content).toContain('**Mensagem:** ótima ideia')
    expect(msg.content).toContain('**ID:** `fb-1`')
  })

  it('inclui o contato quando há e-mail', () => {
    const msg = buildFeedbackMessage({
      id: 'fb-1',
      message: 'oi',
      contactEmail: 'foo@bar.com',
    })
    expect(msg.content).toContain('**Contato:** foo@bar.com')
  })

  it('omite o contato quando não há e-mail', () => {
    const msg = buildFeedbackMessage({ id: 'fb-1', message: 'oi' })
    expect(msg.content).not.toContain('Contato')
  })

  it('neutraliza menções do Discord', () => {
    const msg = buildFeedbackMessage({ id: 'fb-1', message: '@everyone oi' })
    expect(msg.allowed_mentions).toEqual({ parse: [] })
  })

  it('trunca mensagens muito longas dentro do limite do Discord', () => {
    const msg = buildFeedbackMessage({ id: 'fb-1', message: 'a'.repeat(5000) })
    expect(msg.content.length).toBeLessThanOrEqual(2000)
  })
})

describe('sendFeedbackNotice', () => {
  const notice = { id: 'fb-1', message: 'oi pessoal do pedala' }

  it('é no-op sem webhookUrl', async () => {
    const send = vi.fn()
    await sendFeedbackNotice(undefined, notice, send)
    expect(send).not.toHaveBeenCalled()
  })

  it('envia a mensagem montada quando há webhookUrl', async () => {
    const send = vi.fn(async () => undefined)
    await sendFeedbackNotice('https://discord.test/hook', notice, send)

    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith(
      'https://discord.test/hook',
      expect.objectContaining({ content: expect.stringContaining('fb-1') }),
    )
  })

  it('engole erro do transporte (best-effort)', async () => {
    const send = vi.fn(() => Promise.reject(new Error('discord caiu')))
    await expect(
      sendFeedbackNotice('https://discord.test/hook', notice, send),
    ).resolves.toBeUndefined()
  })
})
