// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { FormatStyle, formatTime } from "../../../main/common/temporal";
import type { Activity, WorkingDay } from "../../../main/domain/activities";

export default function WorkingDaysComponent({
  workingDays,
}: {
  workingDays: WorkingDay[];
}) {
  return workingDays.map((workingDay) => (
    <WorkingDayComponent
      key={Temporal.PlainDate.from(workingDay.date).toString()}
      {...workingDay}
    />
  ));
}

function WorkingDayComponent({
  date,
  activities,
}: {
  date: Temporal.PlainDateLike;
  activities: Activity[];
}) {
  return (
    <div className="mt-4">
      <h6 className="m-0 p-2 sticky-top bg-body-tertiary">
        {Temporal.PlainDate.from(date).toLocaleString(undefined, {
          dateStyle: "full",
        })}
      </h6>
      <ul className="list-group list-group-flush">
        {activities.map((activity) => (
          <ActivityComponent
            key={Temporal.PlainDateTime.from(activity.dateTime).toString()}
            {...activity}
          />
        ))}
      </ul>
    </div>
  );
}

function ActivityComponent({
  dateTime,
  client,
  project,
  task,
  notes,
}: {
  dateTime: Temporal.PlainDateTimeLike | string;
  client: string;
  project: string;
  task: string;
  notes?: string;
}) {
  // TODO do not break activity task

  return (
    <li className="list-group-item list-group-item-action py-1 d-flex justify-content-start align-items-start">
      <div style={{ width: "3em" }}>
        {formatTime(dateTime, FormatStyle.SHORT)}
      </div>
      <div>
        <div className="ms-2 me-auto">
          <div>
            <strong>{project}</strong> ({client}) {task}
            <button
              className="btn btn-sm"
              title="Use this activity as current activity."
            >
              <i className="bi bi-arrow-repeat"></i>
            </button>
            <button
              className="btn btn-sm"
              title="Copy task name."
              onClick={() => navigator.clipboard.writeText(task)}
            >
              <i className="bi bi-copy"></i>
            </button>
          </div>
          {notes && <small className="text-body-tertiary">{notes}</small>}
        </div>
      </div>
    </li>
  );
}
