// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { formatDuration } from "../../../../shared/common/temporal";

export default function TimeSummaryComponent({
  hoursToday,
  hoursYesterday,
  hoursThisWeek,
  hoursThisMonth,
}: {
  hoursToday: Temporal.DurationLike | string;
  hoursYesterday: Temporal.DurationLike | string;
  hoursThisWeek: Temporal.DurationLike | string;
  hoursThisMonth: Temporal.DurationLike | string;
}) {
  return (
    <div className="py-2 d-flex justify-content-center flex-wrap text-center">
      <div className="px-2 flex-fill">
        <div className="small">Hours Today</div>
        <div>{formatDuration(hoursToday)}</div>
      </div>
      <div className="px-2 flex-fill">
        <div className="small">Hours Yesterday</div>
        <div>{formatDuration(hoursYesterday)}</div>
      </div>
      <div className="px-2 flex-fill">
        <div className="small">Hours this Week</div>
        <div>{formatDuration(hoursThisWeek)}</div>
      </div>
      <div className="px-2 flex-fill">
        <div className="small">Hours this Month</div>
        <div>{formatDuration(hoursThisMonth)}</div>
      </div>
    </div>
  );
}
