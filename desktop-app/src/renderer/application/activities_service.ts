// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useReducer, useState } from "react";

import {
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  ReportQuery,
  TimesheetQuery,
} from "../../shared/domain/activities";
import {
  activityLogged,
  activitySelected,
  type ActivityTemplate,
  changeText,
  initialState,
  reducer,
} from "../domain/log";
import {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
  ReportQueryDto,
  ReportQueryResultDto,
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../../shared/infrastructure/activities";
import {
  NotificationClickedEvent,
  NotificationGateway,
} from "../infrastructure/notification_gateway";

export function useLog() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [recentActivities, setRecentActivities] = useState(
    RecentActivitiesQueryResult.empty(),
  );

  useEffect(() => {
    const activity = recentActivities.workingDays[0]?.activities[0];
    if (activity) {
      dispatch(activitySelected(activity));
    }
  }, [recentActivities.workingDays]);

  useEffect(() => {
    void handleQueryRecentActivities();
  }, []);

  useEffect(() => {
    async function handleEvent(event: NotificationClickedEvent) {
      if (event.activity == null) {
        return;
      }

      await logActivity(
        LogActivityCommand.create({
          timestamp: Temporal.Now.instant(),
          duration: Temporal.Duration.from(state.countdown.interval),
          client: event.activity.client,
          project: event.activity.project,
          task: event.activity.task,
          notes: event.activity.notes,
        }),
      );
      dispatch(activityLogged());
      await handleQueryRecentActivities();
    }

    NotificationGateway.getInstance().addEventListener(
      NotificationClickedEvent.TYPE,
      handleEvent,
    );

    return () =>
      NotificationGateway.getInstance().removeEventListener(
        NotificationClickedEvent.TYPE,
        handleEvent,
      );
  }, [state.countdown.interval]);

  async function handleSubmitActivity() {
    await logActivity(
      LogActivityCommand.create({
        timestamp: Temporal.Now.instant(),
        duration: Temporal.Duration.from(state.countdown.interval),
        client: state.form.client,
        project: state.form.project,
        task: state.form.task,
        notes: state.form.notes,
      }),
    );
    dispatch(activityLogged());
    await handleQueryRecentActivities();
  }

  async function handleQueryRecentActivities() {
    const result = await queryRecentActivities({});
    setRecentActivities(result);
  }

  function handleTextChange(name: keyof ActivityTemplate, text: string) {
    dispatch(changeText({ name, text }));
  }

  function handleActivitySelected(activity: ActivityTemplate) {
    dispatch(activitySelected(activity));
  }

  return {
    state,
    dispatch,
    recentActivities,
    handleTextChange,
    handleSubmitActivity,
    handleQueryRecentActivities,
    handleActivitySelected,
  };
}

export async function logActivity(command: LogActivityCommand) {
  NotificationGateway.getInstance().hide();
  const statusDto = await window.activitySampling.logActivity(
    LogActivityCommandDto.fromModel(command),
  );
  return CommandStatusDto.create(statusDto).validate();
}

export async function queryRecentActivities(query: RecentActivitiesQuery) {
  const resultDto = await window.activitySampling.queryRecentActivities(
    RecentActivitiesQueryDto.fromModel(query),
  );
  const result = RecentActivitiesQueryResultDto.create(resultDto).validate();
  if (result.workingDays[0]?.activities[0] != null) {
    const activity = result.workingDays[0].activities[0];
    NotificationGateway.getInstance().setCurrentActivity(activity);
  }
  return result;
}

export async function queryReport(query: ReportQuery) {
  const resultDto = await window.activitySampling.queryReport(
    ReportQueryDto.from(query),
  );
  return ReportQueryResultDto.create(resultDto).validate();
}

export async function queryTimesheet(query: TimesheetQuery) {
  const resultDto = await window.activitySampling.queryTimesheet(
    TimesheetQueryDto.from(query),
  );
  return TimesheetQueryResultDto.create(resultDto).validate();
}
