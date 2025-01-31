// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useRecentActivities } from "../application/activities_services";
import Countdown from "./countdown";
import CurrentActivity from "./current_activity";
import RecentActivities from "./recent_activities";
import TimeSummary from "./time_summary";

export default function App() {
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
