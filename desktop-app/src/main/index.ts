// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { shell } from "electron/common";
import { app, BrowserWindow, ipcMain, Menu } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

import { ActivitiesService } from "./application/activities_service";
import { TimerService } from "./application/timer_service";
import {
  IntervalElapsedEvent,
  TimerStartedEvent,
  TimerStoppedEvent,
} from "../shared/domain/timer";
import { Settings } from "./domain/settings";
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
import { SettingsGateway } from "./infrastructure/settings_gateway";
import {
  IntervalElapsedEventDto,
  TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../shared/infrastructure/timer";
import { openDataDirectory, openWindow } from "./ui/actions";
import { createMenu } from "./ui/menu";

const settingsGateway = SettingsGateway.create();
const activitiesService = ActivitiesService.create();
const timerService = TimerService.create();

const isProduction = app.isPackaged;

app.whenReady().then(async () => {
  await initializeApplication();
  await installDevTools();
  createIpc();
  await createWindow();
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

  function isSafeForExternalOpen(url: string): boolean {
    return url.startsWith("mailto:");
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// On macOS, it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});

async function initializeApplication() {
  let settings = await settingsGateway.load();
  if (settings != null) {
    activitiesService.applySettings(settings);
    return;
  }

  let dataDir: string | undefined;
  do {
    dataDir = await openDataDirectory();
  } while (dataDir == null);
  settings = { ...Settings.createDefault(), dataDir };
  await settingsGateway.store(settings);
  activitiesService.applySettings(settings);
}

async function installDevTools() {
  if (isProduction) {
    // No dev tools in production
    return;
  }

  await installExtension([REACT_DEVELOPER_TOOLS])
    .then((extensions) =>
      console.info(
        `Added Extensions:  ${extensions.map((e) => e.name).join(", ")}`,
      ),
    )
    .catch((err) => console.error("An error occurred: ", err));
}

function createIpc() {
  ipcMain.handle(
    "logActivity",
    async (_event, commandDto: LogActivityCommandDto) => {
      const command = LogActivityCommandDto.create(commandDto).validate();
      const status = await activitiesService.logActivity(command);
      return CommandStatusDto.fromModel(status);
    },
  );
  ipcMain.handle(
    "queryRecentActivities",
    async (_event, queryDto: RecentActivitiesQueryDto) => {
      const query = RecentActivitiesQueryDto.create(queryDto).validate();
      const result = await activitiesService.queryRecentActivities(query);
      return RecentActivitiesQueryResultDto.from(result);
    },
  );
  ipcMain.handle("queryReport", async (_event, queryDto: ReportQueryDto) => {
    const query = ReportQueryDto.create(queryDto).validate();
    const result = await activitiesService.queryReport(query);
    return ReportQueryResultDto.from(result);
  });
  ipcMain.handle(
    "queryTimesheet",
    async (_event, queryDto: TimesheetQueryDto) => {
      const query = TimesheetQueryDto.create(queryDto).validate();
      const result = await activitiesService.queryTimesheet(query);
      return TimesheetQueryResultDto.from(result);
    },
  );
}

async function createWindow() {
  const mainWindow = openWindow({
    rendererFile: "log.html",
    width: 580,
    height: 900,
  });
  mainWindow.webContents.backgroundThrottling = false;

  const onDataDirectoryChanged = async (dataDir: string) => {
    let settings = await settingsGateway.load();
    settings = { ...settings!, dataDir };
    await settingsGateway.store(settings);
    activitiesService.applySettings(settings);
    mainWindow.webContents.reload();
  };
  const menu = createMenu({ timerService, onDataDirectoryChanged });
  Menu.setApplicationMenu(menu);

  timerService.addEventListener(TimerStartedEvent.TYPE, (event) =>
    mainWindow.webContents.send(
      TimerStartedEvent.TYPE,
      TimerStartedEventDto.fromModel(event as TimerStartedEvent),
    ),
  );
  timerService.addEventListener(TimerStoppedEvent.TYPE, (event) =>
    mainWindow.webContents.send(
      TimerStoppedEvent.TYPE,
      TimerStoppedEventDto.fromModel(event as TimerStoppedEvent),
    ),
  );
  timerService.addEventListener(IntervalElapsedEvent.TYPE, (event) =>
    mainWindow.webContents.send(
      IntervalElapsedEvent.TYPE,
      IntervalElapsedEventDto.fromModel(event as IntervalElapsedEvent),
    ),
  );
}
