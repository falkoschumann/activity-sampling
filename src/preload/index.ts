// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { Message } from "@muspellheim/shared";
import {
  contextBridge,
  ipcRenderer,
  type IpcRendererEvent,
} from "electron/renderer";

import {
  EVENT_CHANNEL,
  MESSAGE_CHANNEL,
} from "../shared/infrastructure/channels";

contextBridge.exposeInMainWorld("activitySampling", {
  routeMessage: async <M = Message, R = unknown>(message: M): Promise<R> =>
    ipcRenderer.invoke(MESSAGE_CHANNEL, message),

  subscribeEvents: <E = Message>(eventHandler: (event: E) => void) => {
    function listener(_event: IpcRendererEvent, args: unknown) {
      eventHandler(args as E);
    }

    ipcRenderer.on(EVENT_CHANNEL, listener);
    return () => {
      ipcRenderer.off(EVENT_CHANNEL, listener);
    };
  },
});
