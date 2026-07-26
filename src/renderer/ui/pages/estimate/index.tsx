// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import {
  createGetEstimateQuery,
  createGetEstimateQueryResult,
  type GetEstimateQueryResult,
} from "../../../../shared/domain/read_models/get_estimate.query";
import CategoryComponent from "../../components/category.component";
import TotalCountComponent from "../../components/total_count.component";
import CycleTimesChart from "./cycle_times_chart.component";
import CycleTimesTable from "./cycle_times_table.component";
import {
  createGetCategoriesQuery,
  createGetCategoriesQueryResult,
  type GetCategoriesQueryResult,
} from "../../../../shared/domain/read_models/get_categories.query";

export default function EstimatePage() {
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [categories, setCategories] = useState(createGetCategoriesQueryResult());
  const [estimate, setEstimate] = useState(createGetEstimateQueryResult());

  useEffect(() => {
    const getCategoriesAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetCategoriesQueryResult>(createGetCategoriesQuery());
      setCategories(result);
    };

    const getEstimateAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetEstimateQueryResult>(
        createGetEstimateQuery({ categories: categoryFilter }),
      );
      setEstimate(result);
    };

    void getCategoriesAsync();
    void getEstimateAsync();
  }, [categoryFilter]);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <div className="container">
          <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with query parameters">
            <div className="btn-group btn-group-sm" role="group" aria-label="Select category">
              <CategoryComponent
                categories={categories.categories}
                value={categoryFilter}
                onChange={(categories) => setCategoryFilter(categories)}
              />
            </div>
          </div>
        </div>
      </aside>
      <main className="container my-4" style={{ paddingTop: "3rem" }}>
        <h2>Cycle Time</h2>
        <CycleTimesChart cycleTimes={estimate.cycleTimes} />
        <TotalCountComponent totalCount={estimate.totalCount} />
        <CycleTimesTable cycleTimes={estimate.cycleTimes} />
      </main>
    </>
  );
}
