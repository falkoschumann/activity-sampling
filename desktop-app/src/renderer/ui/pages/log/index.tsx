// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect } from "react";

import {
  useLogActivity,
  useRecentActivities,
} from "../../../application/activities_service";
import { useCurrentInterval } from "../../../application/timer_service";
import { LogActivityCommand } from "../../../../shared/domain/activities";
import type { ActivityTemplate } from "../../../domain/activities";
import {
  activityLogged,
  activitySelected,
  changeText,
} from "../../../domain/timer";
import ScrollToTopButton from "../../components/scroll_to_top_button";
import ActivityFormComponent from "./activity_form";
import CountdownComponent from "./countdown";
import TimeSummaryComponent from "./time_summary";
import WorkingDaysComponent from "./working_days";

export default function LogPage() {
  const [state, dispatch] = useCurrentInterval();
  const [logActivity] = useLogActivity();
  const [queryRecentActivities, recentActivities] = useRecentActivities();

  async function handleSubmitActivity() {
    logActivity(
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
    queryRecentActivities({});
  }

  function handleTextChange(name: keyof ActivityTemplate, text: string) {
    dispatch(changeText({ name, text }));
  }

  function handleActivitySelected(activity: ActivityTemplate) {
    dispatch(activitySelected(activity));
  }

  useEffect(() => {
    const activity = recentActivities.workingDays[0]?.activities[0];
    if (activity) {
      dispatch(activitySelected(activity));
    }
  }, [dispatch, recentActivities.workingDays]);

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
