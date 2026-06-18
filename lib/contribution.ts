import type { Group } from '../types/group'

export type ContributionContext =
  | 'new-group'
  | 'correction'
  | 'removal'
  | 'schedule'

/**
 * Escolha do grupo no fluxo "adicionar agenda": um grupo que já existe (anexa a
 * agenda, sem duplicar) ou um grupo novo (cria grupo + agenda). `null` = nada
 * escolhido ainda. O combobox emite isso; o form decide a request a partir do
 * `kind`.
 */
export type GroupSelection =
  | { kind: 'existing'; group: Group }
  | { kind: 'new'; name: string }

/**
 * Rotas internas dos fluxos de contribuição. Correção/remoção sem slug caem
 * na página de escolha de grupo (/contribute/correction). Para "adicionar
 * agenda", o slug pré-seleciona o grupo via query (`?group=`).
 */
export function getContributionRoute(
  context: ContributionContext,
  slug?: string,
): string {
  if (context === 'correction') {
    return slug ? `/contribute/correction/${slug}` : '/contribute/correction'
  }
  if (context === 'removal') {
    return slug ? `/contribute/removal/${slug}` : '/contribute/correction'
  }
  if (context === 'schedule') {
    return slug ? `/contribute/schedule?group=${slug}` : '/contribute/schedule'
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
  if (context === 'schedule') {
    return 'Adicionar agenda'
  }
  return 'Sugerir grupo'
}
