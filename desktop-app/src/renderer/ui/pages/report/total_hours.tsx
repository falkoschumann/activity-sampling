// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { formatDuration } from "../../../../shared/common/temporal";

export default function TotalHoursComponent({ totalHours }: { totalHours: Temporal.Duration }) {
  return (
    <div className="text-end">
      <strong>Total hours:</strong> {formatDuration(totalHours)}
    </div>
  );
}
