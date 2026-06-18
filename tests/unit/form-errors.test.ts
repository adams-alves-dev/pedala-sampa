import { describe, expect, it } from 'vitest'
import { extractIssues } from '../../lib/form-errors'

describe('extractIssues', () => {
  it('mantém as issues bem-formadas', () => {
    const issues = extractIssues([
      { path: 'message', message: 'muito curta' },
      { path: 'contactEmail', message: 'inválido' },
    ])

    expect(issues).toEqual([
      { path: 'message', message: 'muito curta' },
      { path: 'contactEmail', message: 'inválido' },
    ])
  })

  it('descarta entradas malformadas', () => {
    const issues = extractIssues([
      { path: 'message', message: 'ok' },
      { path: 'sem-message' },
      { message: 'sem-path' },
      { path: 1, message: 'path não-string' },
      'string solta',
      null,
    ])

    expect(issues).toEqual([{ path: 'message', message: 'ok' }])
  })

  it('retorna [] quando data não é um array', () => {
    expect(extractIssues(undefined)).toEqual([])
    expect(extractIssues(null)).toEqual([])
    expect(extractIssues('nope')).toEqual([])
    expect(extractIssues({ path: 'x', message: 'y' })).toEqual([])
  })
})
