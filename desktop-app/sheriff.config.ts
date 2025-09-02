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
    "src/main": ["component:main", "layer:entry"],
    "src/main/application": ["component:main", "layer:application"],
    "src/main/domain": ["component:main", "layer:domain"],
    "src/main/infrastructure": ["component:main", "layer:infrastructure"],

    "src/preload": ["component:preload", "layer:application"],

    "src/renderer": ["component:renderer", "layer:entry"],
    "src/renderer/application": ["component:renderer", "layer:application"],
    "src/renderer/ui": ["component:renderer", "layer:ui"],

    "src/shared/common": ["component:shared", "layer:common"],
    "src/shared/domain": ["component:shared", "layer:domain"],
    "src/shared/infrastructure": ["component:shared", "layer:infrastructure"],
  },
  depRules: {
    // root is a virtual module, which contains all files not being part
    // of any module, e.g. application shell, main.ts, etc.
    root: "noTag",
    noTag: "noTag",

    // add your dependency rules here
    "component:*": ["component:shared", "layer:*"],
    "layer:entry": ["layer:*"],
    "layer:ui": ["layer:application", "layer:domain"],
    "layer:application": ["layer:domain", "layer:infrastructure"],
    "layer:infrastructure": ["layer:domain"],
    "layer:*": ["layer:common"],
  },
};
