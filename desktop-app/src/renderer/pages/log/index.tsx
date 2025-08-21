// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import {
  createRecentActivitiesQueryResult,
  type RecentActivitiesQueryResult,
} from "../../../main/domain/activities";
import ActivityFormComponent from "./activity_form";
import CountdownComponent from "./countdown";
import WorkingDaysComponent from "./working_days";
import TimeSummaryComponent from "./time_summary";

export default function LogPage() {
  // TODO add scroll to top button

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
    /*
    setRecentActivities({
      lastActivity: {
        dateTime: "2025-08-21T09:20+02:00",
        duration: "PT30M",
        client: "Test client",
        project: "Test project",
        task: "Test task",
      },
      workingDays: [
        {
          date: "2025-08-21",
          activities: [
            {
              dateTime: "2025-08-21T09:20+02:00",
              duration: "PT30M",
              client: "Test client",
              project: "Test project",
              task: "Test task",
            },
            {
              dateTime: "2025-08-21T08:50+02:00",
              duration: "PT30M",
              client: "Test client",
              project: "Test project",
              task: "Test task",
              notes: "Test notes",
            },
          ],
        },
      ],
      timeSummary: {
        hoursToday: "PT1H",
        hoursYesterday: "PT0S",
        hoursThisWeek: "PT1H",
        hoursThisMonth: "PT1H",
      },
    });
    */
  }, []);

  return (
    <>
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
