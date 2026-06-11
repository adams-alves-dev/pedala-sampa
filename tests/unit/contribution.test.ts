import { describe, expect, it } from 'vitest'
import { getContributionLabel, getContributionRoute } from '../../lib/contribution'

describe('contribution routes', () => {
  it('aponta sugestão de grupo novo para /contribuir', () => {
    expect(getContributionRoute('new-group')).toBe('/contribuir')
  })

  it('aponta correção com slug para o form do grupo', () => {
    expect(getContributionRoute('correction', 'pedal-noturno')).toBe(
      '/contribuir/correcao/pedal-noturno',
    )
  })

  it('aponta correção sem slug para a escolha de grupo', () => {
    expect(getContributionRoute('correction')).toBe('/contribuir/correcao')
  })

  it('aponta remoção com slug para o form de remoção', () => {
    expect(getContributionRoute('removal', 'pedal-noturno')).toBe(
      '/contribuir/remocao/pedal-noturno',
    )
  })

  it('tem rótulo para cada contexto', () => {
    expect(getContributionLabel('new-group')).toBe('Sugerir grupo')
    expect(getContributionLabel('correction')).toBe('Sugerir correção')
    expect(getContributionLabel('removal')).toBe('Solicitar remoção')
  })
})
