// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { ReportEntry, ReportScope, type ReportScopeType } from "../../../../shared/domain/activities";
import { formatDate, formatDuration } from "../../../../shared/common/temporal";

export default function TimeReportComponent({ scope, entries }: { scope: ReportScopeType; entries: ReportEntry[] }) {
  return (
    <table className="table">
      <thead className="sticky-top" style={{ top: "5.875rem" }}>
        <tr>
          <th scope="col">Start</th>
          <th scope="col">Finish</th>
          {scope === ReportScope.CLIENTS && <th scope="col">Client</th>}
          {scope === ReportScope.PROJECTS && (
            <>
              <th scope="col">Project</th>
              <th scope="col">Client</th>
            </>
          )}
          {scope === ReportScope.TASKS && (
            <>
              <th scope="col">Task</th>
              <th scope="col">Project</th>
              <th scope="col">Client</th>
              <th scope="col">Category</th>
            </>
          )}
          {scope === ReportScope.CATEGORIES && <th scope="col">Category</th>}
          <th scope="col">Hours</th>
          <th scope="col">Cycle Time</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr key={index}>
            <td className="text-nowrap">{formatDate(entry.start)}</td>
            <td className="text-nowrap">{formatDate(entry.finish)}</td>
            {scope === ReportScope.CLIENTS && <td className="text-nowrap">{entry.client}</td>}
            {scope === ReportScope.PROJECTS && (
              <>
                {" "}
                <td className="text-nowrap">{entry.project}</td>
                <td>{entry.client}</td>
              </>
            )}
            {scope === ReportScope.TASKS && (
              <>
                <td>{entry.task}</td>
                <td className="text-nowrap">{entry.project}</td>
                <td className="text-nowrap">{entry.client}</td>
                <td>{entry.category}</td>
              </>
            )}
            {scope === ReportScope.CATEGORIES && <td className="text-nowrap">{entry.category}</td>}
            <td>{formatDuration(entry.hours)}</td>
            <td className="text-nowrap">{entry.cycleTime} days</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
