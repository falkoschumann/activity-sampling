// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useState } from "react";

import { useStatistics } from "../../../application/activities_service";
import HistogramComponent from "./histogram";
import MedianComponent from "./median";
import QueryParametersComponent from "./query_parameters";
import { Statistics, type StatisticsQuery } from "../../../../shared/domain/activities";

export default function StatisticsPage() {
  const [query, setQuery] = useState<StatisticsQuery>({
    statistics: Statistics.WORKING_HOURS,
  });
  const statistics = useStatistics(query);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <QueryParametersComponent onChange={setQuery} />
      </aside>
      <main className="container my-4" style={{ paddingTop: "3rem" }}>
        <HistogramComponent histogram={statistics.histogram} />
        <MedianComponent median={statistics.median} />
      </main>
    </>
  );
}
