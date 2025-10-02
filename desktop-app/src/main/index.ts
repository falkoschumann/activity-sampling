// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { shell } from "electron/common";
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  type MenuItemConstructorOptions,
} from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

import { ActivitiesService } from "./application/activities_service";
import { TimerService } from "./application/timer_service";
import {
  IntervalElapsedEvent,
  StartTimerCommand,
  StopTimerCommand,
  TimerStartedEvent,
  TimerStoppedEvent,
} from "../shared/domain/timer";
import {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
  ReportQueryDto,
  ReportQueryResultDto,
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../shared/infrastructure/activities";
import icon from "../../resources/icon.png?asset";
import { Configuration } from "./infrastructure/configuration_gateway";
import { EventStore } from "./infrastructure/event_store";
import { HolidayRepository } from "./infrastructure/holiday_repository";

const configuration = Configuration.createDefault();
const eventStore = EventStore.create(configuration.eventStore);
const holidayRepository = HolidayRepository.create(configuration.holidays);
const activitiesService = new ActivitiesService(
  configuration.activities,
  eventStore,
  holidayRepository,
);
const timerService = TimerService.create();

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
    .then((extensions) =>
      console.info(
        `Added Extensions:  ${extensions.map((e) => e.name).join(", ")}`,
      ),
    )
    .catch((err) => console.error("An error occurred: ", err));
}

function createIpc() {
  ipcMain.handle("logActivity", async (_event, commandDto) => {
    const command = LogActivityCommandDto.create(commandDto).validate();
    const status = await activitiesService.logActivity(command);
    return CommandStatusDto.from(status);
  });
  ipcMain.handle("queryRecentActivities", async (_event, queryDto) => {
    const query = RecentActivitiesQueryDto.create(queryDto).validate();
    const result = await activitiesService.queryRecentActivities(query);
    return RecentActivitiesQueryResultDto.from(result);
  });
  ipcMain.handle("queryReport", async (_event, queryDto) => {
    const query = ReportQueryDto.create(queryDto).validate();
    const result = await activitiesService.queryReport(query);
    return ReportQueryResultDto.from(result);
  });
  ipcMain.handle("queryTimesheet", async (_event, queryDto) => {
    const query = TimesheetQueryDto.create(queryDto).validate();
    const result = await activitiesService.queryTimesheet(query);
    return TimesheetQueryResultDto.from(result);
  });
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 580,
    height: 900,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: path.join(import.meta.dirname, "../preload/index.js"),
    },
  });

  timerService.addEventListener(TimerStartedEvent.TYPE, (event) => {
    const timerStartedEvent = event as TimerStartedEvent;
    mainWindow.webContents.send(TimerStartedEvent.TYPE, {
      timestamp: timerStartedEvent.timestamp.toString(),
      interval: timerStartedEvent.interval.toString(),
    });
  });
  timerService.addEventListener(TimerStoppedEvent.TYPE, (event) => {
    const timerStoppedEvent = event as TimerStoppedEvent;
    mainWindow.webContents.send(TimerStoppedEvent.TYPE, {
      timestamp: timerStoppedEvent.timestamp.toString(),
    });
  });
  timerService.addEventListener(IntervalElapsedEvent.TYPE, (event) => {
    const intervalElapsedEvent = event as IntervalElapsedEvent;
    mainWindow.webContents.send(IntervalElapsedEvent.TYPE, {
      timestamp: intervalElapsedEvent.timestamp.toString(),
      interval: intervalElapsedEvent.interval.toString(),
    });
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local HTML file for production.
  if (!isProduction() && process.env["ELECTRON_RENDERER_URL"]) {
    void mainWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/log.html`);
  } else {
    void mainWindow.loadFile(
      path.join(import.meta.dirname, "../renderer/log.html"),
    );
  }
}

function isSafeForExternalOpen(url: string): boolean {
  return url.startsWith("mailto:");
}

const isMac = process.platform === "darwin";

const template: MenuItemConstructorOptions[] = [
  // { role: 'appMenu' }
  ...((isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []) as MenuItemConstructorOptions[]),
  // { role: 'fileMenu' }
  {
    label: "File",
    submenu: [isMac ? { role: "close" } : { role: "quit" }],
  },
  // { role: 'editMenu' }
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...((isMac
        ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Speech",
              submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
            },
          ]
        : [
            { role: "delete" },
            { type: "separator" },
            { role: "selectAll" },
          ]) as MenuItemConstructorOptions[]),
    ],
  },
  // Notifications
  {
    label: "Notifications",
    submenu: [
      {
        label: "Start",
        submenu: [
          {
            label: "5 min",
            click: () => timerService.startTimer(new StartTimerCommand("PT5M")),
          },
          {
            label: "10 min",
            click: () =>
              timerService.startTimer(new StartTimerCommand("PT10M")),
          },
          {
            label: "15 min",
            click: () =>
              timerService.startTimer(new StartTimerCommand("PT15M")),
          },
          {
            label: "20 min",
            click: () =>
              timerService.startTimer(new StartTimerCommand("PT20M")),
          },
          {
            label: "30 min",
            click: () =>
              timerService.startTimer(new StartTimerCommand("PT30M")),
          },
          {
            label: "60 min",
            click: () => timerService.startTimer(new StartTimerCommand("PT1H")),
          },
          {
            label: "1 min",
            click: () => timerService.startTimer(new StartTimerCommand("PT1M")),
          },
        ],
      },
      {
        label: "Stop",
        click: () => timerService.stopTimer(new StopTimerCommand()),
      },
    ],
  },
  // Reports
  {
    label: "Reports",
    submenu: [
      {
        label: "Report",
        click: () => {
          const reportWindow = new BrowserWindow({
            width: 1000,
            height: 800,
            ...(process.platform === "linux" ? { icon } : {}),
            webPreferences: {
              preload: path.join(import.meta.dirname, "../preload/index.js"),
            },
          });
          if (!isProduction() && process.env["ELECTRON_RENDERER_URL"]) {
            void reportWindow.loadURL(
              `${process.env["ELECTRON_RENDERER_URL"]}/report.html`,
            );
          } else {
            void reportWindow.loadFile(
              path.join(import.meta.dirname, "../renderer/report.html"),
            );
          }
        },
      },
      {
        label: "Timesheet",
        click: () => {
          const reportWindow = new BrowserWindow({
            width: 1000,
            height: 800,
            ...(process.platform === "linux" ? { icon } : {}),
            webPreferences: {
              preload: path.join(import.meta.dirname, "../preload/index.js"),
            },
          });
          if (!isProduction() && process.env["ELECTRON_RENDERER_URL"]) {
            void reportWindow.loadURL(
              `${process.env["ELECTRON_RENDERER_URL"]}/timesheet.html`,
            );
          } else {
            void reportWindow.loadFile(
              path.join(import.meta.dirname, "../renderer/timesheet.html"),
            );
          }
        },
      },
    ],
  },
  // { role: 'viewMenu' }
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  // { role: 'windowMenu' }
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      ...((isMac
        ? [
            { type: "separator" },
            { role: "front" },
            { type: "separator" },
            { role: "window" },
          ]
        : [{ role: "close" }]) as MenuItemConstructorOptions[]),
    ],
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          const { shell } = await import("electron/common");
          await shell.openExternal("https://electronjs.org");
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
