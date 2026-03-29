// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useCallback, useEffect, useReducer, useState } from "react";

import {
  activityLogged,
  activitySelected,
  type ActivityTemplate,
  changeText,
  initialState,
  reducer,
} from "../domain/log";
import { LogActivityCommand } from "../../shared/domain/log_activity_command";
import {
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../../shared/domain/recent_activities_query";
import { CommandStatusDto } from "../../shared/infrastructure/command_status_dto";
import { LogActivityCommandDto } from "../../shared/infrastructure/log_activity_command_dto";
import {
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
} from "../../shared/infrastructure/recent_activities_query_dto";
import { SettingsDto } from "../../shared/infrastructure/settings";
import {
  NotificationClickedEvent,
  NotificationGateway,
} from "../infrastructure/notification_gateway";

export function useLog() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [recentActivities, setRecentActivities] = useState(
    RecentActivitiesQueryResult.create(),
  );
  const [categories, setCategories] = useState<string[]>([]);

  const handleQueryRecentActivities = useCallback(async () => {
    const result = await queryRecentActivities({});
    setRecentActivities(result);
  }, []);

  const handleSubmitActivity = useCallback(async () => {
    await logActivity(
      LogActivityCommand.create({
        timestamp: Temporal.Now.instant(),
        duration: Temporal.Duration.from(state.countdown.interval),
        client: state.form.client,
        project: state.form.project,
        task: state.form.task,
        notes: state.form.notes,
        category: state.form.category,
      }),
    );
    dispatch(activityLogged());
    await handleQueryRecentActivities();
  }, [
    handleQueryRecentActivities,
    state.countdown.interval,
    state.form.category,
    state.form.client,
    state.form.notes,
    state.form.project,
    state.form.task,
  ]);

  const handleTextChange = useCallback(
    (name: keyof ActivityTemplate, text: string) => {
      dispatch(changeText({ name, text }));
    },
    [],
  );

  const handleActivitySelected = useCallback((activity: ActivityTemplate) => {
    dispatch(activitySelected(activity));
  }, []);

  useEffect(() => {
    (async () => {
      const dto = await window.activitySampling.loadSettings();
      const settings = SettingsDto.create(dto).validate();
      setCategories(settings.categories);
    })();
  }, []);

  useEffect(() => {
    const activity = recentActivities.workingDays[0]?.activities[0];
    if (activity) {
      dispatch(activitySelected(activity));
    }
  }, [recentActivities.workingDays]);

  useEffect(() => {
    (async () => {
      await handleQueryRecentActivities();
    })();
  }, [handleQueryRecentActivities]);

  useEffect(() => {
    async function handleEvent(event: NotificationClickedEvent) {
      if (event.activity == null) {
        return;
      }

      const command = LogActivityCommand.create({
        timestamp: Temporal.Now.instant(),
        duration: Temporal.Duration.from(state.countdown.interval),
        client: event.activity.client,
        project: event.activity.project,
        task: event.activity.task,
        notes: event.activity.notes,
        category: event.activity.category,
      });
      await logActivity(command);
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
  }, [handleQueryRecentActivities, state.countdown.interval]);

  return {
    categories,
    state,
    dispatch,
    recentActivities,
    handleTextChange,
    handleSubmitActivity,
    handleQueryRecentActivities,
    handleActivitySelected,
  };
}

async function logActivity(command: LogActivityCommand) {
  NotificationGateway.getInstance().hide();
  const statusDto = await window.activitySampling.logActivity(
    LogActivityCommandDto.fromModel(command),
  );
  return CommandStatusDto.create(statusDto).validate();
}

async function queryRecentActivities(query: RecentActivitiesQuery) {
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
