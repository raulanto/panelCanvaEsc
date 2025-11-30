// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  ssr: false,

  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },

  nitro: {
    preset: "static",
  },

  telemetry: false,
  css: ["~/assets/css/main.css"],
  modules: ["@vueuse/nuxt", "@nuxt/ui", "nuxt-charts"],
});
