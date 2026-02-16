// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

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
      provider: "istanbul",
      thresholds: {
        statements: 70, // TODO increase statements coverage
        branches: 80,
        lines: 70, // TODO increase lines coverage
      },
    },
    globalSetup: "./test/global-setup.ts",
    reporters: ["tree"],
  },
});
