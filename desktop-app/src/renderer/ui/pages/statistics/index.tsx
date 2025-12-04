// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useState } from "react";

import { useStatistics } from "../../../application/activities_service";
import { type StatisticsQuery, StatisticsScope } from "../../../../shared/domain/activities";
import CategoryComponent from "../../components/category";
import TotalCountComponent from "../../components/total_count_component";
import HistogramComponent from "./histogram";
import MedianComponent from "./median";
import ScopeComponent from "./scope";

export default function StatisticsPage() {
  const [query, setQuery] = useState<StatisticsQuery>({
    scope: StatisticsScope.WORKING_HOURS,
  });
  const statistics = useStatistics(query);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <div className="container">
          <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with query parameters">
            <ScopeComponent value={query.scope} onChange={(scope) => setQuery({ ...query, scope })} />
            <CategoryComponent
              categories={statistics.categories}
              value={query.category}
              onChange={(category) => setQuery({ ...query, category })}
            />
          </div>
        </div>
      </aside>
      <main className="container my-4" style={{ paddingTop: "3rem" }}>
        <HistogramComponent histogram={statistics.histogram} />
        <TotalCountComponent totalCount={statistics.totalCount} />
        <MedianComponent median={statistics.median} />
      </main>
    </>
  );
}
