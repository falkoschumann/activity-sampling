// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {
    server: {
      watch: {
        ignored: ["data", "testdata"],
      },
    },
  },
  preload: {},
  renderer: {
    build: {
      rolldownOptions: {
        input: {
          burn_up_chart: "src/renderer/burn-up-chart.html",
          estimate: "src/renderer/estimate.html",
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
