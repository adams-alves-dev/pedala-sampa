/**
 * Os temas se chamavam 'ciclovia'/'noturno' no data-theme e no localStorage
 * (ps-color-mode) até 2026-06; viraram 'light'/'dark'. Visitantes antigos
 * ainda carregam o valor legado salvo — sem isso o CSS não casa com nenhum
 * tema e a página renderiza sem paleta.
 *
 * A migração roda no app:mounted: antes disso o plugin do @nuxtjs/color-mode
 * ainda não terminou de inicializar e sobrescreveria a preferência de volta.
 */
const LEGACY_THEMES: Record<string, string> = {
  ciclovia: 'light',
  noturno: 'dark',
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const colorMode = useColorMode()
    const migrated = LEGACY_THEMES[colorMode.preference]
    if (migrated) {
      colorMode.preference = migrated
    }
  })
})
