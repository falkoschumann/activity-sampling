// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useReducer, useState } from "react";

import {
  logActivity,
  queryRecentActivities,
} from "../../../application/activities_service";
import { useCurrentInterval } from "../../../application/timer_service";
import {
  LogActivityCommand,
  RecentActivitiesQueryResult,
} from "../../../../shared/domain/activities";
import {
  activityLogged,
  activitySelected,
  type ActivityTemplate,
  changeText,
  initialState,
  reducer,
} from "../../../domain/log";
import ScrollToTopButton from "../../components/scroll_to_top_button";
import ActivityFormComponent from "./activity_form";
import CountdownComponent from "./countdown";
import TimeSummaryComponent from "./time_summary";
import WorkingDaysComponent from "./working_days";

export default function LogPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [recentActivities, setRecentActivities] = useState(
    RecentActivitiesQueryResult.empty(),
  );

  useCurrentInterval(dispatch);

  useEffect(() => {
    const activity = recentActivities.workingDays[0]?.activities[0];
    if (activity) {
      dispatch(activitySelected(activity));
    }
  }, [recentActivities.workingDays]);

  useEffect(() => {
    void handleQueryRecentActivities();
  }, []);

  async function handleSubmitActivity() {
    await logActivity(
      new LogActivityCommand(
        Temporal.Now.instant(),
        Temporal.Duration.from(state.countdown.interval),
        state.form.client,
        state.form.project,
        state.form.task,
        state.form.notes,
      ),
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

  return (
    <>
      <ScrollToTopButton />
      <aside className="container my-4">
        <ActivityFormComponent
          {...state.form}
          onTextChange={handleTextChange}
          onSubmit={handleSubmitActivity}
        />
        <CountdownComponent {...state.countdown} />
      </aside>
      <main className="container my-4">
        <h5>
          Logged activities of the last 30 days
          <button
            className="btn"
            title="Refresh logged activities."
            onClick={() => queryRecentActivities({})}
          >
            <span className="visually-hidden">Refresh logged activities.</span>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </h5>
        <WorkingDaysComponent
          workingDays={recentActivities.workingDays}
          onSelect={handleActivitySelected}
        />
      </main>
      <footer className="fixed-bottom bg-body-secondary">
        <div className="container">
          <TimeSummaryComponent {...recentActivities.timeSummary} />
        </div>
      </footer>
    </>
  );
}
