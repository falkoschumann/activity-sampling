// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    build: {
      rollupOptions: {
        input: {
          log: "src/renderer/log.html",
          report: "src/renderer/report.html",
          statistics: "src/renderer/statistics.html",
          estimate: "src/renderer/estimate.html",
          burnUpChart: "src/renderer/burn-up-chart.html",
          timesheet: "src/renderer/timesheet.html",
          settings: "src/renderer/settings.html",
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // WORKAROUND: Silence deprecation warnings in Bootstrap 5.3
          // See https://github.com/twbs/bootstrap/pull/41512
          silenceDeprecations: [
            "import",
            "color-functions",
            "global-builtin",
            "if-function",
          ],
        },
      },
    },
    plugins: [react()],
  },
});
