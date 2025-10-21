// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { shell } from "electron/common";
import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron/main";
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
import { Settings } from "../shared/domain/settings";
import { SettingsDto } from "../shared/infrastructure/settings";
import {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
  ReportQueryDto,
  ReportQueryResultDto,
  StatisticsQueryDto,
  StatisticsQueryResultDto,
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../shared/infrastructure/activities";
import {
  IntervalElapsedEventDto,
  TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../shared/infrastructure/timer";
import { chooseDataDirectory, openWindow } from "./ui/actions";
import { createMenu } from "./ui/menu";
import {
  INTERVAL_ELAPSED_CHANNEL,
  LOAD_SETTINGS_CHANNEL,
  LOG_ACTIVITY_CHANNEL,
  QUERY_RECENT_ACTIVITIES_CHANNEL,
  QUERY_REPORT_CHANNEL,
  QUERY_STATISTICS_CHANNEL,
  QUERY_TIMESHEET_CHANNEL,
  SHOW_OPEN_DIALOG_CHANNEL,
  STORE_SETTINGS_CHANNEL,
  TIMER_STARTED_CHANNEL,
  TIMER_STOPPED_CHANNEL,
} from "../shared/infrastructure/channels";
import {
  SettingsChangedEvent,
  SettingsService,
} from "./application/settings_service";

const settingsService = SettingsService.create();
const activitiesService = ActivitiesService.create();
const timerService = TimerService.create();

settingsService.addEventListener(SettingsChangedEvent.TYPE, (event) => {
  applySettings(event as SettingsChangedEvent);
});

const isProduction = app.isPackaged;

app.whenReady().then(async () => {
  await initializeApplication();
  await installDevTools();
  createRendererToMainChannels();
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
  const settings = await settingsService.loadSettings();
  if (settings.dataDir !== Settings.createDefault().dataDir) {
    applySettings(settings);
    return;
  }

  let canceled: boolean;
  do {
    canceled = await chooseDataDirectory(settingsService);
  } while (canceled);
}

function applySettings(settings: Settings) {
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

function createRendererToMainChannels() {
  ipcMain.handle(
    LOG_ACTIVITY_CHANNEL,
    async (_event, commandDto: LogActivityCommandDto) => {
      const command = LogActivityCommandDto.create(commandDto).validate();
      const status = await activitiesService.logActivity(command);
      return CommandStatusDto.fromModel(status);
    },
  );
  ipcMain.handle(
    QUERY_RECENT_ACTIVITIES_CHANNEL,
    async (_event, queryDto: RecentActivitiesQueryDto) => {
      const query = RecentActivitiesQueryDto.create(queryDto).validate();
      const result = await activitiesService.queryRecentActivities(query);
      return RecentActivitiesQueryResultDto.from(result);
    },
  );
  ipcMain.handle(
    QUERY_REPORT_CHANNEL,
    async (_event, queryDto: ReportQueryDto) => {
      const query = ReportQueryDto.create(queryDto).validate();
      const result = await activitiesService.queryReport(query);
      return ReportQueryResultDto.from(result);
    },
  );
  ipcMain.handle(
    QUERY_STATISTICS_CHANNEL,
    async (_event, queryDto: StatisticsQueryDto) => {
      const query = StatisticsQueryDto.create(queryDto).validate();
      const result = await activitiesService.queryStatistics(query);
      return StatisticsQueryResultDto.from(result);
    },
  );
  ipcMain.handle(
    QUERY_TIMESHEET_CHANNEL,
    async (_event, queryDto: TimesheetQueryDto) => {
      const query = TimesheetQueryDto.create(queryDto).validate();
      const result = await activitiesService.queryTimesheet(query);
      return TimesheetQueryResultDto.from(result);
    },
  );
  ipcMain.handle(LOAD_SETTINGS_CHANNEL, async (_event) => {
    const settings = await settingsService.loadSettings();
    return SettingsDto.fromModel(settings!);
  });
  ipcMain.handle(
    STORE_SETTINGS_CHANNEL,
    async (_event, settings: SettingsDto) => {
      const model = SettingsDto.create(settings).validate();
      await settingsService.storeSettings(model);
      activitiesService.applySettings(model);
    },
  );
  ipcMain.handle(
    SHOW_OPEN_DIALOG_CHANNEL,
    async (_event, options: Electron.OpenDialogOptions) =>
      dialog.showOpenDialog(options),
  );
}

async function createWindow() {
  const mainWindow = openWindow({
    rendererFile: "log.html",
    width: 600,
    height: 900,
  });

  settingsService.addEventListener(SettingsChangedEvent.TYPE, () =>
    mainWindow.webContents.reload(),
  );

  const menu = createMenu({ timerService, settingsService });
  Menu.setApplicationMenu(menu);

  createMainToLogWindowChannels(mainWindow);
}

function createMainToLogWindowChannels(window: BrowserWindow) {
  timerService.addEventListener(TimerStartedEvent.TYPE, (event) =>
    window.webContents.send(
      TIMER_STARTED_CHANNEL,
      TimerStartedEventDto.fromModel(event as TimerStartedEvent),
    ),
  );
  timerService.addEventListener(TimerStoppedEvent.TYPE, (event) =>
    window.webContents.send(
      TIMER_STOPPED_CHANNEL,
      TimerStoppedEventDto.fromModel(event as TimerStoppedEvent),
    ),
  );
  timerService.addEventListener(IntervalElapsedEvent.TYPE, (event) =>
    window.webContents.send(
      INTERVAL_ELAPSED_CHANNEL,
      IntervalElapsedEventDto.fromModel(event as IntervalElapsedEvent),
    ),
  );
}
