// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { sameTag, SheriffConfig } from "@softarc/sheriff-core";

/**
 * Minimal configuration for Sheriff
 * Assigns the 'noTag' tag to all modules and
 * allows all modules to depend on each other.
 */

export const config: SheriffConfig = {
  enableBarrelLess: true,
  modules: {
    // apply tags to your modules
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
    //root: "noTag",
    root: "layer:*",
    noTag: "noTag",

    // add your dependency rules here
    "layer:ui": ["layer:application", "layer:domain", "layer:common", "ui:*"],
    "layer:application": [
      "layer:domain",
      "layer:infrastructure",
      "layer:common",
    ],
    "layer:domain": ["layer:common"],
    "layer:infrastructure": ["layer:domain", "layer:common"],
    "layer:common": sameTag,
    "ui:page": ["ui:layout", "ui:component", "layer:application"],
    "ui:layout": ["ui:component", "layer:application"],
    "ui:component": sameTag,
    "ui:*": ["layer:domain", "layer:common"],
  },
};
