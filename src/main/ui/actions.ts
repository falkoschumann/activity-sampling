// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { app, BrowserWindow, dialog } from "electron/main";

import icon from "../../../resources/icon.png?asset";
import type { SettingsService } from "../application/settings_service";

const isProduction = app.isPackaged;

export async function chooseDataDirectory(
  settingsService: SettingsService,
): Promise<boolean> {
  const result = await dialog.showOpenDialog({
    title: "Choose data directory",
    properties: ["openDirectory", "createDirectory"],
  });
  const dataDir = result.filePaths[0];
  if (dataDir != null) {
    const settings = await settingsService.loadSettings();
    await settingsService.storeSettings({ ...settings, dataDir });
  }
  return result.canceled;
}

export function openWindow({
  rendererFile,
  preloadFile = "index.js",
  width = 800,
  height = 600,
}: {
  rendererFile: string;
  preloadFile?: string;
  width?: number;
  height?: number;
}): BrowserWindow {
  const window = new BrowserWindow({
    width,
    height,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: path.join(import.meta.dirname, "../preload", preloadFile),
    },
  });
  if (!isProduction && process.env["ELECTRON_RENDERER_URL"]) {
    void window.loadURL(
      `${process.env["ELECTRON_RENDERER_URL"]}/${rendererFile}`,
    );
  } else {
    void window.loadFile(
      path.join(import.meta.dirname, "../renderer", rendererFile),
    );
  }
  return window;
}
