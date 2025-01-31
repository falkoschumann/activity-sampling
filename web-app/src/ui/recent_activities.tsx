// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { WorkingDay } from "../domain/model";

interface RecentActivitiesProps {
  workingDays: WorkingDay[];
}

export default function RecentActivities({ workingDays }: RecentActivitiesProps) {
  return workingDays.map((workingDay) => (
    <div key={workingDay.date.toISOString()}>
      <h6 className="bg-body-tertiary p-2 sticky-top">
        {workingDay.date.toLocaleDateString(undefined, { dateStyle: "full" })}
      </h6>
      <div className="list-group list-group-flush">
        {workingDay.activities.map((activity) => (
          <button
            key={activity.timestamp.toISOString()}
            className="list-group-item list-group-item-action d-flex justify-content-start align-items-start"
          >
            <div style={{ width: "3em" }}>
              {activity.timestamp.toLocaleTimeString(undefined, { timeStyle: "short", hour12: false })}
            </div>
            <div>
              <div className="ms-2 me-auto">
                <div>
                  {activity.project} ({activity.client}) {activity.task}
                </div>
                {activity.notes && <small className="text-body-tertiary">{activity.notes}</small>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  ));
}
