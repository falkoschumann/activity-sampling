// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import {
  type StatisticsQuery,
  StatisticsQueryResult,
} from "../../shared/domain/statistics_query";
import {
  StatisticsQueryDto,
  StatisticsQueryResultDto,
} from "../../shared/infrastructure/statistics_query_dto";

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
  const resultDto = await window.activitySampling.queryStatistics(
    StatisticsQueryDto.fromModel(query),
  );
  return StatisticsQueryResultDto.create(resultDto).validate();
}
