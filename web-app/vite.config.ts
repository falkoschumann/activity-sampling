// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes("node_modules")) {
            return "vendor";
          }

          return null;
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          "import",
          "mixed-decls",
          "color-functions",
          "global-builtin",
        ],
      },
    },
  },
  plugins: [react()],
  server: {
    port: process.env.DEV_PORT ? Number(process.env.DEV_PORT) : 3000,
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.PORT ?? 8080}`,
      },
      "/oauth2": {
        target: `http://localhost:${process.env.PORT ?? 8080}`,
      },
      "/login": {
        target: `http://localhost:${process.env.PORT ?? 8080}`,
      },
      "/logout": {
        target: `http://localhost:${process.env.PORT ?? 8080}`,
      },
      // Used by /login and /logout
      "/default-ui.css": {
        target: `http://localhost:${process.env.PORT ?? 8080}`,
      },
    },
  },
  test: {
    environment: "jsdom",
  },
});
