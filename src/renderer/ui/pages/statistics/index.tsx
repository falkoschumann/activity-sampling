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
import {
  createGetCategoriesQuery,
  createGetCategoriesQueryResult,
  type GetCategoriesQueryResult,
} from "../../../../shared/domain/read_models/get_categories.query";

export default function StatisticsPage() {
  const [scope, setScope] = useState<StatisticsScope>(StatisticsScope.WORKING_HOURS);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [categories, setCategories] = useState(createGetCategoriesQueryResult());
  const [statistics, setStatistics] = useState(createGetStatisticsQueryResult());

  useEffect(() => {
    const getCategoriesAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetCategoriesQueryResult>(createGetCategoriesQuery());
      setCategories(result);
    };

    const getStatisticsAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetStatisticsQueryResult>(
        createGetStatisticsQuery({ scope, categories: categoryFilter }),
      );
      setStatistics(result);
    };

    void getCategoriesAsync();
    void getStatisticsAsync();
  }, [categoryFilter, scope]);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <div className="container">
          <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with query parameters">
            <ScopeComponent value={scope} onChange={(scope) => setScope(scope)} />
            <CategoryComponent
              categories={categories.categories}
              value={categoryFilter}
              onChange={(categories) => setCategoryFilter(categories)}
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
