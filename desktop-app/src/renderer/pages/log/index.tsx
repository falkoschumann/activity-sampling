// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useState } from "react";
import {
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
} from "../../../main/application/activities_messages";

import { RecentActivitiesQueryResult } from "../../../main/domain/activities";
import ScrollToTopButton from "../../components/scroll_to_top_button";
import ActivityFormComponent, { type ActivityFormData } from "./activity_form";
import CountdownComponent from "./countdown";
import WorkingDaysComponent from "./working_days";
import TimeSummaryComponent from "./time_summary";

export default function LogPage() {
  const [recentActivities, setRecentActivities] =
    useState<RecentActivitiesQueryResult>(RecentActivitiesQueryResult.empty());

  const countdown = {
    remaining: "PT18M36S",
    percentage: 38,
  };

  async function handleSubmitActivity(formData: ActivityFormData) {
    console.log("Submitted activity:", formData);
    await window.activitySampling.logActivity(
      LogActivityCommandDto.from({
        timestamp: Temporal.Now.instant(),
        duration: Temporal.Duration.from("PT30M"),
        ...formData,
      }),
    );
    void queryRecentActivities();
  }

  async function queryRecentActivities() {
    const dto = await window.activitySampling.queryRecentActivities(
      new RecentActivitiesQueryDto(),
    );
    const result = RecentActivitiesQueryResultDto.create(dto).validate();
    setRecentActivities(result);
  }

  useEffect(() => {
    void queryRecentActivities();
  }, []);

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
            onClick={queryRecentActivities}
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
