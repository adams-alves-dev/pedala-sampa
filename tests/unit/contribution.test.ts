import { describe, expect, it } from 'vitest'
import {
  getContributionLabel,
  getContributionRoute,
} from '../../lib/contribution'

describe('contribution routes', () => {
  it('aponta sugestão de grupo novo para /contribute', () => {
    expect(getContributionRoute('new-group')).toBe('/contribute')
  })

  it('aponta correção com slug para o form do grupo', () => {
    expect(getContributionRoute('correction', 'pedal-noturno')).toBe(
      '/contribute/correction/pedal-noturno',
    )
  })

  it('aponta correção sem slug para a escolha de grupo', () => {
    expect(getContributionRoute('correction')).toBe('/contribute/correction')
  })

  it('aponta remoção com slug para o form de remoção', () => {
    expect(getContributionRoute('removal', 'pedal-noturno')).toBe(
      '/contribute/removal/pedal-noturno',
    )
  })

  it('aponta adicionar agenda sem slug para a página de agenda', () => {
    expect(getContributionRoute('schedule')).toBe('/contribute/schedule')
  })

  it('pré-seleciona o grupo via query ao adicionar agenda com slug', () => {
    expect(getContributionRoute('schedule', 'pedal-noturno')).toBe(
      '/contribute/schedule?group=pedal-noturno',
    )
  })

  it('tem rótulo para cada contexto', () => {
    expect(getContributionLabel('new-group')).toBe('Sugerir grupo')
    expect(getContributionLabel('correction')).toBe('Sugerir correção')
    expect(getContributionLabel('removal')).toBe('Solicitar remoção')
    expect(getContributionLabel('schedule')).toBe('Adicionar agenda')
  })
})
