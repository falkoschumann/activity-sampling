// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { Message } from "@muspellheim/shared";
import {
  contextBridge,
  ipcRenderer,
  type IpcRendererEvent,
  type SaveDialogOptions,
} from "electron/renderer";

import {
  EVENT_CHANNEL,
  MESSAGE_CHANNEL,
  SHOW_SAVE_DIALOG_CHANNEL,
} from "../shared/infrastructure/channels";

contextBridge.exposeInMainWorld("activitySampling", {
  routeMessage: async <R = unknown>(message: Message): Promise<R> =>
    ipcRenderer.invoke(MESSAGE_CHANNEL, message),

  subscribeEvents: <E = Message>(eventHandler: (event: E) => void) => {
    function listener(_event: IpcRendererEvent, message: E) {
      eventHandler(message);
    }

    ipcRenderer.on(EVENT_CHANNEL, listener);
    return () => {
      ipcRenderer.off(EVENT_CHANNEL, listener);
    };
  },

  showSaveDialog: (options: SaveDialogOptions) =>
    ipcRenderer.invoke(SHOW_SAVE_DIALOG_CHANNEL, options),
});
