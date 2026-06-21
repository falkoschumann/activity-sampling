// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { LogActivityCommand } from "../../../shared/domain/logged-activity/log_activity.command";
import { ActivityLoggedEvent } from "./activity_logged.event";

export function logActivity(
  command: LogActivityCommand,
): ActivityLoggedEvent[] {
  return [
    ActivityLoggedEvent.create({
      ...command.data,
      timestamp: command.data.timestamp.round("seconds"),
      duration: command.data.duration.round("minutes"),
    }),
  ];
}
