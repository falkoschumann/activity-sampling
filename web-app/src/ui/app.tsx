// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { queryRecentActivities, selectError } from "../application/activities_slice";
import { AppDispatch } from "../application/store";
import Countdown from "./countdown";
import CurrentActivity from "./current_activity";
import Error from "./error.tsx";
import RecentActivities from "./recent_activities";
import TimeSummary from "./time_summary";

export default function App() {
  const error = useSelector(selectError);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(queryRecentActivities({}));
  }, [dispatch]);

  return (
    <>
      <aside className="container fixed-top py-2 bg-body">
        <Error {...error} />
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
