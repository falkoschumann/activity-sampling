// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { app, Menu, type MenuItemConstructorOptions } from "electron/main";

import { StartTimerCommand } from "../../shared/domain/timer/start_timer.command";
import { StopTimerCommand } from "../../shared/domain/timer/stop_timer.command";
import { chooseDataDirectory, openWindow } from "./actions";
import type { MessageRouter } from "@muspellheim/shared";

const isMac = process.platform === "darwin";

export function createMenu({
  messageRouter,
  onDataDirectoryChanged,
}: {
  messageRouter: MessageRouter;
  onDataDirectoryChanged: (directory: string) => void;
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
              {
                label: "Settings...",
                accelerator: "CmdOrCtrl+,",
                click: () =>
                  openWindow({
                    rendererFile: "settings.html",
                    width: 800,
                    height: 390,
                  }),
              },
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
            const dataDirectory = await chooseDataDirectory();
            if (dataDirectory != null) {
              onDataDirectoryChanged(dataDirectory);
            }
          },
        },
        ...((isMac
          ? []
          : [
              { type: "separator" },
              {
                label: "Settings...",
                accelerator: "CmdOrCtrl+,",
                click: () =>
                  openWindow({
                    rendererFile: "settings.html",
                    width: 800,
                    height: 390,
                  }),
              },
            ]) as MenuItemConstructorOptions[]),
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
                messageRouter.route(
                  StartTimerCommand.create({ interval: "PT5M" }),
                ),
            },
            {
              label: "10 min",
              click: () =>
                messageRouter.route(
                  StartTimerCommand.create({ interval: "PT10M" }),
                ),
            },
            {
              label: "15 min",
              click: () =>
                messageRouter.route(
                  StartTimerCommand.create({ interval: "PT15M" }),
                ),
            },
            {
              label: "20 min",
              click: () =>
                messageRouter.route(
                  StartTimerCommand.create({ interval: "PT20M" }),
                ),
            },
            {
              label: "30 min",
              click: () =>
                messageRouter.route(
                  StartTimerCommand.create({ interval: "PT30M" }),
                ),
            },
            {
              label: "60 min",
              click: () =>
                messageRouter.route(
                  StartTimerCommand.create({ interval: "PT1H" }),
                ),
            },
            {
              label: "1 min",
              click: () =>
                messageRouter.route(
                  StartTimerCommand.create({ interval: "PT1M" }),
                ),
            },
          ],
        },
        {
          label: "Stop",
          click: () => messageRouter.route(StopTimerCommand.create()),
        },
      ],
    },
    // Reports
    {
      label: "Reports",
      submenu: [
        {
          label: "Report",
          accelerator: "Alt+CmdOrCtrl+R",
          click: () =>
            openWindow({
              rendererFile: "report.html",
              width: 1000,
              height: 800,
            }),
        },
        {
          label: "Statistics",
          accelerator: "Alt+CmdOrCtrl+S",
          click: () =>
            openWindow({
              rendererFile: "statistics.html",
              width: 1000,
              height: 800,
            }),
        },
        {
          label: "Estimate",
          accelerator: "Alt+CmdOrCtrl+E",
          click: () =>
            openWindow({
              rendererFile: "estimate.html",
              width: 1000,
              height: 800,
            }),
        },
        {
          label: "Burn-up Chart",
          accelerator: "Alt+CmdOrCtrl+B",
          click: () =>
            openWindow({
              rendererFile: "burn-up-chart.html",
              width: 1000,
              height: 800,
            }),
        },
        {
          label: "Timesheet",
          accelerator: "Alt+CmdOrCtrl+T",
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
