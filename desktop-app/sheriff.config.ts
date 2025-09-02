// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { SheriffConfig } from "@softarc/sheriff-core";

export const config: SheriffConfig = {
  entryPoints: {
    main: "src/main/index.ts",
    preload: "src/preload/index.ts",
    renderer: "src/renderer/index.tsx",
  },
  barrelFileName: "mod.ts",
  enableBarrelLess: true,
  excludeRoot: true,
  modules: {
    "src/main": ["layer:entry"],
    "src/main/application": ["layer:application"],
    "src/main/domain": ["layer:domain"],
    "src/main/infrastructure": ["layer:infrastructure"],

    "src/preload": ["layer:application"],

    "src/renderer": ["layer:entry"],
    "src/renderer/application": ["layer:application"],
    "src/renderer/ui": ["layer:ui"],

    "src/shared/common": ["layer:common"],
    "src/shared/domain": ["layer:domain"],
    "src/shared/infrastructure": ["layer:infrastructure"],
  },
  depRules: {
    // root is a virtual module, which contains all files not being part
    // of any module, e.g. application shell, main.ts, etc.
    root: "noTag",
    noTag: "noTag",

    // add your dependency rules here
    "layer:entry": ["layer:*"],
    "layer:ui": ["layer:application", "layer:domain"],
    "layer:application": ["layer:domain", "layer:infrastructure"],
    "layer:infrastructure": ["layer:domain"],
    "layer:*": ["layer:common"],
  },
};
