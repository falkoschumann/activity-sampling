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

export default function EstimatePage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [result, setResult] = useState(createGetEstimateQueryResult());

  useEffect(() => {
    const getEstimateAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetEstimateQueryResult>(
        createGetEstimateQuery({ categories }),
      );
      setResult(result);
    };

    void getEstimateAsync();
  }, [categories]);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <div className="container">
          <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with query parameters">
            <div className="btn-group btn-group-sm" role="group" aria-label="Select category">
              <CategoryComponent
                categories={result.categories}
                value={categories}
                onChange={(categories) => setCategories(categories)}
              />
            </div>
          </div>
        </div>
      </aside>
      <main className="container my-4" style={{ paddingTop: "3rem" }}>
        <h2>Cycle Time</h2>
        <CycleTimesChart cycleTimes={result.cycleTimes} />
        <TotalCountComponent totalCount={result.totalCount} />
        <CycleTimesTable cycleTimes={result.cycleTimes} />
      </main>
    </>
  );
}
