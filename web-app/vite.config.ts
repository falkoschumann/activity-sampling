// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
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
    },
  },
  test: {
    environment: "jsdom",
  },
});
