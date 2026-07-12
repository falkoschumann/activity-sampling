// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { memo } from "react";

import type { RecentActivity } from "../../../../shared/domain/value_objects/recent_activity.value_object";
import type { WorkingDay } from "../../../../shared/domain/value_objects/working_day.value_object";
import WorkingDayComponent from "./working_day.component";

function WorkingDaysComponent({
  workingDays,
  onSelectActivity,
}: {
  workingDays: WorkingDay[];
  onSelectActivity: (activity: RecentActivity) => void;
}) {
  return workingDays.map((workingDay) => (
    <WorkingDayComponent key={workingDay.date.toString()} workingDay={workingDay} onSelectActivity={onSelectActivity} />
  ));
}

export default memo(WorkingDaysComponent);
