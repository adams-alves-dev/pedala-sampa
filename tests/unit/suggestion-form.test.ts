import { describe, expect, it } from 'vitest'
import {
  diffPayload,
  emptyFields,
  fieldsFromRecord,
  parseDurationToMinutes,
  payloadFromFields,
} from '../../lib/suggestion-form'
import type { GroupRecord } from '../../types/suggestion'

const record: GroupRecord = {
  id: 'grp-1',
  slug: 'pedal-da-se',
  name: 'Pedal da Sé',
  linkUrl: 'https://instagram.com/pedaldase',
  address: 'Praça da Sé, 1',
  day: 'Sábado',
  startHour: '07:00',
  effort: 'Iniciante',
  distanceKm: 25,
  rhythmKmH: 18,
  latitude: -23.55,
  longitude: -46.63,
}

describe('payloadFromFields', () => {
  it('descarta campos vazios e converte números (aceitando vírgula)', () => {
    const fields = {
      ...emptyFields(),
      name: ' Pedal Novo ',
      distanceKm: '32,5',
    }
    expect(payloadFromFields(fields)).toEqual({
      name: 'Pedal Novo',
      distanceKm: 32.5,
    })
  })

  it('aceita number nos campos numéricos (v-model de input type=number entrega number)', () => {
    const fields = {
      ...emptyFields(),
      name: 'Pedal Novo',
      distanceKm: 25,
      rhythmKmH: 18,
      latitude: -23.5505,
      longitude: -46.6333,
    }
    expect(payloadFromFields(fields)).toEqual({
      name: 'Pedal Novo',
      distanceKm: 25,
      rhythmKmH: 18,
      latitude: -23.5505,
      longitude: -46.6333,
    })
  })

  it('diff não acusa mudança quando o number do input é igual ao publicado', () => {
    const fields = { ...fieldsFromRecord(record), distanceKm: 25 }
    expect(diffPayload(fields, record)).toEqual({})
  })

  it('deriva o ritmo da duração quando o ritmo não é informado', () => {
    const fields = {
      ...emptyFields(),
      name: 'Pedal Novo',
      distanceKm: 50,
      durationHhmm: '02:30',
    }
    expect(payloadFromFields(fields)).toEqual({
      name: 'Pedal Novo',
      distanceKm: 50,
      rhythmKmH: 20,
    })
  })

  it('o ritmo informado tem precedência e a duração não é persistida', () => {
    const fields = {
      ...emptyFields(),
      name: 'Pedal Novo',
      distanceKm: 50,
      rhythmKmH: 18,
      durationHhmm: '02:30',
    }
    expect(payloadFromFields(fields)).toEqual({
      name: 'Pedal Novo',
      distanceKm: 50,
      rhythmKmH: 18,
    })
  })

  it('ignora a duração quando não há distância', () => {
    const fields = {
      ...emptyFields(),
      name: 'Pedal Novo',
      durationHhmm: '02:30',
    }
    expect(payloadFromFields(fields)).toEqual({ name: 'Pedal Novo' })
  })
})

describe('parseDurationToMinutes', () => {
  it('converte "HH:MM" em minutos', () => {
    expect(parseDurationToMinutes('02:30')).toBe(150)
    expect(parseDurationToMinutes('00:45')).toBe(45)
  })

  it('retorna null para vazio, zero ou formato inválido', () => {
    expect(parseDurationToMinutes('')).toBeNull()
    expect(parseDurationToMinutes('00:00')).toBeNull()
    expect(parseDurationToMinutes('9:99')).toBeNull()
    expect(parseDurationToMinutes('abc')).toBeNull()
  })
})

describe('diffPayload', () => {
  it('retorna vazio quando nada mudou', () => {
    expect(diffPayload(fieldsFromRecord(record), record)).toEqual({})
  })

  it('contém apenas os campos alterados', () => {
    const fields = fieldsFromRecord(record)
    fields.address = 'Praça da Sé, 100'
    fields.startHour = '06:30'

    expect(diffPayload(fields, record)).toEqual({
      address: 'Praça da Sé, 100',
      startHour: '06:30',
    })
  })

  it('trata campo esvaziado como "sem alteração"', () => {
    const fields = fieldsFromRecord(record)
    fields.linkUrl = ''

    expect(diffPayload(fields, record)).toEqual({})
  })

  it('detecta mudança numérica sem falso positivo de formatação', () => {
    const fields = fieldsFromRecord(record)
    fields.distanceKm = '25,0'
    fields.rhythmKmH = '20'

    expect(diffPayload(fields, record)).toEqual({ rhythmKmH: 20 })
  })
})
