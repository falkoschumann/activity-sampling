// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { RecentActivity } from "../../../../shared/domain/value_objects/recent_activity.value_object";
import { FormatStyle, formatTime } from "../../components/formatter";

function ActivityComponent({
  activity,
  onSelect,
}: {
  activity: RecentActivity;
  onSelect: (activity: RecentActivity) => void;
}) {
  return (
    <li className="list-group-item list-group-item-action py-1 d-flex justify-content-start align-items-start">
      <div className="text-center" style={{ width: "5em" }}>
        {formatTime(activity.time, { format: FormatStyle.SHORT })}
      </div>
      <div>
        <div className="ms-2 me-auto">
          <div>
            {activity.category && <span className="badge text-bg-secondary">{activity.category}</span>}{" "}
            <strong>{activity.project}</strong> ({activity.client}) {activity.task}
            <button
              className="btn btn-sm"
              title="Use this activity as current activity."
              onClick={() => onSelect(activity)}
            >
              <span className="visually-hidden">Use this activity as current activity.</span>
              <i className="bi bi-arrow-repeat"></i>
            </button>
            <button
              className="btn btn-sm"
              title="Copy task name."
              onClick={() => navigator.clipboard.writeText(activity.task)}
            >
              <span className="visually-hidden">Copy task name.</span>
              <i className="bi bi-copy"></i>
            </button>
          </div>
          {activity.notes && <small className="text-body-tertiary">{activity.notes}</small>}
        </div>
      </div>
    </li>
  );
}

export default ActivityComponent;
