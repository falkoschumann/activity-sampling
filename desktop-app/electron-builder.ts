// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Configuration } from "electron-builder";

const options: Configuration = {
  appId: "de.muspellheim.activitysampling",
  productName: "Activity Sampling",
  directories: {
    buildResources: "build",
  },
  files: [
    "!**/.vscode/*",
    "!data/*",
    "!src/*",
    "!test/*",
    "!testdata/*",
    "!electron.vite.config.*",
    "!eslint.config.*",
    "!Makefile",
    "!CHANGELOG.*",
    "!CONTRIBUTING.*",
    "!LICENSE.*",
    "!README.*",
    "!sheriff.config.*",
    "!tsconfig.*",
    "!vitest.config.*",
    "!.prettierrc",
  ],
  // uncomment to inspect distribution artifact
  //asar: false,
  asarUnpack: ["resources/**"],
  win: {
    executableName: "activity-sampling",
  },
  nsis: {
    artifactName: "${name}-${version}-setup.${ext}",
    shortcutName: "${productName}",
    uninstallDisplayName: "${productName}",
    createDesktopShortcut: "always",
  },
  mac: {
    entitlementsInherit: "build/entitlements.mac.plist",
    extendInfo: [
      "NSDocumentsFolderUsageDescription: Application requests access to the user's Documents folder.",
      "NSDownloadsFolderUsageDescription: Application requests access to the user's Downloads folder.",
    ],
    // uncomment to speed up build for local testing
    //notarize: false,
    //identity: null,
  },
  dmg: {
    artifactName: "${name}-${version}.${ext}",
  },
  linux: {
    target: ["AppImage", "snap", "deb"],
    maintainer: "Falko Schumann",
    category: "Utility",
  },
  appImage: {
    artifactName: "${name}-${version}.${ext}",
  },
  npmRebuild: false,
  publish: {
    provider: "generic",
    url: "https://example.com/auto-updates",
  },
};

export default options;
