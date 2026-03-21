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
      reporter: ["text", "html", "cobertura", "json"],
      thresholds: {
        statements: 70, // TODO increase statements coverage
        branches: 85,
      },
    },
    outputFile: "coverage/junit.xml",
    reporters: ["junit", "tree"],
  },
});
