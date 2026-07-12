// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { Message } from "@muspellheim/shared";
import type { SaveDialogOptions, SaveDialogReturnValue } from "electron/common";

export type Unsubscriber = () => void;

export interface ActivitySampling {
  routeMessage<R = unknown>(message: Message): Promise<R>;

  subscribeEvents<E = Message>(eventHandler: (event: E) => void): Unsubscriber;

  showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue>;
}

declare global {
  interface Window {
    activitySampling: ActivitySampling;
  }
}
