// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { memo } from "react";

import { formatDuration } from "../../components/formatter";

function TimeSummaryComponent({
  today,
  yesterday,
  thisWeek,
  thisMonth,
}: {
  today: Temporal.DurationLike;
  yesterday: Temporal.DurationLike;
  thisWeek: Temporal.DurationLike;
  thisMonth: Temporal.DurationLike;
}) {
  return (
    <div className="py-2 d-flex justify-content-center flex-wrap text-center">
      <div className="px-2 flex-fill">
        <div className="small">Hours Today</div>
        <div>{formatDuration(today)}</div>
      </div>
      <div className="px-2 flex-fill">
        <div className="small">Hours Yesterday</div>
        <div>{formatDuration(yesterday)}</div>
      </div>
      <div className="px-2 flex-fill">
        <div className="small">Hours this Week</div>
        <div>{formatDuration(thisWeek)}</div>
      </div>
      <div className="px-2 flex-fill">
        <div className="small">Hours this Month</div>
        <div>{formatDuration(thisMonth)}</div>
      </div>
    </div>
  );
}

export default memo(TimeSummaryComponent);
