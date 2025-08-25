// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import {
  createRecentActivitiesQueryResult,
  type RecentActivitiesQueryResult,
} from "../../../main/domain/activities";
import ScrollToTopButton from "../../components/scroll_to_top_button";
import ActivityFormComponent from "./activity_form";
import CountdownComponent from "./countdown";
import WorkingDaysComponent from "./working_days";
import TimeSummaryComponent from "./time_summary";

export default function LogPage() {
  const [recentActivities, setRecentActivities] =
    useState<RecentActivitiesQueryResult>(createRecentActivitiesQueryResult());

  const countdown = {
    remaining: "PT18M36S",
    percentage: 38,
  };

  useEffect(() => {
    async function queryRecentActivities() {
      const result = await window.activitySampling.queryRecentActivities({});
      setRecentActivities(result);
    }

    void queryRecentActivities();
  }, []);

  return (
    <>
      <ScrollToTopButton />
      <aside className="container my-4">
        <ActivityFormComponent {...recentActivities.lastActivity} />
        <CountdownComponent {...countdown} />
      </aside>
      <main className="container my-4">
        <h5>
          Logged activities of the last 30 days
          <button className="btn" title="Refresh logged activities.">
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
