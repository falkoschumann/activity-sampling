// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import {
  BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";
import {
  BurnUpQueryDto,
  BurnUpQueryResultDto,
} from "../../shared/infrastructure/burn_up_query_dto";

export function useBurnUp(query: BurnUpQuery) {
  const [result, setResult] = useState(BurnUpQueryResult.create());

  useEffect(() => {
    (async function () {
      const result = await queryBurnUp(query);
      setResult(result);
    })();
  }, [query]);

  return result;
}

async function queryBurnUp(query: BurnUpQuery) {
  const resultDto = await window.activitySampling.queryBurnUp(
    BurnUpQueryDto.fromModel(query),
  );
  return BurnUpQueryResultDto.create(resultDto).validate();
}
