// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  vite: {
    server: {
      allowedHosts: true,
    },
  },

  app: {
    head: {
      title: "Smart Farm System",
    },
  },

  runtimeConfig: {
    public: {
      apiBase: "",
    },
  },

  modules: ["@nuxtjs/tailwindcss"],

  css: [
    "@mdi/font/css/materialdesignicons.min.css",
    "@/assets/css/fonts.css",
    "@/assets/css/global.css",
  ],
});
