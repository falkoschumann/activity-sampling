// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useState } from "react";

import { useStatistics } from "../../../application/activities_service";
import HistogramComponent from "./histogram";
import MedianComponent from "./median";

export default function StatisticsPage() {
  const [query] = useState({});
  const statistics = useStatistics(query);

  return (
    <main className="container my-4">
      <HistogramComponent histogram={statistics.histogram} />
      <MedianComponent median={statistics.median} />
    </main>
  );
}
