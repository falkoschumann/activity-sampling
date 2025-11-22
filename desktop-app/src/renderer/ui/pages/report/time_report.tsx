// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { ReportEntry, Scope, type ScopeType } from "../../../../shared/domain/activities";
import { formatDate, formatDuration } from "../../../../shared/common/temporal";

export default function TimeReportComponent({ scope, entries }: { scope: ScopeType; entries: ReportEntry[] }) {
  return (
    <table className="table">
      <thead className="sticky-top" style={{ top: "5.875rem" }}>
        <tr>
          <th scope="col">Start</th>
          <th scope="col">Finish</th>
          {scope === Scope.CLIENTS && <th scope="col">Client</th>}
          {scope === Scope.PROJECTS && (
            <>
              <th scope="col">Project</th>
              <th scope="col">Client</th>
            </>
          )}
          {scope === Scope.TASKS && (
            <>
              <th scope="col">Task</th>
              <th scope="col">Project</th>
              <th scope="col">Client</th>
            </>
          )}
          {scope === Scope.CATEGORIES && <th scope="col">Category</th>}
          <th scope="col">Hours</th>
          <th scope="col">Cycle Time</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr key={index}>
            <td className="text-nowrap">{formatDate(entry.start)}</td>
            <td className="text-nowrap">{formatDate(entry.finish)}</td>
            {scope === Scope.CLIENTS && <td className="text-nowrap">{entry.client}</td>}
            {scope === Scope.PROJECTS && (
              <>
                {" "}
                <td className="text-nowrap">{entry.project}</td>
                <td className="text-nowrap">{entry.client}</td>
              </>
            )}
            {scope === Scope.TASKS && (
              <>
                <td>{entry.task}</td>
                <td className="text-nowrap">{entry.project}</td>
                <td className="text-nowrap">{entry.client}</td>
              </>
            )}
            {scope === Scope.CATEGORIES && (
              <td className="text-nowrap">{entry.category.length > 0 ? entry.category : "N/A"}</td>
            )}
            <td>{formatDuration(entry.hours)}</td>
            <td className="text-nowrap">{entry.cycleTime} days</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
