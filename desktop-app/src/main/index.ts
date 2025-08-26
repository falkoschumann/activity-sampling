// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "path";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

import icon from "../../resources/icon.png?asset";
import { ActivitiesService } from "./application/activities_service";
import type { RecentActivitiesQuery } from "./domain/activities";

app.whenReady().then(() => {
  installDevTools();
  createIpc();
  createWindow();

  app.on("activate", function () {
    // On macOS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("web-contents-created", (_event, contents) => {
  contents.setWindowOpenHandler((details) => {
    if (isSafeForExternalOpen(details.url)) {
      setTimeout(() => {
        void shell.openExternal(details.url);
      }, 0);
    }

    return { action: "deny" };
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function isProduction() {
  return app.isPackaged;
}

function installDevTools() {
  if (isProduction()) {
    // No dev tools in production
    return;
  }

  installExtension([REACT_DEVELOPER_TOOLS])
    .then(([redux, react]) =>
      console.log(`Added Extensions:  ${redux.name}, ${react.name}`),
    )
    .catch((err) => console.log("An error occurred: ", err));
}

function createIpc() {
  const activitiesService = ActivitiesService.create();
  ipcMain.handle("logActivity", async (_event, command) =>
    activitiesService.logActivity(command),
  );
  ipcMain.handle(
    "queryRecentActivities",
    async (_event, query: RecentActivitiesQuery) =>
      activitiesService.queryRecentActivities(query),
  );
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
    },
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local HTML file for production.
  if (!isProduction() && process.env["ELECTRON_RENDERER_URL"]) {
    void mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

function isSafeForExternalOpen(url: string): boolean {
  return url.startsWith("mailto:");
}
