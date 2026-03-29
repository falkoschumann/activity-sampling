// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import {
  type StatisticsQuery,
  StatisticsQueryResult,
} from "../../shared/domain/statistics_query";

export function useStatistics(query: StatisticsQuery) {
  const [result, setResult] = useState(StatisticsQueryResult.create());

  useEffect(() => {
    (async function () {
      const result = await queryStatistics(query);
      setResult(result);
    })();
  }, [query]);

  return result;
}

async function queryStatistics(query: StatisticsQuery) {
  let json = JSON.stringify(query);
  json = await window.activitySampling.queryStatistics(json);
  const dto = JSON.parse(json);
  return StatisticsQueryResult.create(dto);
}
