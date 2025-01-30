// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

"use client";

import Countdown from "@/components/countdown";
import CurrentActivity from "@/components/current_activity";
import RecentActivities from "@/components/recent_activities";
import TimeSummary from "@/components/time_summary";
import { useRecentActivities } from "@/lib/activities_services";

export default function Home() {
  const recentActivities = useRecentActivities();

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
