// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import {
  type EstimateQuery,
  EstimateQueryResult,
} from "../../shared/domain/estimate_query";

export function useEstimate(query: EstimateQuery): EstimateQueryResult {
  const [result, setResult] = useState(EstimateQueryResult.create());

  useEffect(() => {
    (async function () {
      const result = await queryEstimate(query);
      setResult(result);
    })();
  }, [query]);

  return result;
}

async function queryEstimate(query: EstimateQuery) {
  let json = JSON.stringify(query);
  json = await window.activitySampling.queryEstimate(json);
  const dto = JSON.parse(json);
  return EstimateQueryResult.create(dto);
}
