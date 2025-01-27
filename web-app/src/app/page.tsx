import Countdown from "@/components/countdown";
import CurrentActivity from "@/components/current_activity";
import RecentActivities from "@/components/recent_activities";
import TimeSummary from "@/components/time_summary";

export default function Home() {
  return (
    <>
      <aside className="container-fluid fixed-top py-2 bg-body">
        <CurrentActivity />
        <Countdown />
      </aside>
      <main className="container-fluid flex-shrink-0" style={{ marginTop: "400px" }}>
        <RecentActivities />
      </main>
      <footer className="container-fluid fixed-bottom py-3 bg-body">
        <TimeSummary />
      </footer>
    </>
  );
}
