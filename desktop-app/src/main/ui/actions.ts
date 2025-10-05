// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { app, BrowserWindow, dialog } from "electron/main";

import icon from "../../../build/icon.png?asset";

const isProduction = app.isPackaged;

export async function openDataDirectory(): Promise<string | undefined> {
  const result = await dialog.showOpenDialog({
    title: "Choose data directory",
    properties: ["openDirectory", "createDirectory"],
  });
  return result.filePaths[0];
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
