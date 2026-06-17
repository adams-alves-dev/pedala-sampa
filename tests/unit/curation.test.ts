import { describe, expect, it } from 'vitest'
import {
  addScheduleUpdateFromPayload,
  buildLinkAst,
  groupCreateInputFromPayload,
  groupInfoCreateInputFromPayload,
  isScheduleComplete,
  normalizeStartHour,
  slugify,
  splitUpdatePayload,
} from '../../lib/curation'
import type { SuggestionGroupPayload } from '../../types/suggestion'

const fullSchedule: SuggestionGroupPayload = {
  day: 'Sábado',
  startHour: '07:00',
  effort: 'Moderado',
  distanceKm: 40,
  rhythmKmH: 25,
}

const fullCreate: SuggestionGroupPayload = {
  name: 'Pedal da Sé',
  latitude: -23.55,
  longitude: -46.63,
  linkUrl: 'https://instagram.com/pedaldase',
  address: 'Praça da Sé',
  ...fullSchedule,
}

const current = {
  name: 'Atual',
  departureLocation: { latitude: -23.5, longitude: -46.6 },
}

describe('slugify', () => {
  it('remove acentos e normaliza separadores', () => {
    expect(slugify('Pedal da Sé')).toBe('pedal-da-se')
    expect(slugify('Ação & Cia!!')).toBe('acao-cia')
    expect(slugify('  Maracanã  ')).toBe('maracana')
    expect(slugify('Pedal—Norte')).toBe('pedal-norte')
  })
})

describe('normalizeStartHour', () => {
  it('garante o sufixo "h" sem duplicar', () => {
    expect(normalizeStartHour('20:30')).toBe('20:30h')
    expect(normalizeStartHour('20:30h')).toBe('20:30h')
    expect(normalizeStartHour(' 07:00 ')).toBe('07:00h')
  })
})

describe('buildLinkAst', () => {
  it('monta um parágrafo com um link rotulado', () => {
    const ast = buildLinkAst('https://x.com', 'Grupo X')
    expect(ast.children[0].type).toBe('paragraph')
    const link = ast.children[0].children?.[0]
    expect(link?.type).toBe('link')
    expect(link?.href).toBe('https://x.com')
    expect(link?.openInNewTab).toBe(true)
    expect(link?.children?.[0].text).toBe('Grupo X')
  })
})

describe('isScheduleComplete', () => {
  it('exige todos os campos obrigatórios do GroupInfo', () => {
    expect(isScheduleComplete(fullSchedule)).toBe(true)
    expect(isScheduleComplete({ ...fullSchedule, day: undefined })).toBe(false)
    expect(isScheduleComplete({ ...fullSchedule, rhythmKmH: undefined })).toBe(
      false,
    )
    expect(
      isScheduleComplete({ name: 'X', latitude: -23.5, longitude: -46.6 }),
    ).toBe(false)
  })
})

describe('groupInfoCreateInputFromPayload', () => {
  it('retorna null quando a agenda está incompleta', () => {
    expect(groupInfoCreateInputFromPayload({ day: 'Sábado' })).toBeNull()
  })

  it('converte nomes/tipos e arredonda o ritmo (Int)', () => {
    const gi = groupInfoCreateInputFromPayload({
      ...fullSchedule,
      rhythmKmH: 18.7,
      address: 'Rua A',
    })
    expect(gi).not.toBeNull()
    expect(gi?.distance).toBe(40)
    expect(gi?.rhythm).toBe(19)
    expect(gi?.startHour).toBe('07:00h')
    expect(gi?.address).toBe('Rua A')
  })

  it('omite address quando ausente', () => {
    const gi = groupInfoCreateInputFromPayload(fullSchedule)
    expect(gi).not.toBeNull()
    expect(gi && 'address' in gi).toBe(false)
  })
})

describe('groupCreateInputFromPayload', () => {
  it('retorna null sem name/lat/lng', () => {
    expect(
      groupCreateInputFromPayload({ latitude: -23.5, longitude: -46.6 }, 's'),
    ).toBeNull()
  })

  it('monta Group + GroupInfo aninhado + link', () => {
    const gc = groupCreateInputFromPayload(fullCreate, 'pedal-da-se')
    expect(gc).not.toBeNull()
    expect(gc?.name).toBe('Pedal da Sé')
    expect(gc?.slug).toBe('pedal-da-se')
    expect(gc?.departureLocation).toEqual({
      latitude: -23.55,
      longitude: -46.63,
    })
    expect(gc?.link).toBeDefined()
    expect(gc?.groupInfos?.create).toHaveLength(1)
    expect(gc?.groupInfos?.create[0].rhythm).toBe(25)
  })

  it('sem link nem agenda quando o payload é mínimo', () => {
    const gc = groupCreateInputFromPayload(
      { name: 'X', latitude: -23.5, longitude: -46.6 },
      'x',
    )
    expect(gc?.link).toBeUndefined()
    expect(gc?.groupInfos).toBeUndefined()
  })
})

describe('splitUpdatePayload', () => {
  it('roteia campos de Group e de GroupInfo separadamente', () => {
    expect(splitUpdatePayload({ name: 'Novo' }, current)).toEqual({
      group: { name: 'Novo' },
    })
    expect(splitUpdatePayload({ distanceKm: 50 }, current)).toEqual({
      groupInfo: { distance: 50 },
    })
  })

  it('arredonda o ritmo e normaliza o horário no GroupInfo', () => {
    expect(
      splitUpdatePayload({ rhythmKmH: 18.7 }, current).groupInfo?.rhythm,
    ).toBe(19)
    expect(
      splitUpdatePayload({ startHour: '08:15' }, current).groupInfo?.startHour,
    ).toBe('08:15h')
  })

  it('completa uma localização parcial com o valor atual', () => {
    const loc = splitUpdatePayload({ latitude: -23.4 }, current).group
      ?.departureLocation
    expect(loc).toEqual({ latitude: -23.4, longitude: -46.6 })
  })

  it('usa o nome atual como rótulo do link quando o diff não muda o nome', () => {
    const link = splitUpdatePayload({ linkUrl: 'https://y.com' }, current).group
      ?.link
    const label = link?.children[0].children?.[0].children?.[0].text
    expect(label).toBe('Atual')
  })

  it('retorna vazio quando não há nada a aplicar', () => {
    expect(splitUpdatePayload({}, current)).toEqual({})
  })
})

describe('addScheduleUpdateFromPayload', () => {
  it('anexa a agenda via create aninhado de groupInfos', () => {
    const update = addScheduleUpdateFromPayload(fullSchedule)
    expect(update).not.toBeNull()
    expect(update?.groupInfos?.create).toHaveLength(1)
    expect(update?.groupInfos?.create[0].rhythm).toBe(25)
    expect(update?.groupInfos?.create[0].startHour).toBe('07:00h')
    // não toca em campos do grupo (nome/local/link)
    expect(update?.name).toBeUndefined()
    expect(update?.departureLocation).toBeUndefined()
  })

  it('retorna null quando a agenda está incompleta', () => {
    expect(addScheduleUpdateFromPayload({ day: 'Sábado' })).toBeNull()
  })
})
