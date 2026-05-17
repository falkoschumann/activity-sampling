// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { CommandStatus } from "@muspellheim/shared";
import { createContext, useContext } from "react";

import { BurnUpQuery, BurnUpQueryResult } from "../../../shared/domain/burn_up_query";
import { EstimateQuery, EstimateQueryResult } from "../../../shared/domain/estimate_query";
import { ExportTimesheetCommand } from "../../../shared/domain/export_timesheet_command";
import { LogActivityCommand } from "../../../shared/domain/log_activity_command";
import { RecentActivitiesQuery, RecentActivitiesQueryResult } from "../../../shared/domain/recent_activities_query";
import { type ReportQuery, ReportQueryResult } from "../../../shared/domain/report_query";
import { TimesheetQuery, TimesheetQueryResult } from "../../../shared/domain/timesheet_query";
import { type StatisticsQuery, StatisticsQueryResult } from "../../../shared/domain/statistics_query";
import { INTERVAL_ELAPSED_EVENT, IntervalElapsedEvent } from "../../../shared/domain/interval_elapsed_event";
import { TIMER_STARTED_EVENT, TimerStartedEvent } from "../../../shared/domain/timer_started_event";
import { TIMER_STOPPED_EVENT, TimerStoppedEvent } from "../../../shared/domain/timer_stopped_event";
import { ACTIVITY_LOGGED_EVENT, ActivityLoggedEvent } from "../../../shared/domain/activity_logged_event";
import type { UpdateSettingsCommand } from "../../../shared/domain/update_settings_command";
import { SettingsQuery, SettingsQueryResult } from "../../../shared/domain/settings_query"; // TODO Split message handler per window?

// TODO Split message handler per window?
// TODO Use start timer, stop timer and query current interval

type MessageHandlerEvents = {
  [TIMER_STARTED_EVENT]: TimerStartedEvent;
  [TIMER_STOPPED_EVENT]: TimerStoppedEvent;
  [INTERVAL_ELAPSED_EVENT]: IntervalElapsedEvent;
  [ACTIVITY_LOGGED_EVENT]: ActivityLoggedEvent;
};

interface MessageHandlerEventListener<K extends keyof MessageHandlerEvents> {
  (event: MessageHandlerEvents[K]): void;
}

interface MessageHandlerEventListenerObject<
  K extends keyof MessageHandlerEvents,
> {
  handleEvent(event: MessageHandlerEvents[K]): void;
}

export interface MessageHandler extends EventTarget {
  // Commands

  // startTimer(command: StartTimerCommand): Promise<CommandStatus>;

  // stopTimer(command: StopTimerCommand): Promise<CommandStatus>;

  logActivity(command: LogActivityCommand): Promise<CommandStatus>;

  exportTimesheet(command: ExportTimesheetCommand): Promise<CommandStatus>;

  updateSettings(command: UpdateSettingsCommand): Promise<CommandStatus>;

  // Queries

  //queryCurrentInterval(query: CurrentIntervalQuery): Promise<CurrentIntervalQueryResult>;

  queryRecentActivities(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult>;

  queryReport(query: ReportQuery): Promise<ReportQueryResult>;

  queryStatistics(query: StatisticsQuery): Promise<StatisticsQueryResult>;

  queryEstimate(query: EstimateQuery): Promise<EstimateQueryResult>;

  queryBurnUp(query: BurnUpQuery): Promise<BurnUpQueryResult>;

  queryTimesheet(query: TimesheetQuery): Promise<TimesheetQueryResult>;

  querySettings(query: SettingsQuery): Promise<SettingsQueryResult>;

  // Events

  addEventListener<K extends keyof MessageHandlerEvents>(
    type: K,
    listener:
      | MessageHandlerEventListener<K>
      | MessageHandlerEventListenerObject<K>
      | null,
    options?: boolean | AddEventListenerOptions,
  ): void;

  removeEventListener<K extends keyof MessageHandlerEvents>(
    type: K,
    listener:
      | MessageHandlerEventListener<K>
      | MessageHandlerEventListenerObject<K>
      | null,
    options?: boolean | EventListenerOptions,
  ): void;
}

export const MessageHandlerContext = createContext<MessageHandler | null>(null);

export function useMessageHandler() {
  const messageHandler = useContext(MessageHandlerContext);
  if (messageHandler == null) {
    throw new Error("MessageHandlerContext is not provided.");
  }

  return messageHandler;
}
