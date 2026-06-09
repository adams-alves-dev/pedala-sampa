import { describe, expect, it } from 'vitest'
import { getContributionLinkState } from '../../lib/contribution'

describe('contribution helper', () => {
  it('habilita link quando URL existe', () => {
    expect(getContributionLinkState('https://example.com/form')).toEqual({
      href: 'https://example.com/form',
      isEnabled: true,
    })
  })

  it('desabilita link quando URL está ausente', () => {
    expect(getContributionLinkState('')).toEqual({
      href: undefined,
      isEnabled: false,
    })
  })
})
