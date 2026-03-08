// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { memo } from "react";

import { FormatStyle, formatTime } from "../../../../shared/common/temporal";
import type { WorkingDay } from "../../../../shared/domain/recent_activities_query";
import type { ActivityLoggedEvent } from "../../../../shared/domain/activities";
import type { ActivityTemplate } from "../../../domain/log";

const MemoizedWorkingDaysComponent = memo(WorkingDaysComponent);

export default MemoizedWorkingDaysComponent;

function WorkingDaysComponent({
  workingDays,
  onSelect,
}: {
  workingDays: WorkingDay[];
  onSelect: (activity: ActivityTemplate) => void;
}) {
  return workingDays.map((workingDay) => (
    <WorkingDayComponent key={workingDay.date.toString()} {...workingDay} onSelect={onSelect} />
  ));
}

function WorkingDayComponent({
  date,
  activities,
  onSelect,
}: {
  date: Temporal.PlainDate;
  activities: ActivityLoggedEvent[];
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
          <ActivityComponent key={activity.dateTime.toString()} {...activity} onSelect={onSelect} />
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
  category,
  onSelect,
}: {
  dateTime: Temporal.PlainDateTime;
  client: string;
  project: string;
  task: string;
  notes?: string;
  category?: string;
  onSelect: (activity: ActivityTemplate) => void;
}) {
  return (
    <li className="list-group-item list-group-item-action py-1 d-flex justify-content-start align-items-start">
      <div className="text-center" style={{ width: "5em" }}>
        {formatTime(dateTime, FormatStyle.SHORT)}
      </div>
      <div>
        <div className="ms-2 me-auto">
          <div>
            {category && <span className="badge text-bg-secondary">{category}</span>} <strong>{project}</strong> (
            {client}) {task}
            <button
              className="btn btn-sm"
              title="Use this activity as current activity."
              onClick={() => onSelect({ client, project, task, notes, category })}
            >
              <span className="visually-hidden">Use this activity as current activity.</span>
              <i className="bi bi-arrow-repeat"></i>
            </button>
            <button className="btn btn-sm" title="Copy task name." onClick={() => navigator.clipboard.writeText(task)}>
              <span className="visually-hidden">Copy task name.</span>
              <i className="bi bi-copy"></i>
            </button>
          </div>
          {notes && <small className="text-body-tertiary">{notes}</small>}
        </div>
      </div>
    </li>
  );
}
