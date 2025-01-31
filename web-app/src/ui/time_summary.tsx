// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Duration } from "../domain/duration";

interface TimeSummaryProps {
  hoursToday: Duration;
  hoursYesterday: Duration;
  hoursThisWeek: Duration;
  hoursThisMonth: Duration;
}

export default function TimeSummary({ hoursToday, hoursYesterday, hoursThisWeek, hoursThisMonth }: TimeSummaryProps) {
  return (
    <div>
      <div className="d-flex justify-content-center flex-wrap text-center">
        <div className="flex-fill">
          <div>Hours Today</div>
          <div className="fs-5">{hoursToday.toLocaleString()}</div>
        </div>
        <div className="flex-fill">
          <div>Hours Yesterday</div>
          <div className="fs-5">{hoursYesterday.toLocaleString()}</div>
        </div>
        <div className="flex-fill">
          <div>Hours this Week</div>
          <div className="fs-5">{hoursThisWeek.toLocaleString()}</div>
        </div>
        <div className="flex-fill">
          <div>Hours this Month</div>
          <div className="fs-5">{hoursThisMonth.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
