// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useCallback, useEffect, useReducer, useState } from "react";

import {
  EstimateQuery,
  EstimateQueryResult,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  ReportQuery,
  ReportQueryResult,
  StatisticsQuery,
  StatisticsQueryResult,
  TimesheetQuery,
  TimesheetQueryResult,
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
  EstimateQueryDto,
  EstimateQueryResultDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
  ReportQueryDto,
  ReportQueryResultDto,
  StatisticsQueryDto,
  StatisticsQueryResultDto,
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../../shared/infrastructure/activities";
import {
  NotificationClickedEvent,
  NotificationGateway,
} from "../infrastructure/notification_gateway";
import { SettingsDto } from "../../shared/infrastructure/settings";

export function useLog() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [recentActivities, setRecentActivities] = useState(
    RecentActivitiesQueryResult.empty(),
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

export function useReport(query: ReportQuery) {
  const [result, setResult] = useState(ReportQueryResult.empty());

  useEffect(() => {
    (async function () {
      const result = await queryReport({
        scope: query.scope,
        from: query.from ? Temporal.PlainDate.from(query.from) : undefined,
        to: query.to ? Temporal.PlainDate.from(query.to) : undefined,
      });
      setResult(result);
    })();
  }, [query.scope, query.from, query.to]);

  return result;
}

async function queryReport(query: ReportQuery) {
  const resultDto = await window.activitySampling.queryReport(
    ReportQueryDto.fromModel(query),
  );
  return ReportQueryResultDto.create(resultDto).validate();
}

export function useStatistics(query: StatisticsQuery) {
  const [result, setResult] = useState(StatisticsQueryResult.empty());

  useEffect(() => {
    (async function () {
      const result = await queryStatistics(query);
      setResult(result);
    })();
  }, [query]);

  return result;
}

async function queryStatistics(query: StatisticsQuery) {
  const resultDto = await window.activitySampling.queryStatistics(
    StatisticsQueryDto.fromModel(query),
  );
  return StatisticsQueryResultDto.create(resultDto).validate();
}

export function useTimesheet(query: TimesheetQuery) {
  const [result, setResult] = useState(TimesheetQueryResult.empty());

  useEffect(() => {
    (async function () {
      const result = await queryTimesheet({
        from: Temporal.PlainDate.from(query.from),
        to: Temporal.PlainDate.from(query.to),
      });
      setResult(result);
    })();
  }, [query.from, query.to]);

  return result;
}

async function queryTimesheet(query: TimesheetQuery) {
  const resultDto = await window.activitySampling.queryTimesheet(
    TimesheetQueryDto.fromModel(query),
  );
  return TimesheetQueryResultDto.create(resultDto).validate();
}

export function useEstimate(query: EstimateQuery): EstimateQueryResult {
  const [result, setResult] = useState(EstimateQueryResult.empty());

  useEffect(() => {
    (async function () {
      const result = await queryEstimate(query);
      setResult(result);
    })();
  }, [query]);

  return result;
}

async function queryEstimate(query: EstimateQuery) {
  const resultDto = await window.activitySampling.queryEstimate(
    EstimateQueryDto.fromModel(query),
  );
  return EstimateQueryResultDto.create(resultDto).validate();
}
