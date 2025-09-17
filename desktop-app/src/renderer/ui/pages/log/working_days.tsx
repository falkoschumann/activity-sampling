// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { FormatStyle, formatTime } from "../../../../shared/common/temporal";
import type {
  Activity,
  WorkingDay,
} from "../../../../shared/domain/activities";

export interface ActivityTemplate {
  client: string;
  project: string;
  task: string;
  notes?: string;
}

export default function WorkingDaysComponent({
  workingDays,
  onSelect,
}: {
  workingDays: WorkingDay[];
  onSelect: (activity: ActivityTemplate) => void;
}) {
  return workingDays.map((workingDay) => (
    <WorkingDayComponent
      key={workingDay.date.toString()}
      {...workingDay}
      onSelect={onSelect}
    />
  ));
}

function WorkingDayComponent({
  date,
  activities,
  onSelect,
}: {
  date: Temporal.PlainDate;
  activities: Activity[];
  onSelect: (activity: ActivityTemplate) => void;
}) {
  return (
    <div className="mt-4">
      <h6 className="m-0 p-2 sticky-top bg-body-tertiary">
        {date.toLocaleString(undefined, {
          dateStyle: "full",
        })}
      </h6>
      <ul className="list-group list-group-flush">
        {activities.map((activity) => (
          <ActivityComponent
            key={activity.dateTime.toString()}
            {...activity}
            onSelect={onSelect}
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
  onSelect,
}: {
  dateTime: Temporal.PlainDateTime;
  client: string;
  project: string;
  task: string;
  notes?: string;
  onSelect: (activity: ActivityTemplate) => void;
}) {
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
              onClick={() => onSelect({ client, project, task, notes })}
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
