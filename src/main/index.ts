// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { shell } from "electron/common";
import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

import { LogActivityCommandHandler } from "./application/log_activity_command_handler";
import { ExportTimesheetCommandHandler } from "./application/export_timesheet_command_handler";
import { RecentActivitiesQueryHandler } from "./application/recent_activities_query_handler";
import { Clock } from "../shared/domain/temporal";
import { ReportQueryHandler } from "./application/report_query_handler";
import { StatisticsQueryHandler } from "./application/statistics_query_handler";
import { EstimateQueryHandler } from "./application/estimate_query_handler";
import { BurnUpQueryHandler } from "./application/burn_up_query_handler";
import { TimesheetQueryHandler } from "./application/timesheet_query_handler";
import { TimerService } from "./application/timer_service";
import { Settings } from "../shared/domain/settings";
import { IntervalElapsedEvent } from "../shared/domain/interval_elapsed_event";
import { TimerStartedEvent } from "../shared/domain/timer_started_event";
import { TimerStoppedEvent } from "../shared/domain/timer_stopped_event";
import { EventStore } from "./infrastructure/event_store";
import { HolidayRepository } from "./infrastructure/holiday_repository";
import { VacationRepository } from "./infrastructure/vacation_repository";
import { TimesheetExporter } from "./infrastructure/timesheet_exporter";
import { CommandStatusDto } from "../shared/infrastructure/command_status_dto";
import {
  BurnUpQueryDto,
  BurnUpQueryResultDto,
} from "../shared/infrastructure/burn_up_query_dto";
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
import {
  EstimateQueryDto,
  EstimateQueryResultDto,
} from "../shared/infrastructure/estimate_query_dto";
import { LogActivityCommandDto } from "../shared/infrastructure/log_activity_command_dto";
import { ExportTimesheetCommandDto } from "../shared/infrastructure/export_timesheet_command_dto";
import {
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
} from "../shared/infrastructure/recent_activities_query_dto";
import {
  ReportQueryDto,
  ReportQueryResultDto,
} from "../shared/infrastructure/report_query_dto";
import { SettingsDto } from "../shared/infrastructure/settings";
import {
  StatisticsQueryDto,
  StatisticsQueryResultDto,
} from "../shared/infrastructure/statistics_query_dto";
import { IntervalElapsedEventDto } from "../shared/infrastructure/interval_elapsed_event_dto";
import { TimerStartedEventDto } from "../shared/infrastructure/timer_started_event_dto";
import { TimerStoppedEventDto } from "../shared/infrastructure/timer_stopped_event_dto";
import {
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../shared/infrastructure/timesheet_query_dto";
import { chooseDataDirectory, openWindow } from "./ui/actions";
import { createMenu } from "./ui/menu";
import { SettingsProvider } from "./infrastructure/settings_provider";

let settings = Settings.createDefault();
const settingsProvider = SettingsProvider.create();
const eventStore = EventStore.create();
const holidayRepository = HolidayRepository.create();
const vacationRepository = VacationRepository.create();
const timesheetExporter = TimesheetExporter.create();
const clock = Clock.systemDefaultZone();

const logActivityCommandHandler = LogActivityCommandHandler.create({
  eventStore,
});
const recentActivitiesQueryHandler = RecentActivitiesQueryHandler.create({
  eventStore,
  clock,
});
const reportQueryHandler = ReportQueryHandler.create({ eventStore, clock });
const statisticsQueryHandler = StatisticsQueryHandler.create({
  eventStore,
  clock,
});
const estimateQueryHandler = EstimateQueryHandler.create({
  eventStore,
  clock,
});
const burnUpQueryHandler = BurnUpQueryHandler.create({
  eventStore,
  clock,
});
const timesheetQueryHandler = TimesheetQueryHandler.create({
  capacity: settings.capacity,
  eventStore,
  holidayRepository,
  vacationRepository,
  clock,
});
const exportTimesheetCommandHandler = ExportTimesheetCommandHandler.create({
  timesheetExporter,
});

const timerService = TimerService.create();

const isProduction = app.isPackaged;

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
  settings = await settingsProvider.load();
  if (settings.dataDir !== Settings.createDefault().dataDir) {
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
  ipcMain.handle(
    LOG_ACTIVITY_CHANNEL,
    async (_event, commandDto: LogActivityCommandDto) => {
      const command = LogActivityCommandDto.create(commandDto).validate();
      const status = await logActivityCommandHandler.handle(command);
      return CommandStatusDto.fromModel(status);
    },
  );
  ipcMain.handle(
    EXPORT_TIMESHEET_CHANNEL,
    async (_event, commandDto: ExportTimesheetCommandDto) => {
      const result = await dialog.showSaveDialog({
        title: "Export timesheet file",
        properties: ["showOverwriteConfirmation", "createDirectory"],
        defaultPath: "timesheets.csv",
      });
      const fileName = result.filePath;
      if (fileName == null) {
        return;
      }
      const command = ExportTimesheetCommandDto.create({
        ...commandDto,
        fileName,
      }).validate();
      const status = await exportTimesheetCommandHandler.handle(command);
      return CommandStatusDto.fromModel(status);
    },
  );
  ipcMain.handle(
    QUERY_RECENT_ACTIVITIES_CHANNEL,
    async (_event, queryDto: RecentActivitiesQueryDto) => {
      const query = RecentActivitiesQueryDto.create(queryDto).validate();
      const result = await recentActivitiesQueryHandler.handle(query);
      return RecentActivitiesQueryResultDto.fromModel(result);
    },
  );
  ipcMain.handle(
    QUERY_REPORT_CHANNEL,
    async (_event, queryDto: ReportQueryDto) => {
      const query = ReportQueryDto.create(queryDto).validate();
      const result = await reportQueryHandler.handle(query);
      return ReportQueryResultDto.fromModel(result);
    },
  );
  ipcMain.handle(
    QUERY_STATISTICS_CHANNEL,
    async (_event, queryDto: StatisticsQueryDto) => {
      const query = StatisticsQueryDto.create(queryDto).validate();
      const result = await statisticsQueryHandler.handle(query);
      return StatisticsQueryResultDto.fromModel(result);
    },
  );
  ipcMain.handle(
    QUERY_TIMESHEET_CHANNEL,
    async (_event, queryDto: TimesheetQueryDto) => {
      const query = TimesheetQueryDto.create(queryDto).validate();
      const result = await timesheetQueryHandler.handle(query);
      return TimesheetQueryResultDto.fromModel(result);
    },
  );
  ipcMain.handle(
    QUERY_ESTIMATE_CHANNEL,
    async (_event, queryDto: EstimateQueryDto) => {
      const query = EstimateQueryDto.create(queryDto).validate();
      const result = await estimateQueryHandler.handle(query);
      return EstimateQueryResultDto.fromModel(result);
    },
  );
  ipcMain.handle(
    QUERY_BURN_UP_CHANNEL,
    async (_event, queryDto: BurnUpQueryDto) => {
      const query = BurnUpQueryDto.create(queryDto).validate();
      const result = await burnUpQueryHandler.handle(query);
      return BurnUpQueryResultDto.fromModel(result);
    },
  );
  ipcMain.handle(LOAD_SETTINGS_CHANNEL, async (_event) => {
    const settings = await settingsProvider.load();
    return SettingsDto.fromModel(settings!);
  });
  ipcMain.handle(
    STORE_SETTINGS_CHANNEL,
    async (_event, settings: SettingsDto) => {
      const model = SettingsDto.create(settings).validate();
      await settingsProvider.store(model);
      applySettings(model);
    },
  );
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

  const onDataDirectoryChanged = async (dataDir: string) => {
    settings = { ...settings, dataDir };
    await settingsProvider.store(settings);
    applySettings(settings);
    mainWindow.webContents.reload();
  };

  const menu = createMenu({ timerService, onDataDirectoryChanged });
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
