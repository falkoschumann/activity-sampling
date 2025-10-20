// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          log: "src/renderer/log.html",
          report: "src/renderer/report.html",
          settings: "src/renderer/settings.html",
          statistics: "src/renderer/statistics.html",
          timesheet: "src/renderer/timesheet.html",
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // WORKAROUND: Silence deprecation warnings in Bootstrap 5.3
          // See https://github.com/twbs/bootstrap/pull/41512
          silenceDeprecations: ["import", "color-functions", "global-builtin"],
        },
      },
    },
    plugins: [react()],
  },
});
