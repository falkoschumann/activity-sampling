// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import headers from "eslint-plugin-headers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: { headers },
    rules: {
      "headers/header-format": [
        "error",
        {
          source: "string",
          style: "line",
          trailingNewlines: 2,
          content: `Copyright (c) ${new Date().getUTCFullYear()} Falko Schumann. All rights reserved. MIT license.`,
        },
      ],
    },
  },
];

export default eslintConfig;
