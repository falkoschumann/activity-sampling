// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

"use client";

import { useEffect, useState } from "react";

import Countdown from "@/components/countdown";
import CurrentActivity from "@/components/current_activity";
import RecentActivities from "@/components/recent_activities";
import TimeSummary from "@/components/time_summary";
import { ActivitiesApi } from "@/lib/activities_api";
import { RecentActivitiesQueryResult } from "@/lib/domain";
import { Duration } from "@/lib/duration";

const activitiesApi = new ActivitiesApi();

export default function Home() {
  const [recentActivities, setRecentActivities] = useState<RecentActivitiesQueryResult>({
    workingDays: [],
    timeSummary: {
      hoursToday: Duration.ZERO,
      hoursYesterday: Duration.ZERO,
      hoursThisWeek: Duration.ZERO,
      hoursThisMonth: Duration.ZERO,
    },
  });

  useEffect(() => {
    console.log("query recent activities");
    let ignore = false;
    (async () => {
      const result = await activitiesApi.queryRecentActivities();
      if (!ignore) {
        setRecentActivities(result);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
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
