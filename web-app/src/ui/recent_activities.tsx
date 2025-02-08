// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useSelector } from "react-redux";

import { selectWorkingDays } from "../application/activities_slice.ts";

export default function RecentActivities() {
  const workingDays = useSelector(selectWorkingDays);

  return workingDays.map((workingDay) => (
    <div key={new Date(workingDay.date).toISOString()}>
      <h6 className="bg-body-tertiary p-2 sticky-top">
        {new Date(workingDay.date).toLocaleDateString(undefined, { dateStyle: "full" })}
      </h6>
      <div className="list-group list-group-flush">
        {workingDay.activities.map((activity) => (
          <button
            key={new Date(activity.timestamp).toISOString()}
            className="list-group-item list-group-item-action d-flex justify-content-start align-items-start"
          >
            <div style={{ width: "3em" }}>
              {new Date(activity.timestamp).toLocaleTimeString(undefined, { timeStyle: "short", hour12: false })}
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
