// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Duration } from "@/lib/duration";
import { RecentActivitiesQueryResult } from "@/lib/domain";
import Countdown from "@/components/countdown";
import CurrentActivity from "@/components/current_activity";
import RecentActivities from "@/components/recent_activities";
import TimeSummary from "@/components/time_summary";

const recentActivities: RecentActivitiesQueryResult = {
  lastActivity: {
    timestamp: new Date("2025-01-17T09:30"),
    duration: Duration.ofMinutes(30),
    client: "ACME Inc.",
    project: "Foobar",
    task: "Do something",
  },
  workingDays: [
    {
      date: new Date("2025-01-17"),
      activities: [
        {
          timestamp: new Date("2025-01-17T09:30"),
          duration: Duration.ofMinutes(30),
          client: "ACME Inc.",
          project: "Foobar",
          task: "Do something",
        },
      ],
    },
    {
      date: new Date("2025-01-16"),
      activities: [
        {
          timestamp: new Date("2025-01-16T17:00"),
          duration: Duration.ofMinutes(30),
          client: "ACME Inc.",
          project: "Foobar",
          task: "Do something",
        },
        {
          timestamp: new Date("2025-01-16T16:30"),
          duration: Duration.ofMinutes(30),
          client: "ACME Inc.",
          project: "Foobar",
          task: "Do something",
        },
        {
          timestamp: new Date("2025-01-16T16:00"),
          duration: Duration.ofMinutes(30),
          client: "ACME Inc.",
          project: "Foobar",
          task: "Make things",
          notes: "This is a note",
        },
      ],
    },
  ],
  timeSummary: {
    hoursToday: Duration.parse("PT30M"),
    hoursYesterday: Duration.parse("PT1H30M"),
    hoursThisWeek: Duration.parse("PT2H"),
    hoursThisMonth: Duration.parse("PT2H"),
  },
};

export default function Home() {
  return (
    <>
      <p>{new Date().getTimezoneOffset()}</p>
      <aside className="container-fluid fixed-top py-2 bg-body">
        <CurrentActivity lastActivity={recentActivities.lastActivity} />
        <Countdown />
      </aside>
      <main className="container-fluid flex-shrink-0" style={{ marginTop: "400px" }}>
        <RecentActivities workingDays={recentActivities.workingDays} />
      </main>
      <footer className="container-fluid fixed-bottom py-3 bg-body">
        <TimeSummary {...recentActivities.timeSummary} />
      </footer>
    </>
  );
}
