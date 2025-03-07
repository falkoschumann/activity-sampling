// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useDispatch, useSelector } from "react-redux";

import { lastActivitySelected, selectTimeZone, selectWorkingDays } from "../application/activities_slice";
import { AppDispatch } from "../application/store";
import { Activity } from "../domain/activities";

export default function RecentActivities() {
  const workingDays = useSelector(selectWorkingDays);
  const timeZone = useSelector(selectTimeZone);
  const dispatch = useDispatch<AppDispatch>();

  function handleClicked(activity: Activity) {
    dispatch(lastActivitySelected(activity));
  }

  return workingDays.map((workingDay) => (
    <div key={new Date(workingDay.date).toISOString()}>
      <h6 className="bg-body-tertiary p-1 m-0 mt-2 sticky-top small">
        {new Date(workingDay.date).toLocaleDateString(undefined, { dateStyle: "full", timeZone })}
      </h6>
      <div className="list-group list-group-flush">
        {workingDay.activities.map((activity) => (
          <button
            key={new Date(activity.start).toISOString()}
            onClick={() => handleClicked(activity)}
            className="list-group-item list-group-item-action py-1 d-flex justify-content-start align-items-start"
          >
            <div style={{ width: "3em" }}>
              {new Date(activity.start).toLocaleTimeString(undefined, {
                timeStyle: "short",
                hour12: false,
                timeZone,
              })}
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
