// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { formatDate, formatDuration } from "../../../../shared/common/temporal";
import type { TimesheetEntry } from "../../../../shared/domain/activities";

export default function TimesheetComponent({ entries }: { entries: TimesheetEntry[] }) {
  return (
    <table className="table">
      <thead className="sticky-top" style={{ top: "2.9375rem" }}>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Client</th>
          <th scope="col">Project</th>
          <th scope="col">Task</th>
          <th scope="col">Hours</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr key={index}>
            <td>{formatDate(entry.date)}</td>
            <td className="text-nowrap">{entry.client}</td>
            <td className="text-nowrap">{entry.project}</td>
            <td>
              {entry.task}
              <button
                type="button"
                className="btn btn-sm"
                title="Copy task name."
                onClick={() => navigator.clipboard.writeText(entry.task)}
              >
                <i className="bi bi-copy"></i>
              </button>
            </td>
            <td>{formatDuration(entry.hours)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
