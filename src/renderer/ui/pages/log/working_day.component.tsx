// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { RecentActivity } from "../../../../shared/domain/value_objects/recent_activity.value_object";
import type { WorkingDay } from "../../../../shared/domain/value_objects/working_day.value_object";
import ActivityComponent from "./activity.component";
import { formatDate } from "../../components/formatter";

function WorkingDayComponent({
  workingDay,
  onSelectActivity,
}: {
  workingDay: WorkingDay;
  onSelectActivity: (activity: RecentActivity) => void;
}) {
  return (
    <div className="mt-4">
      <h6 className="m-0 p-2 sticky-top bg-body-tertiary">{formatDate(workingDay.date, { format: "full" })}</h6>
      <ul className="list-group list-group-flush">
        {workingDay.activities.map((activity) => (
          <ActivityComponent key={activity.time as string} activity={activity} onSelect={onSelectActivity} />
        ))}
      </ul>
    </div>
  );
}

export default WorkingDayComponent;
