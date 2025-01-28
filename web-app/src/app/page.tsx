// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Countdown from "@/components/countdown";
import CurrentActivity from "@/components/current_activity";
import RecentActivities from "@/components/recent_activities";
import TimeSummary from "@/components/time_summary";
import { ActivitiesApi } from "@/lib/activities_api";

const activitiesApi = new ActivitiesApi();

export default async function Home() {
  const recentActivities = await activitiesApi.queryRecentActivities();
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
