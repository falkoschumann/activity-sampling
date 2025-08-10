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
    "src/main": ["layer:entry", "component:main"],
    "src/main/application": ["layer:application", "component:main"],
    "src/main/common": ["layer:common", "component:main"],
    "src/main/domain": ["layer:domain", "component:main"],
    "src/main/infrastructure": ["layer:infrastructure", "component:main"],

    "src/preload": ["layer:entry", "component:preload"],
    "src/preload/application": ["layer:application", "component:preload"],
    "src/preload/common": ["layer:common", "component:preload"],
    "src/preload/domain": ["layer:domain", "component:preload"],
    "src/preload/infrastructure": ["layer:infrastructure", "component:preload"],

    "src/renderer": ["layer:entry", "component:renderer"],
    "src/renderer/application": ["layer:application", "component:renderer"],
    "src/renderer/common": ["layer:common", "component:renderer"],
    "src/renderer/domain": ["layer:domain", "component:renderer"],
    "src/renderer/infrastructure": [
      "layer:infrastructure",
      "component:renderer",
    ],
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
    "component:main": ["layer:*"],
    "component:preload": ["layer:*", "component:main"],
    "component:renderer": ["layer:*", "component:main"],
  },
};
