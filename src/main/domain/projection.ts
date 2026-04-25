// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ActivityLoggedEvent } from "./activity_logged_event";

export interface Projection<T> {
  update(event: ActivityLoggedEvent): void;
  get(): T;
}
