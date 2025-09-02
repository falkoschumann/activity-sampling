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
    "src/main/common": ["layer:common"],
    "src/main/domain": ["layer:domain"],
    "src/main/infrastructure": ["layer:infrastructure"],
    "src/preload": ["layer:ui"],
    "src/renderer": ["layer:ui"], //TODO should
  },
  depRules: {
    // root is a virtual module, which contains all files not being part
    // of any module, e.g. application shell, main.ts, etc.
    root: "noTag",
    noTag: "noTag",

    // add your dependency rules here
    "layer:entry": ["layer:*"],
    "layer:ui": ["layer:application", "layer:domain"],
    "layer:humble-view": ["layer:domain"],
    "layer:application": ["layer:domain", "layer:infrastructure"],
    "layer:infrastructure": ["layer:domain"],
    "layer:*": ["layer:common"],
  },
};
