// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*"],
    },
    globalSetup: "./test/global-setup.ts",
  },
});
