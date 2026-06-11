export type ContributionContext = 'new-group' | 'correction' | 'removal'

/**
 * Rotas internas dos fluxos de contribuição. Correção/remoção sem slug caem
 * na página de escolha de grupo (/contribuir/correcao).
 */
export function getContributionRoute(context: ContributionContext, slug?: string): string {
  if (context === 'correction') {
    return slug ? `/contribuir/correcao/${slug}` : '/contribuir/correcao'
  }
  if (context === 'removal') {
    return slug ? `/contribuir/remocao/${slug}` : '/contribuir/correcao'
  }
  return '/contribuir'
}

export function getContributionLabel(context: ContributionContext): string {
  if (context === 'correction') {
    return 'Sugerir correção'
  }
  if (context === 'removal') {
    return 'Solicitar remoção'
  }
  return 'Sugerir grupo'
}
