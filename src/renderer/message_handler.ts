// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, createCommandStatus } from "@muspellheim/shared";

import type { ExportTimesheetCommand } from "../shared/domain/export_timesheet_command";
import type { LogActivityCommand } from "../shared/domain/log_activity_command";
import {
  type BurnUpQuery,
  BurnUpQueryResult,
} from "../shared/domain/burn_up_query";
import {
  type EstimateQuery,
  EstimateQueryResult,
} from "../shared/domain/estimate_query";
import {
  type RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../shared/domain/recent_activities_query";
import {
  type ReportQuery,
  ReportQueryResult,
} from "../shared/domain/report_query";
import {
  type StatisticsQuery,
  StatisticsQueryResult,
} from "../shared/domain/statistics_query";
import {
  type TimesheetQuery,
  TimesheetQueryResult,
} from "../shared/domain/timesheet_query";
import {
  SettingsQuery,
  SettingsQueryResult,
} from "../shared/domain/settings_query";
import type { UpdateSettingsCommand } from "../shared/domain/update_settings_command";
import type { MessageHandler } from "./ui/components/message_handler_context";
import { TimerStartedEvent } from "../shared/domain/timer_started_event";
import { TimerStoppedEvent } from "../shared/domain/timer_stopped_event";
import { IntervalElapsedEvent } from "../shared/domain/interval_elapsed_event";

export class MessageHandlerImpl extends EventTarget implements MessageHandler {
  static create() {
    return new MessageHandlerImpl();
  }

  private constructor() {
    super();
    window.activitySampling.onTimerStartedEvent((json) =>
      this.#handleTimerStartedEvent(json),
    );
    window.activitySampling.onTimerStoppedEvent((json) =>
      this.#handleTimerStoppedEvent(json),
    );
    window.activitySampling.onIntervalElapsedEvent((json) =>
      this.#handleIntervalElapsedEvent(json),
    );
  }

  // async startTimer(command: StartTimerCommand): Promise<CommandStatus> {}

  // async stopTimer(command: StopTimerCommand): Promise<CommandStatus> {}

  async logActivity(command: LogActivityCommand): Promise<CommandStatus> {
    let json = JSON.stringify(command);
    json = await window.activitySampling.logActivity(json);
    const dto = JSON.parse(json);
    return createCommandStatus(dto);
  }

  async exportTimesheet(
    command: ExportTimesheetCommand,
  ): Promise<CommandStatus> {
    let json = JSON.stringify(command);
    json = await window.activitySampling.exportTimesheet(json);
    const dto = JSON.parse(json);
    return createCommandStatus(dto);
  }

  async updateSettings(command: UpdateSettingsCommand): Promise<CommandStatus> {
    let json = JSON.stringify(command);
    json = await window.activitySampling.querySettings(json);
    const dto = JSON.parse(json);
    return createCommandStatus(dto);
  }

  // async queryCurrentInterval(query: CurrentIntervalQuery): Promise<CurrentIntervalQueryResult> {}

  async queryRecentActivities(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult> {
    let json = JSON.stringify(query);
    json = await window.activitySampling.queryRecentActivities(json);
    const dto = JSON.parse(json);
    return RecentActivitiesQueryResult.create(dto);
  }

  async queryReport(query: ReportQuery): Promise<ReportQueryResult> {
    let json = JSON.stringify(query);
    json = await window.activitySampling.queryReport(json);
    const dto = JSON.parse(json);
    return ReportQueryResult.create(dto);
  }

  async queryStatistics(
    query: StatisticsQuery,
  ): Promise<StatisticsQueryResult> {
    let json = JSON.stringify(query);
    json = await window.activitySampling.queryStatistics(json);
    const dto = JSON.parse(json);
    return StatisticsQueryResult.create(dto);
  }

  async queryEstimate(query: EstimateQuery): Promise<EstimateQueryResult> {
    let json = JSON.stringify(query);
    json = await window.activitySampling.queryEstimate(json);
    const dto = JSON.parse(json);
    return EstimateQueryResult.create(dto);
  }

  async queryBurnUp(query: BurnUpQuery): Promise<BurnUpQueryResult> {
    let json = JSON.stringify(query);
    json = await window.activitySampling.queryBurnUp(json);
    const dto = JSON.parse(json);
    return BurnUpQueryResult.create(dto);
  }

  async queryTimesheet(query: TimesheetQuery): Promise<TimesheetQueryResult> {
    let json = JSON.stringify(query);
    json = await window.activitySampling.queryTimesheet(json);
    const dto = JSON.parse(json);
    return TimesheetQueryResult.create(dto);
  }

  async querySettings(query: SettingsQuery): Promise<SettingsQueryResult> {
    let json = JSON.stringify(query);
    json = await window.activitySampling.querySettings(json);
    const dto = JSON.parse(json);
    return SettingsQueryResult.create(dto);
  }

  #handleTimerStartedEvent(json: string) {
    const dto = JSON.parse(json);
    const event = TimerStartedEvent.create(dto);
    this.dispatchEvent(event);
  }

  #handleTimerStoppedEvent(json: string) {
    const dto = JSON.parse(json);
    const event = TimerStoppedEvent.create(dto);
    this.dispatchEvent(event);
  }

  #handleIntervalElapsedEvent(json: string) {
    const dto = JSON.parse(json);
    const event = IntervalElapsedEvent.create(dto);
    this.dispatchEvent(event);
  }
}
