import { describe, expect, it } from 'vitest'
import {
  diffPayload,
  emptyFields,
  fieldsFromRecord,
  hasCompleteSchedule,
  parseDurationToMinutes,
  payloadFromFields,
  scheduleLabel,
} from '../../lib/suggestion-form'
import type { GroupRecord, GroupScheduleRecord } from '../../types/suggestion'

const schedule: GroupScheduleRecord = {
  id: 'gi-1',
  day: 'Sábado',
  startHour: '07:00',
  effort: 'Iniciante',
  distanceKm: 25,
  rhythmKmH: 18,
}

const record: GroupRecord = {
  id: 'grp-1',
  slug: 'pedal-da-se',
  name: 'Pedal da Sé',
  linkUrl: 'https://instagram.com/pedaldase',
  address: 'Praça da Sé, 1',
  latitude: -23.55,
  longitude: -46.63,
  schedules: [schedule],
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
    const fields = { ...fieldsFromRecord(record, schedule), distanceKm: 25 }
    expect(diffPayload(fields, record, schedule)).toEqual({})
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

  it('deriva o ritmo com distância em vírgula decimal', () => {
    const fields = {
      ...emptyFields(),
      name: 'Pedal Novo',
      distanceKm: '50,0',
      durationHhmm: '02:30',
    }
    expect(payloadFromFields(fields)).toEqual({
      name: 'Pedal Novo',
      distanceKm: 50,
      rhythmKmH: 20,
    })
  })

  it('deriva ritmo acima de 60 sem clampar (o schema é o backstop)', () => {
    const fields = {
      ...emptyFields(),
      name: 'Pedal Novo',
      distanceKm: 60,
      durationHhmm: '00:30', // 60 km em 30 min = 120 km/h
    }
    // não clampamos no form: o payloadSchema (rhythmKmH max 60) rejeita no envio
    expect(payloadFromFields(fields).rhythmKmH).toBe(120)
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
    expect(
      diffPayload(fieldsFromRecord(record, schedule), record, schedule),
    ).toEqual({})
  })

  it('separa campos do grupo (vs record) e da agenda (vs schedule)', () => {
    const fields = fieldsFromRecord(record, schedule)
    fields.address = 'Praça da Sé, 100' // campo do grupo
    fields.startHour = '06:30' // campo da agenda

    expect(diffPayload(fields, record, schedule)).toEqual({
      address: 'Praça da Sé, 100',
      startHour: '06:30',
    })
  })

  it('trata campo esvaziado como "sem alteração"', () => {
    const fields = fieldsFromRecord(record, schedule)
    fields.linkUrl = ''

    expect(diffPayload(fields, record, schedule)).toEqual({})
  })

  it('detecta mudança numérica sem falso positivo de formatação', () => {
    const fields = fieldsFromRecord(record, schedule)
    fields.distanceKm = '25,0'
    fields.rhythmKmH = '20'

    expect(diffPayload(fields, record, schedule)).toEqual({ rhythmKmH: 20 })
  })

  it('diff da agenda compara com a agenda escolhida (não a 1ª)', () => {
    const other: GroupScheduleRecord = {
      id: 'gi-2',
      day: 'Quinta',
      startHour: '19:00',
      effort: 'Avançado',
      distanceKm: 45,
      rhythmKmH: 28,
    }
    // pré-preenchido com a 2ª agenda; mudo só o nível
    const fields = fieldsFromRecord(record, other)
    fields.effort = 'Intermediário'
    expect(diffPayload(fields, record, other)).toEqual({
      effort: 'Intermediário',
    })
  })

  it('deriva o ritmo da duração no diff quando a agenda não tinha ritmo', () => {
    const scheduleNoRhythm: GroupScheduleRecord = {
      ...schedule,
      rhythmKmH: undefined,
    }
    const fields = {
      ...fieldsFromRecord(record, scheduleNoRhythm),
      durationHhmm: '01:00', // distância publicada (25 km) ÷ 1h = 25 km/h
    }
    // o ritmo que faltava entra no diff por não existir na agenda publicada
    expect(diffPayload(fields, record, scheduleNoRhythm)).toEqual({
      rhythmKmH: 25,
    })
  })
})

describe('hasCompleteSchedule', () => {
  const fullSchedule = {
    ...emptyFields(),
    day: 'Quinta',
    startHour: '19:00',
    effort: 'Avançado',
    distanceKm: 45,
    rhythmKmH: 28,
  }

  it('true quando os cinco campos da agenda vêm no payload', () => {
    expect(hasCompleteSchedule(payloadFromFields(fullSchedule))).toBe(true)
  })

  it('aceita ritmo derivado da duração (sem ritmo digitado)', () => {
    const viaDuration = {
      ...emptyFields(),
      day: 'Quinta',
      startHour: '19:00',
      effort: 'Avançado',
      distanceKm: 45,
      durationHhmm: '01:30',
    }
    expect(hasCompleteSchedule(payloadFromFields(viaDuration))).toBe(true)
  })

  it('false quando falta um campo da agenda', () => {
    expect(
      hasCompleteSchedule(payloadFromFields({ ...fullSchedule, effort: '' })),
    ).toBe(false)
  })
})

describe('scheduleLabel', () => {
  it('junta dia · horário · nível', () => {
    expect(
      scheduleLabel(
        { id: 'x', day: 'Quinta', startHour: '19:00', effort: 'Avançado' },
        0,
      ),
    ).toBe('Quinta · 19:00 · Avançado')
  })

  it('cai para "Agenda N" quando a agenda está vazia', () => {
    expect(scheduleLabel({ id: 'x' }, 2)).toBe('Agenda 3')
  })
})
