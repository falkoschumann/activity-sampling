// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { join } from "path";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

import icon from "../../resources/icon.png?asset";
import type { RecentActivitiesQuery } from "./domain/activities";

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
    void mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    void mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  if (!app.isPackaged) {
    installExtension([REACT_DEVELOPER_TOOLS])
      .then(([redux, react]) =>
        console.log(`Added Extensions:  ${redux.name}, ${react.name}`),
      )
      .catch((err) => console.log("An error occurred: ", err));
  }

  ipcMain.handle(
    "queryRecentActivities",
    async (_event, _query: RecentActivitiesQuery) =>
      Promise.resolve({
        lastActivity: {
          dateTime: "2025-08-21T09:20+02:00",
          duration: "PT30M",
          client: "Test client",
          project: "Test project",
          task: "Test task",
        },
        workingDays: [
          {
            date: "2025-08-21",
            activities: [
              {
                dateTime: "2025-08-21T09:20+02:00",
                duration: "PT30M",
                client: "Test client",
                project: "Test project",
                task: "Test task",
              },
              {
                dateTime: "2025-08-21T08:50+02:00",
                duration: "PT30M",
                client: "Test client",
                project: "Test project",
                task: "Test task",
                notes: "Test notes",
              },
            ],
          },
        ],
        timeSummary: {
          hoursToday: "PT1H",
          hoursYesterday: "PT0S",
          hoursThisWeek: "PT1H",
          hoursThisMonth: "PT1H",
        },
      }),
  );

  // IPC test
  ipcMain.on("ping", () => console.log("pong"));

  createWindow();

  app.on("activate", function () {
    // On macOS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
