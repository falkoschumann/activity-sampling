// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { Message } from "@muspellheim/shared";

export type Unsubscriber = () => void;

export interface ActivitySampling {
  routeMessage<M = Message, R = unknown>(message: M): Promise<R>;

  subscribeEvents<E = Message>(eventHandler: (event: E) => void): Unsubscriber;
}

declare global {
  interface Window {
    activitySampling: ActivitySampling;
  }
}
