// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { app, Menu, type MenuItemConstructorOptions } from "electron/main";

import type { TimerService } from "../application/timer_service";
import { StartTimerCommand, StopTimerCommand } from "../../shared/domain/timer";
import { openDataDirectory, openWindow } from "./actions";

const isMac = process.platform === "darwin";

export function createMenu({
  timerService,
  onDataDirectoryChanged,
}: {
  timerService: TimerService;
  onDataDirectoryChanged: (dataDir: string) => void;
}): Menu {
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
      submenu: [
        {
          label: "Open...",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            const dataDir = await openDataDirectory();
            if (dataDir != null) {
              onDataDirectoryChanged(dataDir);
            }
          },
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ] as MenuItemConstructorOptions[],
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
              click: () =>
                timerService.startTimer(
                  StartTimerCommand.create({ interval: "PT5M" }),
                ),
            },
            {
              label: "10 min",
              click: () =>
                timerService.startTimer(
                  StartTimerCommand.create({ interval: "PT10M" }),
                ),
            },
            {
              label: "15 min",
              click: () =>
                timerService.startTimer(
                  StartTimerCommand.create({ interval: "PT15M" }),
                ),
            },
            {
              label: "20 min",
              click: () =>
                timerService.startTimer(
                  StartTimerCommand.create({ interval: "PT20M" }),
                ),
            },
            {
              label: "30 min",
              click: () =>
                timerService.startTimer(
                  StartTimerCommand.create({ interval: "PT30M" }),
                ),
            },
            {
              label: "60 min",
              click: () =>
                timerService.startTimer(
                  StartTimerCommand.create({ interval: "PT1H" }),
                ),
            },
            {
              label: "1 min",
              click: () =>
                timerService.startTimer(
                  StartTimerCommand.create({ interval: "PT1M" }),
                ),
            },
          ],
        },
        {
          label: "Stop",
          click: () => timerService.stopTimer(StopTimerCommand.create()),
        },
      ],
    },
    // Reports
    {
      label: "Reports",
      submenu: [
        {
          label: "Report",
          accelerator: "Shift+CmdOrCtrl+R",
          click: () =>
            openWindow({
              rendererFile: "report.html",
              width: 1000,
              height: 800,
            }),
        },
        {
          label: "Timesheet",
          accelerator: "Shift+CmdOrCtrl+T",
          click: () =>
            openWindow({
              rendererFile: "timesheet.html",
              width: 1000,
              height: 800,
            }),
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

  return Menu.buildFromTemplate(template);
}
