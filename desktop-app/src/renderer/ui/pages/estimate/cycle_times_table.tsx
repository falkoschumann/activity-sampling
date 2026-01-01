// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EstimateEntry } from "../../../../shared/domain/activities";

export default function CycleTimesTable({ cycleTimes }: { cycleTimes: EstimateEntry[] }) {
  return (
    <table className="table mt-3">
      <thead className="sticky-top">
        <tr>
          <th scope="row">Cycle Time</th>
          <th scope="row">Frequency</th>
          <th scope="row">Probability</th>
          <th scope="row">Cumulative</th>
        </tr>
      </thead>
      <tbody>
        {cycleTimes.map((item, index) => (
          <tr key={index} className={item.cumulativeProbability >= 0.85 ? "table-success" : "table-warning"}>
            <td>{item.cycleTime}</td>
            <td>{item.frequency}</td>
            <td>{Math.round(item.probability * 1000) / 10}&nbsp;%</td>
            <td>{Math.round(item.cumulativeProbability * 1000) / 10}&nbsp;%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
