// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: [
        "src/**/application/**/*",
        "src/**/common/**/*",
        "src/**/domain/**/*",
        "src/**/infrastructure/**/*",
        // exclude layers UI and root
      ],
      provider: "v8",
      thresholds: {
        statements: 80,
        branches: 62, // TODO increase branch coverage
        lines: 62, // TODO increase lines coverage
      },
    },
    globalSetup: "./test/global-setup.ts",
  },
});
