// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { sameTag, type SheriffConfig } from "@softarc/sheriff-core";

export const config: SheriffConfig = {
  autoTagging: false,
  enableBarrelLess: true,
  barrelFileName: "mod.ts",
  entryPoints: {
    main: "src/main/index.ts",
    preload: "src/preload/index.ts",
    log: "src/renderer/log.tsx",
    reports: "src/renderer/report.tsx",
    timesheet: "src/renderer/timesheet.tsx",
  },
  modules: {
    "src/<component>": ["component:<component>", "layer:entry"],
    "src/<component>/application": [
      "component:<component>",
      "layer:application",
    ],
    "src/<component>/common": ["component:<component>", "layer:common"],
    "src/<component>/domain": ["component:<component>", "layer:domain"],
    "src/<component>/infrastructure": [
      "component:<component>",
      "layer:infrastructure",
    ],
    "src/<component>/ui": ["component:<component>", "layer:ui", "ui:entry"],
    "src/<component>/ui/components": [
      "component:<component>",
      "layer:ui",
      "ui:components",
    ],
    "src/<component>/ui/layouts": [
      "component:<component>",
      "layer:ui",
      "ui:layouts",
    ],
    "src/<component>/ui/pages": [
      "component:<component>",
      "layer:ui",
      "ui:pages",
    ],
  },
  depRules: {
    "component:*": [sameTag, "component:shared"],
    "layer:entry": ["layer:*"],
    "layer:ui": ["layer:application", "layer:domain"],
    "layer:application": ["layer:domain", "layer:infrastructure"],
    "layer:infrastructure": ["layer:domain"],
    "layer:*": [sameTag, "layer:common"],
    "ui:entry": ["ui:*", "layer:application"],
    "ui:pages": ["ui:layouts", "layer:application"],
    "ui:*": [sameTag, "ui:components", "component:shared", "layer:domain"],
  },
};
