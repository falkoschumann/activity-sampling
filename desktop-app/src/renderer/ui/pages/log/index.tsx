// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useLog } from "../../../application/activities_service";
import ScrollToTopButton from "../../components/scroll_to_top_button";
import ActivityFormComponent from "./activity_form";
import CountdownComponent from "./countdown";
import TimeSummaryComponent from "./time_summary";
import WorkingDaysComponent from "./working_days";
import { useCurrentInterval } from "../../../application/timer_service";

export default function LogPage() {
  const {
    state,
    dispatch,
    recentActivities,
    handleTextChange,
    handleSubmitActivity,
    handleQueryRecentActivities,
    handleActivitySelected,
  } = useLog();
  useCurrentInterval(dispatch);

  return (
    <>
      <ScrollToTopButton />
      <aside className="container my-4">
        <ActivityFormComponent
          {...state.form}
          onTextChange={handleTextChange}
          onSubmit={handleSubmitActivity}
        />
        <CountdownComponent {...state.countdown} />
      </aside>
      <main className="container my-4">
        <h5>
          Logged activities of the last 30 days
          <button
            className="btn"
            title="Refresh logged activities."
            onClick={() => handleQueryRecentActivities()}
          >
            <span className="visually-hidden">Refresh logged activities.</span>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </h5>
        <WorkingDaysComponent
          workingDays={recentActivities.workingDays}
          onSelect={handleActivitySelected}
        />
      </main>
      <footer className="fixed-bottom bg-body-secondary">
        <div className="container">
          <TimeSummaryComponent {...recentActivities.timeSummary} />
        </div>
      </footer>
    </>
  );
}
