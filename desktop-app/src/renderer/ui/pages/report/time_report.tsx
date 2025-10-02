// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { ReportEntry, Scope } from "../../../../shared/domain/activities";
import { formatDuration } from "../../../../shared/common/temporal";

export default function TimeReportComponent({
  scope,
  entries,
}: {
  scope: Scope;
  entries: ReportEntry[];
}) {
  return (
    <table className="table">
      <thead className="sticky-top" style={{ top: "5.875rem" }}>
        <tr>
          <th scope="col">Name</th>
          {scope === Scope.PROJECTS && <th scope="col">Client</th>}
          <th scope="col">Hours</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr key={index}>
            <td className="text-nowrap">{entry.name}</td>
            {scope === Scope.PROJECTS && <td>{entry.client}</td>}
            <td>{formatDuration(entry.hours)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
