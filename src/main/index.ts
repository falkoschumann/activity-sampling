// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";
import fs from "node:fs/promises";

import {
  EventBus,
  type Message,
  MessageRouter,
  State,
} from "@muspellheim/shared";
import { shell } from "electron/common";
import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

import { ChangeSettingsCommandHandler } from "./application/change_settings.command_handler";
import { ExportTimesheetCommandHandler } from "./application/export_timesheet.command_handler";
import { GetBurnUpQueryHandler } from "./application/get_burn_up.query_handler";
import { GetSettingsQueryHandler } from "./application/get_settings.query_handler";
import { GetCurrentIntervalQueryHandler } from "./application/get_current_interval.query_handler";
import { GetEstimateQueryHandler } from "./application/get_estimate.query_handler";
import { GetRecentActivitiesQueryHandler } from "./application/get_recent_activities.query_handler";
import { GetReportQueryHandler } from "./application/get_report.query_handler";
import { GetStatisticsQueryHandler } from "./application/get_statistics.query_handler";
import { GetTimesheetQueryHandler } from "./application/get_timesheet.query_handler";
import { LogActivityCommandHandler } from "./application/log_activity.command_handler";
import { NotifierProcessManager } from "./application/notifier.process_manager";
import { StartTimerCommandHandler } from "./application/start_timer.command_handler";
import { StopTimerCommandHandler } from "./application/stop_timer.command_handler";
import { TickTimerCommandHandler } from "./application/tick_timer.command_handler";
import { TimerProcessManager } from "./application/timer.process_manager";
import { TimesheetExportEventHandler } from "./application/timesheet_exporter.event_handler";
import { createStopTimerCommand } from "../shared/domain/timer/stop_timer.command";
import type { TimerStartedEvent } from "../shared/domain/timer/timer_started.event";
import type { TimerStoppedEvent } from "../shared/domain/timer/timer_stopped.event";
import type { TimerTickedEvent } from "../shared/domain/timer/timer_ticked.event";
import type { TimerElapsedEvent } from "../shared/domain/timer/timer_elapsed.event";
import { createTimer, projectTimer } from "../shared/domain/timer.read_model";
import { EventStore } from "./infrastructure/event_store";
import { HolidayRepository } from "./infrastructure/holiday.repository";
import { SettingsProvider } from "./infrastructure/settings.provider";
import { NotificationsGateway } from "./infrastructure/notifications.gateway";
import { TimesheetExporterGateway } from "./infrastructure/timesheet_exporter.gateway";
import { VacationRepository } from "./infrastructure/vacation.repository";
import { chooseDataDirectory, openWindow } from "./ui/actions";
import { createMenu } from "./ui/menu";
import {
  EVENT_CHANNEL,
  MESSAGE_CHANNEL,
} from "../shared/infrastructure/channels";

const isProduction = app.isPackaged;

const messageRouter = new MessageRouter();
const eventBus = new EventBus();

const eventStore = EventStore.create();
const settingsProvider = SettingsProvider.create();
const holidayRepository = HolidayRepository.create();
const vacationRepository = VacationRepository.create();

const notificationsGateway = NotificationsGateway.create();
const timesheetExporterGateway = TimesheetExporterGateway.create();

// Activity
messageRouter.register(
  "export-timesheet",
  ExportTimesheetCommandHandler.create({ eventBus, settingsProvider }),
);
messageRouter.register(
  "log-activity",
  LogActivityCommandHandler.create({ eventBus, eventStore }),
);

// Settings
messageRouter.register(
  "change-settings",
  ChangeSettingsCommandHandler.create({ eventBus, settingsProvider }),
);

// Timer
messageRouter.register(
  "start-timer",
  StartTimerCommandHandler.create({ eventBus }),
);
messageRouter.register(
  "stop-timer",
  StopTimerCommandHandler.create({ eventBus }),
);
messageRouter.register(
  "tick-timer",
  TickTimerCommandHandler.create({ eventBus }),
);

