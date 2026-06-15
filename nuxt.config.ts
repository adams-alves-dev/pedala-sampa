export default defineNuxtConfig({
  compatibilityDate: '2026-05-26',
  devtools: { enabled: true },
  modules: ['@nuxtjs/leaflet', '@nuxtjs/color-mode', '@nuxt/eslint'],
  css: ['~/assets/css/main.css', '~/assets/css/components.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  colorMode: {
    classSuffix: '', // no class suffix
    dataValue: 'theme', // writes data-theme on <html>
    preference: 'light', // tema padrão (a identidade "Ciclovia")
    fallback: 'light',
    storageKey: 'ps-color-mode',
  },
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Pedala Sampa - Grupos de pedal em São Paulo',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Encontre grupos de pedal em São Paulo por região, dia, horário, nível, distância e ritmo.',
        },
        { property: 'og:site_name', content: 'Pedala Sampa' },
        { name: 'theme-color', content: '#11271C' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Hanken+Grotesk:wght@400;600;800;900&display=swap',
        },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
  runtimeConfig: {
    hygraphToken: process.env.GRAPHQL_TOKEN || '',
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || '',
    turnstileEnabled: process.env.TURNSTILE_ENABLED === 'true',
    public: {
      hygraphEndpoint:
        process.env.HYGRAPH_ENDPOINT ||
        'https://api-us-east-1.graphcms.com/v2/cktlzsv381lsy01z0109u52uf/master',
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    },
  },
  // preset netlify: páginas continuam estáticas (prerender com crawl), mas as
  // server routes em server/api/ viram Netlify Functions no deploy
  nitro: {
    preset: 'netlify',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
  typescript: {
    strict: true,
  },
})
