export type ContributionContext = 'new-group' | 'correction' | 'removal'

/**
 * Rotas internas dos fluxos de contribuição. Correção/remoção sem slug caem
 * na página de escolha de grupo (/contribute/correction).
 */
export function getContributionRoute(context: ContributionContext, slug?: string): string {
  if (context === 'correction') {
    return slug ? `/contribute/correction/${slug}` : '/contribute/correction'
  }
  if (context === 'removal') {
    return slug ? `/contribute/removal/${slug}` : '/contribute/correction'
  }
  return '/contribute'
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
