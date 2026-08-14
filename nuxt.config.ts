// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/image', '@nuxtjs/tailwindcss'],

  components: [{ path: '~/components', pathPrefix: false }],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Terra — Arquitectura que se construye ante ti',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Terra es un estudio inmobiliario que diseña y construye proyectos residenciales de autor. Recorre el proceso completo, de terreno vacío a propiedad terminada.'
        },
        { property: 'og:title', content: 'Terra — Arquitectura que se construye ante ti' },
        {
          property: 'og:description',
          content: 'De un terreno vacío a una propiedad terminada. Descubre el proceso.'
        },
        { property: 'og:type', content: 'website' },
        { name: 'theme-color', content: '#F4F1EB' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=Inter:wght@300;400;500;600&display=swap'
        }
      ]
    }
  },

  image: {
    quality: 82,
    format: ['webp', 'avif']
  },

  typescript: {
    strict: true
  }
})
