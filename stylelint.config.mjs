// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"],
  rules: {
    // Importing SASS partials needs string notation
    "import-notation": "string",
  },
};
