// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import {
  createGetStatisticsQuery,
  createGetStatisticsQueryResult,
  type GetStatisticsQueryResult,
  StatisticsScope,
} from "../../../../shared/domain/read_models/get_statistics.query";
import CategoryComponent from "../../components/category.component";
import TotalCountComponent from "../../components/total_count.component";
import HistogramComponent from "./histogram.component";
import MedianComponent from "./median.component";
import ScopeComponent from "./scope.component";

export default function StatisticsPage() {
  const [scope, setScope] = useState<StatisticsScope>(StatisticsScope.WORKING_HOURS);
  const [categories, setCategories] = useState<string[]>([]);
  const [result, setResult] = useState(createGetStatisticsQueryResult());

  useEffect(() => {
    (async function () {
      const result = await window.activitySampling.routeMessage<GetStatisticsQueryResult>(
        createGetStatisticsQuery({ categories, scope }),
      );
      setResult(result);
    })();
  }, [categories, scope]);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <div className="container">
          <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with query parameters">
            <ScopeComponent value={scope} onChange={(scope) => setScope(scope)} />
            <CategoryComponent
              categories={result.categories}
              value={categories}
              onChange={(categories) => setCategories(categories)}
            />
          </div>
        </div>
      </aside>
      <main className="container my-4" style={{ paddingTop: "3rem" }}>
        <HistogramComponent histogram={result.histogram} />
        <TotalCountComponent totalCount={result.totalCount} />
        <MedianComponent median={result.median} />
      </main>
    </>
  );
}
