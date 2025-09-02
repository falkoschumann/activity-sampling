// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { LogActivityCommand } from "../../../../shared/domain/activities";
import {
  useLogActivity,
  useRecentActivities,
} from "../../../application/activities_service";
import ScrollToTopButton from "../../components/scroll_to_top_button";
import ActivityFormComponent, { type ActivityFormData } from "./activity_form";
import CountdownComponent from "./countdown";
import TimeSummaryComponent from "./time_summary";
import WorkingDaysComponent from "./working_days";

export default function LogPage() {
  const [logActivity] = useLogActivity();
  const [recentActivities, queryRecentActivities] = useRecentActivities();

  const countdown = {
    remaining: "PT18M36S",
    percentage: 38,
  };

  async function handleSubmitActivity(formData: ActivityFormData) {
    console.log("Submitted activity:", formData);
    // TODO get current timestamp from countdown
    // TODO get duration from countdown
    // TODO check status
    logActivity(
      new LogActivityCommand(
        Temporal.Now.instant(),
        Temporal.Duration.from("PT30M"),
        formData.client,
        formData.project,
        formData.task,
        formData.notes,
      ),
    );

    queryRecentActivities({});
  }

  return (
    <>
      <ScrollToTopButton />
      <aside className="container my-4">
        <ActivityFormComponent
          {...recentActivities.lastActivity}
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
        <WorkingDaysComponent workingDays={recentActivities.workingDays} />
      </main>
      <footer className="fixed-bottom bg-body-secondary">
        <div className="container">
          <TimeSummaryComponent {...recentActivities.timeSummary} />
        </div>
      </footer>
    </>
  );
}
