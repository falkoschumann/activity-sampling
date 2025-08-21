// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { formatDuration, FormatStyle } from "../../../main/common/temporal";

export default function CountdownComponent({
  remaining,
  percentage,
}: {
  remaining: string;
  percentage: number;
}) {
  return (
    <div className="my-4">
      <div
        className="progress"
        role="progressbar"
        aria-label="Interval progress"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="text-center">
        {formatDuration(remaining, FormatStyle.FULL)}
      </div>
    </div>
  );
}
