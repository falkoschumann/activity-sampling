// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { formatDuration } from "../../components/formatter";

function TotalHoursComponent({ totalHours }: { totalHours: Temporal.DurationLike }) {
  return (
    <div className="text-end">
      <strong>Total hours:</strong> {formatDuration(totalHours)}
    </div>
  );
}

export default TotalHoursComponent;
