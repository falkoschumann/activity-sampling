// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import ActivityFormComponent from "./activity_form";
import CountdownComponent from "./countdown";
import RecentActivitiesComponent from "./recent_activities";
import TimeSummaryComponent from "./time_summary";

export default function LogPage() {
  // TODO add scroll to top button

  const lastActivity = {
    client: "Test client",
    project: "Test project",
    task: "Test task",
  };

  const countdown = {
    remaining: "PT18M36S",
    percentage: 38,
  };

  const workingDays = [
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
  ];

  const timeSummary = {
    hoursToday: "PT1H",
    hoursYesterday: "PT0S",
    hoursThisWeek: "PT1H",
    hoursThisMonth: "PT1H",
  };

  return (
    <>
      <aside className="container my-4">
        <ActivityFormComponent {...lastActivity} />
        <CountdownComponent {...countdown} />
      </aside>
      <main className="container my-4">
        <h5>
          Logged activities of the last 30 days
          <button className="btn" title="Refresh logged activities.">
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </h5>
        <RecentActivitiesComponent workingDays={workingDays} />
      </main>
      <footer className="fixed-bottom bg-body-secondary">
        <div className="container">
          <TimeSummaryComponent {...timeSummary} />
        </div>
      </footer>
    </>
  );
}
