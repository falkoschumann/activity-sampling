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
    settings: "src/renderer/settings.tsx",
    statistics: "src/renderer/statistics.tsx",
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
      "ui:component",
    ],
    "src/<component>/ui/layouts": [
      "component:<component>",
      "layer:ui",
      "ui:layout",
    ],
    "src/<component>/ui/pages": [
      "component:<component>",
      "layer:ui",
      "ui:page",
    ],
  },
  depRules: {
    "layer:entry": ["layer:*"],
    "layer:ui": ["layer:application", "layer:domain"],
    "layer:application": ["layer:domain", "layer:infrastructure"],
    "layer:infrastructure": ["layer:domain"],
    "layer:*": [sameTag, "layer:common"],
    "ui:entry": ["ui:*", "layer:application"],
    "ui:page": ["ui:layout", "layer:application"],
    "ui:*": [sameTag, "ui:component", "layer:common", "layer:domain"],
    "component:*": [sameTag, "component:shared"],
  },
};
