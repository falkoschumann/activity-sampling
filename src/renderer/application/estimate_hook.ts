// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import {
  type EstimateQuery,
  EstimateQueryResult,
} from "../../shared/domain/estimate_query";
import {
  EstimateQueryDto,
  EstimateQueryResultDto,
} from "../../shared/infrastructure/estimate_query_dto";

export function useEstimate(query: EstimateQuery): EstimateQueryResult {
  const [result, setResult] = useState(EstimateQueryResult.empty());

  useEffect(() => {
    (async function () {
      const result = await queryEstimate(query);
      setResult(result);
    })();
  }, [query]);

  return result;
}

async function queryEstimate(query: EstimateQuery) {
  const resultDto = await window.activitySampling.queryEstimate(
    EstimateQueryDto.fromModel(query),
  );
  return EstimateQueryResultDto.create(resultDto).validate();
}
