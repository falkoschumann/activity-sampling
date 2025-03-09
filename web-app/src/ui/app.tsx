// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getRecentActivities, selectErrorMessage } from "../application/activities_slice";
import { AppDispatch } from "../application/store";
import Countdown from "./countdown";
import CurrentActivity from "./current_activity";
import RecentActivities from "./recent_activities";
import TimeSummary from "./time_summary";

export default function App() {
  const errorMessage = useSelector(selectErrorMessage);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getRecentActivities({}));
  }, [dispatch]);

  return (
    <>
      <aside className="container fixed-top py-2 bg-body">
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            <h4>Sorry, an unexpected error occurred</h4>
            <p>{errorMessage}</p>
            <p className="mb-0">Please try again later or inform your administrator.</p>
          </div>
        )}
        <CurrentActivity />
        <Countdown />
      </aside>
      <main className="container flex-shrink-0" style={{ paddingTop: "290px", paddingBottom: "90px" }}>
        <RecentActivities />
      </main>
      <footer className="container fixed-bottom py-3 bg-body">
        <TimeSummary />
      </footer>
    </>
  );
}
