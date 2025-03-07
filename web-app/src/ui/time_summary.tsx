// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useSelector } from "react-redux";

import { selectTimeSummary } from "../application/activities_slice";
import { Duration } from "../domain/duration";

export default function TimeSummary() {
  const { hoursToday, hoursYesterday, hoursThisWeek, hoursThisMonth } = useSelector(selectTimeSummary);

  return (
    <div>
      <div className="d-flex justify-content-center flex-wrap text-center">
        <div className="flex-fill">
          <div>Hours Today</div>
          <div className="fs-5">{Duration.parse(hoursToday).toLocaleString()}</div>
        </div>
        <div className="flex-fill">
          <div>Hours Yesterday</div>
          <div className="fs-5">{Duration.parse(hoursYesterday).toLocaleString()}</div>
        </div>
        <div className="flex-fill">
          <div>Hours this Week</div>
          <div className="fs-5">{Duration.parse(hoursThisWeek).toLocaleString()}</div>
        </div>
        <div className="flex-fill">
          <div>Hours this Month</div>
          <div className="fs-5">{Duration.parse(hoursThisMonth).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
