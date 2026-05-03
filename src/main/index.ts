// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { shell } from "electron/common";
import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

import { StartTimerCommandHandler } from "./application/start_timer_command_handler";
import { StopTimerCommandHandler } from "./application/stop_timer_command_handler";
import { LogActivityCommandHandler } from "./application/log_activity_command_handler";
import { ExportTimesheetCommandHandler } from "./application/export_timesheet_command_handler";
import { RecentActivitiesQueryHandler } from "./application/recent_activities_query_handler";
import { ReportQueryHandler } from "./application/report_query_handler";
import { StatisticsQueryHandler } from "./application/statistics_query_handler";
import { EstimateQueryHandler } from "./application/estimate_query_handler";
import { BurnUpQueryHandler } from "./application/burn_up_query_handler";
import { TimesheetQueryHandler } from "./application/timesheet_query_handler";
import { Settings } from "../shared/domain/settings";
import { TimerState } from "./domain/timer_state";
import { IntervalElapsedEvent } from "../shared/domain/interval_elapsed_event";
import { TimerStartedEvent } from "../shared/domain/timer_started_event";
import { TimerStoppedEvent } from "../shared/domain/timer_stopped_event";
import { EventStore } from "./infrastructure/event_store";
import { HolidayRepository } from "./infrastructure/holiday_repository";
import { VacationRepository } from "./infrastructure/vacation_repository";
import { TimesheetExporter } from "./infrastructure/timesheet_exporter";
import {
  EXPORT_TIMESHEET_CHANNEL,
  INTERVAL_ELAPSED_CHANNEL,
  LOAD_SETTINGS_CHANNEL,
  LOG_ACTIVITY_CHANNEL,
  QUERY_BURN_UP_CHANNEL,
  QUERY_ESTIMATE_CHANNEL,
  QUERY_RECENT_ACTIVITIES_CHANNEL,
  QUERY_REPORT_CHANNEL,
  QUERY_STATISTICS_CHANNEL,
  QUERY_TIMESHEET_CHANNEL,
  SHOW_OPEN_DIALOG_CHANNEL,
  STORE_SETTINGS_CHANNEL,
  TIMER_STARTED_CHANNEL,
  TIMER_STOPPED_CHANNEL,
} from "../shared/infrastructure/channels";
import { chooseDataDirectory, openWindow } from "./ui/actions";
import { createMenu } from "./ui/menu";
import { SettingsProvider } from "./infrastructure/settings_provider";
import type { StartTimerCommand } from "../shared/domain/start_timer_command";
import type { StopTimerCommand } from "../shared/domain/stop_timer_command";
import { LogActivityCommand } from "../shared/domain/log_activity_command";
import { ExportTimesheetCommand } from "../shared/domain/export_timesheet_command";
import { RecentActivitiesQuery } from "../shared/domain/recent_activities_query";
import { ReportQuery } from "../shared/domain/report_query";
import { StatisticsQuery } from "../shared/domain/statistics_query";
import { TimesheetQuery } from "../shared/domain/timesheet_query";
import { EstimateQuery } from "../shared/domain/estimate_query";
import { BurnUpQuery, BurnUpQueryResult } from "../shared/domain/burn_up_query";
import { CurrentIntervalQueryHandler } from "./application/current_interval_query_handler";

const isProduction = app.isPackaged;

const fileName = isProduction
  ? path.join(app.getPath("userData"), "settings.json")
  : undefined;
const settingsProvider = SettingsProvider.create({ fileName });
const eventStore = EventStore.create();
const holidayRepository = HolidayRepository.create();
const vacationRepository = VacationRepository.create();
const timesheetExporter = TimesheetExporter.create();

const timerState = TimerState.create();
const startTimerCommandHandler = StartTimerCommandHandler.create({
  timerState,
});
const stopTimerCommandHandler = StopTimerCommandHandler.create();
const currentIntervalQueryHandler = CurrentIntervalQueryHandler.create({
  timerState,
});
const logActivityCommandHandler = LogActivityCommandHandler.create({
  eventStore,
});
const recentActivitiesQueryHandler = RecentActivitiesQueryHandler.create({
  eventStore,
});
const reportQueryHandler = ReportQueryHandler.create({ eventStore });
const statisticsQueryHandler = StatisticsQueryHandler.create({ eventStore });
const estimateQueryHandler = EstimateQueryHandler.create({ eventStore });
const burnUpQueryHandler = BurnUpQueryHandler.create({ eventStore });
const timesheetQueryHandler = TimesheetQueryHandler.create({
  eventStore,
  holidayRepository,
  vacationRepository,
});
const exportTimesheetCommandHandler = ExportTimesheetCommandHandler.create({
  timesheetExporter,
});

