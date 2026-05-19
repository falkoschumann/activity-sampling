// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import type { LoggedActivity } from "../../../../shared/domain/logged_activity";
import { RecentActivitiesQuery, RecentActivitiesQueryResult } from "../../../../shared/domain/recent_activities_query";
import { IntervalElapsedEvent } from "../../../../shared/domain/interval_elapsed_event";
import { LogActivityCommand } from "../../../../shared/domain/log_activity_command";
import { TimerStartedEvent } from "../../../../shared/domain/timer_started_event";
import {
  activityLogged,
  activitySelected,
  type ActivityTemplate,
  changeText,
  initialState,
  intervalElapsed,
  reducer,
  timerStarted,
  timerStopped,
  timerTicked,
} from "../../../domain/log";
import { useMessageHandler } from "../../components/message_handler_context";
import ScrollToTopButton from "../../components/scroll_to_top_button";
import ActivityFormComponent from "./activity_form";
import CountdownComponent from "./countdown";
import { useNotification } from "./notification_hook";
import TimeSummaryComponent from "./time_summary";
import WorkingDaysComponent from "./working_days";

export default function LogPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [result, setResult] = useState(RecentActivitiesQueryResult.create());
  const messageHandler = useMessageHandler();
  const timeoutId = useRef<ReturnType<typeof globalThis.setInterval>>(undefined);

  const handleQueryRecentActivities = useCallback(
    async (query = RecentActivitiesQuery.create()) => {
      const result = await messageHandler.queryRecentActivities(query);
      setResult(result);

      const activity = result.workingDays?.[0]?.activities?.[0];
      if (activity != null) {
        dispatch(
          activitySelected({
            client: activity.client,
            project: activity.project,
            task: activity.task,
            notes: activity.notes,
            category: activity.category,
          }),
        );
      }
    },
    [messageHandler],
  );

  const handleSubmitActivity = useCallback(async () => {
    await messageHandler.logActivity(
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
    messageHandler,
    state.countdown.interval,
    state.form.category,
    state.form.client,
    state.form.notes,
    state.form.project,
    state.form.task,
  ]);

  const handleNotificationClicked = useCallback(
    async (activity?: LoggedActivity) => {
      if (activity == null) {
        return;
      }

      dispatch(
        activitySelected({
          client: activity.client,
          project: activity.project,
          task: activity.task,
          notes: activity.notes,
          category: activity.category,
        }),
      );
      await handleSubmitActivity();
    },
    [handleSubmitActivity],
  );

  const { show, hide } = useNotification({
    lastActivity: result.workingDays?.[0]?.activities?.[0],
    onClicked: handleNotificationClicked,
  });

  useEffect(() => {
    (async function () {
      await handleQueryRecentActivities();
    })();
  }, [handleQueryRecentActivities]);

  useEffect(() => {
    function handleTimerStartedEvent(event: TimerStartedEvent) {
      clearInterval(timeoutId.current);
      timeoutId.current = setInterval(
        () =>
          dispatch(
            timerTicked({
              timestamp: Temporal.Now.instant(),
            }),
          ),
        1000,
      );
      dispatch(timerStarted(event));
    }

    function handleTimerStoppedEvent() {
      clearInterval(timeoutId.current);
      dispatch(timerStopped());
    }

    function handleIntervalElapsedEvent(event: IntervalElapsedEvent) {
      hide();
      show();
      dispatch(intervalElapsed(event));
    }

    messageHandler.addEventListener("timerStarted", handleTimerStartedEvent);
    messageHandler.addEventListener("timerStopped", handleTimerStoppedEvent);
    messageHandler.addEventListener("intervalElapsed", handleIntervalElapsedEvent);

    return () => {
      messageHandler.removeEventListener("timerStarted", handleTimerStartedEvent);
      messageHandler.removeEventListener("timerStopped", handleTimerStoppedEvent);
      messageHandler.removeEventListener("intervalElapsed", handleIntervalElapsedEvent);
    };
  }, [hide, messageHandler, show, timeoutId]);

  return (
    <>
      <ScrollToTopButton />
      <aside className="container my-4">
        <ActivityFormComponent
          categories={result.categories}
          {...state.form}
          onTextChange={async function (name: keyof ActivityTemplate, text: string) {
            dispatch(changeText({ name, text }));
          }}
          onSubmit={handleSubmitActivity}
        />
        <CountdownComponent {...state.countdown} />
      </aside>
      <main className="container mt-4" style={{ paddingBottom: 80 }}>
        <h5>
          Logged activities of the last 30 days
          <button className="btn" title="Refresh logged activities." onClick={() => handleQueryRecentActivities()}>
            <span className="visually-hidden">Refresh logged activities.</span>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </h5>
        <WorkingDaysComponent
          workingDays={result.workingDays}
          onSelect={async function (activity: ActivityTemplate) {
            dispatch(activitySelected(activity));
          }}
        />
      </main>
      <footer className="fixed-bottom bg-body-secondary">
        <div className="container">
          <TimeSummaryComponent {...result.timeSummary} />
        </div>
      </footer>
    </>
  );
}
