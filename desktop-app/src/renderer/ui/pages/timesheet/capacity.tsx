// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { formatDuration } from "../../../../shared/common/temporal";

export default function CapacityComponent({
  totalHours,
  capacity,
  offset,
}: {
  totalHours: Temporal.Duration;
  capacity: Temporal.Duration;
  offset: Temporal.Duration;
}) {
  const totalHoursInSeconds = totalHours.total("seconds");
  const offsetInSeconds = offset.total("seconds");
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