// Queries
messageRouter.register(
  "get-burn-up",
  GetBurnUpQueryHandler.create({ eventStore }),
);
messageRouter.register(
  "get-settings",
  GetSettingsQueryHandler.create({ settingsProvider }),
);
const timerView = new State(createTimer());
eventBus.subscribe<
  TimerStartedEvent | TimerStoppedEvent | TimerTickedEvent | TimerElapsedEvent
>((event) => {
  let view = timerView.get();
  view = projectTimer(view, event);
  timerView.put(view);
});
messageRouter.register(
  "get-current-interval",
  GetCurrentIntervalQueryHandler.create({ view: timerView }),
);
messageRouter.register(
  "get-estimate",
  GetEstimateQueryHandler.create({ eventStore }),
);
messageRouter.register(
  "get-recent-activities",
  GetRecentActivitiesQueryHandler.create({ eventStore, settingsProvider }),
);
messageRouter.register(
  "get-report",
  GetReportQueryHandler.create({ eventStore }),
);
messageRouter.register(
  "get-statistics",
  GetStatisticsQueryHandler.create({ eventStore }),
);
messageRouter.register(
  "get-timesheet",
  GetTimesheetQueryHandler.create({
    eventStore,
    holidayRepository,
    vacationRepository,
    settingsProvider,
  }),
);

// Integration
NotifierProcessManager.create({
  eventBus,
  messageRouter,
  notificationsGateway,
});
TimerProcessManager.create({
  eventBus,
  messageRouter,
});
TimesheetExportEventHandler.create({
  eventBus,
  timesheetExporterGateway,
});

app.whenReady().then(async () => {
  await initializeApplication();
  await installDevTools();
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
    shutdownApplication();
    app.quit();
  }
});

app.on("will-quit", () => shutdownApplication());

// On macOS, it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});

async function initializeApplication() {
  if (!isProduction) {
    return;
  }

  let preferences = await loadPreferences();
  if (preferences.dataDirectory != null) {
    applyDataDirectory(preferences.dataDirectory);
    return;
  }

  let dataDirectory;
  do {
    dataDirectory = await chooseDataDirectory();
  } while (dataDirectory == null);
  preferences = { ...preferences, dataDirectory };
  await storePreferences(preferences);
  applyDataDirectory(dataDirectory);
}

type Preferences = Readonly<{ dataDirectory?: string }>;

const preferencesDirectory = app.getPath("userData");
const preferencesFile = path.join(preferencesDirectory, "preferences.json");

async function loadPreferences(): Promise<Preferences> {
  try {
    const json = await fs.readFile(preferencesFile, "utf-8");
    return JSON.parse(json);
  } catch (error) {
    dialog.showErrorBox("Could not load preferences:", String(error));
    return {};
  }
}

async function storePreferences(preferences: Preferences) {
  try {
    const json = JSON.stringify(preferences);
    await fs.mkdir(preferencesDirectory, { recursive: true });
    await fs.writeFile(preferencesFile, json, "utf-8");
  } catch (error) {
    dialog.showErrorBox("Could not store preferences:", String(error));
  }
}

function applyDataDirectory(dataDirectory: string) {
  eventStore.filename = `${dataDirectory}/activity-log.csv`;
  settingsProvider.filename = `${dataDirectory}/settings.json`;
  holidayRepository.filename = `${dataDirectory}/holidays.csv`;
  vacationRepository.filename = `${dataDirectory}/vacation.csv`;
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

function createWindow() {
  const mainWindow = openWindow({
    rendererFile: "log.html",
    width: 600,
    height: 900,
  });

  const onDataDirectoryChanged = async (dataDirectory: string) => {
    let preferences = await loadPreferences();
    preferences = { ...preferences, dataDirectory };
    await storePreferences(preferences);
    applyDataDirectory(dataDirectory);
    mainWindow.webContents.reload();
  };

  const menu = createMenu({
    messageRouter,
    onDataDirectoryChanged,
  });
  Menu.setApplicationMenu(menu);

  ipcMain.handle(MESSAGE_CHANNEL, async (_event, message: Message) =>
    messageRouter.route(message),
  );
  eventBus.subscribe((event) =>
    mainWindow.webContents.send(EVENT_CHANNEL, event),
  );
}

function shutdownApplication() {
  void messageRouter.route(createStopTimerCommand());
}
