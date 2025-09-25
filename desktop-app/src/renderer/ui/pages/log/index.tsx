// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useState } from "react";

import {
  useLogActivity,
  useRecentActivities,
} from "../../../application/activities_service";
import {
  useCountdown,
  useCurrentInterval,
} from "../../../application/timer_service";
import { LogActivityCommand } from "../../../../shared/domain/activities";
import ScrollToTopButton from "../../components/scroll_to_top_button";
import ActivityFormComponent, { type ActivityFormData } from "./activity_form";
import CountdownComponent from "./countdown";
import TimeSummaryComponent from "./time_summary";
import WorkingDaysComponent, { type ActivityTemplate } from "./working_days";

export default function LogPage() {
  const [isFormDisabled, setFormDisabled] = useCurrentInterval();
  const countdown = useCountdown();
  const [logActivity] = useLogActivity();
  const [queryRecentActivities, recentActivities] = useRecentActivities();
  const [formData, setFormData] = useState<ActivityFormData>();

  async function handleSubmitActivity(formData: ActivityFormData) {
    logActivity(
      new LogActivityCommand(
        Temporal.Now.instant(),
        Temporal.Duration.from(countdown.interval),
        formData.client,
        formData.project,
        formData.task,
        formData.notes,
      ),
    );
    setFormDisabled(true);

    queryRecentActivities({});
  }

  function handleActivitySelected(activity: ActivityTemplate) {
    setFormData(activity);
  }

  useEffect(
    () => setFormData(recentActivities.workingDays[0]?.activities[0]),
    [recentActivities.workingDays],
  );

  return (
    <>
      <ScrollToTopButton />
      <aside className="container my-4">
        <ActivityFormComponent
          isDisabled={isFormDisabled}
          {...formData}
          onSubmit={handleSubmitActivity}
        />
        <CountdownComponent {...countdown} />
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
