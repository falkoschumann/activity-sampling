// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useState } from "react";

import { useEstimate } from "../../../application/activities_service";
import { EstimateQuery } from "../../../../shared/domain/activities";
import CategoryComponent from "../../components/category";
import CycleTimesChart from "./cycle_times_chart";
import CycleTimesTable from "./cycle_times_table";

export default function EstimatePage() {
  const [query, setQuery] = useState<EstimateQuery>({});
  const estimate = useEstimate(query);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <div className="container">
          <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with query parameters">
            <CategoryComponent value={query.category} onChange={(category) => setQuery({ ...query, category })} />
          </div>
        </div>
      </aside>
      <main className="container my-4" style={{ paddingTop: "3rem" }}>
        <h2>Cycle Time</h2>
        <CycleTimesChart cycleTimes={estimate.cycleTimes} />
        <CycleTimesTable cycleTimes={estimate.cycleTimes} />
      </main>
    </>
  );
}
