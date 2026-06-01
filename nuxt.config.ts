export default defineNuxtConfig({
  compatibilityDate: '2026-05-26',
  devtools: { enabled: true },
  modules: ['@nuxtjs/leaflet'],
  css: ['~/assets/css/main.css'],
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
        { name: 'theme-color', content: '#FFB300' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Sora:wght@400;600;800&display=swap',
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  runtimeConfig: {
    hygraphToken: process.env.GRAPHQL_TOKEN || '',
    public: {
      hygraphEndpoint:
        process.env.HYGRAPH_ENDPOINT ||
        'https://api-us-east-1.graphcms.com/v2/cktlzsv381lsy01z0109u52uf/master',
      contributionFormUrl: process.env.NUXT_PUBLIC_CONTRIBUTION_FORM_URL || '',
      mapboxApiKey: process.env.MAPBOX_API_KEY || '',
      mapboxUserId: process.env.MAPBOX_USERID || '',
      mapboxStyleId: process.env.MAPBOX_STYLEID || '',
    },
  },
  nitro: {
    preset: 'static',
  },
  typescript: {
    strict: true,
  },
})