app.whenReady().then(async () => {
  await initializeApplication();
  await installDevTools();
  createRendererToMainChannels();
  createWindow();
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
  let settings = await settingsProvider.load();
  if (settings.dataDir !== Settings.create().dataDir) {
    applySettings(settings);
    return;
  }

  let dataDir;
  do {
    dataDir = await chooseDataDirectory();
  } while (dataDir == null);
  settings = { ...settings, dataDir };
  await settingsProvider.store(settings);
  applySettings(settings);
}

function applySettings(settings: Settings) {
  eventStore.fileName = `${settings.dataDir}/activity-log.csv`;
  holidayRepository.fileName = `${settings.dataDir}/holidays.csv`;
  vacationRepository.fileName = `${settings.dataDir}/vacation.csv`;
  timesheetQueryHandler.capacity = settings.capacity;
}

async function installDevTools() {
  if (isProduction) {
    // No dev tools in production
    return;
  }

  try {
    const extensions = await installExtension([REACT_DEVELOPER_TOOLS]);
    console.info(
      `Added Extensions:  ${extensions.map((e) => e.name).join(", ")}`,
    );
  } catch (error) {
    console.error("An error occurred: ", error);
  }
}

function createRendererToMainChannels() {
  ipcMain.handle(LOG_ACTIVITY_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const command = LogActivityCommand.create(dto);
    const status = await logActivityCommandHandler.handle(command);
    return JSON.stringify(status);
  });
  ipcMain.handle(EXPORT_TIMESHEET_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const result = await dialog.showSaveDialog({
      title: "Export timesheet file",
      properties: ["showOverwriteConfirmation", "createDirectory"],
      defaultPath: "timesheets.csv",
    });
    const fileName = result.filePath;
    if (fileName == null) {
      return;
    }
    const command = ExportTimesheetCommand.create({
      ...dto,
      fileName,
    });
    const status = await exportTimesheetCommandHandler.handle(command);
    return JSON.stringify(status);
  });
  ipcMain.handle(
    QUERY_RECENT_ACTIVITIES_CHANNEL,
    async (_event, json: string) => {
      const dto = JSON.parse(json);
      const query = RecentActivitiesQuery.create(dto);
      const result = await recentActivitiesQueryHandler.handle(query);
      return JSON.stringify(result);
    },
  );
  ipcMain.handle(QUERY_REPORT_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const query = ReportQuery.create(dto);
    const result = await reportQueryHandler.handle(query);
    return JSON.stringify(result);
  });
  ipcMain.handle(QUERY_STATISTICS_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const query = StatisticsQuery.create(dto);
    const result = await statisticsQueryHandler.handle(query);
    return JSON.stringify(result);
  });
  ipcMain.handle(QUERY_TIMESHEET_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const query = TimesheetQuery.create(dto);
    const result = await timesheetQueryHandler.handle(query);
    return JSON.stringify(result);
  });
  ipcMain.handle(QUERY_ESTIMATE_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const query = EstimateQuery.create(dto);
    const result = await estimateQueryHandler.handle(query);
    return JSON.stringify(result);
  });
  ipcMain.handle(QUERY_BURN_UP_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const query = BurnUpQuery.create(dto);
    const result = await burnUpQueryHandler.handle(query);
    return BurnUpQueryResult.create(result);
  });
  ipcMain.handle(LOAD_SETTINGS_CHANNEL, async (_event) => {
    const settings = await settingsProvider.load();
    return JSON.stringify(settings);
  });
  ipcMain.handle(STORE_SETTINGS_CHANNEL, async (_event, json: string) => {
    const dto = JSON.parse(json);
    const model = Settings.create(dto);
    await settingsProvider.store(model);
    applySettings(model);
  });
  ipcMain.handle(
    SHOW_OPEN_DIALOG_CHANNEL,
    async (_event, options: Electron.OpenDialogOptions) =>
      dialog.showOpenDialog(options),
  );
}

function createWindow() {
  const mainWindow = openWindow({
    rendererFile: "log.html",
    width: 600,
    height: 900,
  });

  const onStartTimer = (command: StartTimerCommand) =>
    startTimerCommandHandler.handle(command);

  const onStopTimer = (command: StopTimerCommand) =>
    stopTimerCommandHandler.handle(command);

  const onDataDirectoryChanged = async (dataDir: string) => {
    let settings = await settingsProvider.load();
    settings = { ...settings, dataDir };
    await settingsProvider.store(settings);
    applySettings(settings);
    mainWindow.webContents.reload();
  };

  const menu = createMenu({
    onStartTimer,
    onStopTimer,
    onDataDirectoryChanged,
  });
  Menu.setApplicationMenu(menu);

  createMainToLogWindowChannels(mainWindow);
}

function createMainToLogWindowChannels(window: BrowserWindow) {
  startTimerCommandHandler.addEventListener(TimerStartedEvent.TYPE, (event) =>
    window.webContents.send(
      TIMER_STARTED_CHANNEL,
      TimerStartedEvent.create(event as TimerStartedEvent),
    ),
  );
  stopTimerCommandHandler.addEventListener(TimerStoppedEvent.TYPE, (event) =>
    window.webContents.send(
      TIMER_STOPPED_CHANNEL,
      TimerStoppedEvent.create(event as TimerStoppedEvent),
    ),
  );
  currentIntervalQueryHandler.addEventListener(
    IntervalElapsedEvent.TYPE,
    (event) =>
      window.webContents.send(
        INTERVAL_ELAPSED_CHANNEL,
        IntervalElapsedEvent.create(event as IntervalElapsedEvent),
      ),
  );
}
