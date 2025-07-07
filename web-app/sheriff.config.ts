// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { sameTag, SheriffConfig } from "@softarc/sheriff-core";

export const config: SheriffConfig = {
  enableBarrelLess: true,
  modules: {
    "src/application": "layer:application",
    "src/common": "layer:common",
    "src/domain": "layer:domain",
    "src/infrastructure": "layer:infrastructure",
    "src/ui": "layer:ui",
    "src/ui/components": "ui:component",
    "src/ui/layouts": "ui:layout",
    "src/ui/pages": "ui:page",
    "src/ui/templates": "ui:template",
  },
  depRules: {
    // root is a virtual module, which contains all files not being part
    // of any module, e.g. application shell, main.ts, etc.
    root: "layer:*",
    noTag: "noTag",

    // add your dependency rules here
    "layer:ui": ["layer:application", "layer:domain", "ui:*"],
    "layer:application": ["layer:domain", "layer:infrastructure"],
    "layer:infrastructure": ["layer:domain"],
    "layer:*": ["layer:common"],
    "ui:page": ["ui:layout", "ui:component", "layer:application"],
    "ui:layout": ["ui:component", "layer:application"],
    "ui:component": sameTag,
    "ui:*": ["layer:domain", "layer:common"],
  },
};
