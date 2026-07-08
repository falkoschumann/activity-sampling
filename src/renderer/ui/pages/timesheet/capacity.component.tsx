// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { formatDuration } from "../../components/formatter";

function CapacityComponent({
  totalHours,
  capacity,
  offset,
}: {
  totalHours: Temporal.DurationLike;
  capacity: Temporal.DurationLike;
  offset: Temporal.DurationLike;
}) {
  const totalHoursInSeconds = Temporal.Duration.from(totalHours).total("seconds");
  const offsetInSeconds = Temporal.Duration.from(offset).total("seconds");
  const capacityInSeconds = Temporal.Duration.from(capacity).total("seconds");
  const progress = (totalHoursInSeconds / capacityInSeconds) * 100;
  const isBehind = offsetInSeconds < 0;
  const isAhead = offsetInSeconds > 0;
  const color = isAhead ? "bg-success" : isBehind ? "bg-warning" : "bg-primary";

  return (
    <div className="small text-secondary">
      <div className="d-flex justify-content-end gap-2">
        {isBehind && <div className="text-warning">{formatDuration(Temporal.Duration.from(offset).abs())} Behind</div>}
        {isAhead && <div className="text-success">{formatDuration(offset)} Ahead</div>}
        <div>
          {formatDuration(totalHours)} / {formatDuration(capacity)}
        </div>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label="Work in progress"
        aria-valuenow={totalHoursInSeconds}
        aria-valuemin={0}
        aria-valuemax={capacityInSeconds}
      >
        <div className={`progress-bar ${color}`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

export default CapacityComponent;
