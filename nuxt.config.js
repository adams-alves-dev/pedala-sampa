export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'pedala-sampa',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;400;600&display=swap',
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    '@nuxtjs/dotenv',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    'nuxt-leaflet',
    '@nuxtjs/apollo',
    '@nuxtjs/markdownit',
    '@nuxtjs/style-resources',
  ],

  publicRuntimeConfig: {
    MAPBOX_API_KEY: process.env.MAPBOX_API_KEY,
    MAPBOX_USERID: process.env.MAPBOX_USERID,
    MAPBOX_STYLEID: process.env.MAPBOX_STYLEID,
  },

  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint:
          'https://api-us-east-1.graphcms.com/v2/cktlzsv381lsy01z0109u52uf/master',
        getAuth: () => `Bearer ${process.env.GRAPHQL_TOKEN}` || '',
      },
    },
  },

  markdownit: {
    runtime: true, // Support `$md()`
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  // Style Resources
  styleResources: {
    scss: ['./assets/scss/*.scss'],
  },
}
