// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { formatDuration, FormatStyle } from "../../components/formatter";

function CountdownComponent({ progress, remainingTime }: { progress: number; remainingTime: Temporal.DurationLike }) {
  return (
    <div className="my-4">
      <div
        className="progress"
        role="progressbar"
        aria-label="Interval progress"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="text-center" aria-label="Remaining time">
        {formatDuration(remainingTime, { format: FormatStyle.FULL })}
      </div>
    </div>
  );
}

export default CountdownComponent;
