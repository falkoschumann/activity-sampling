// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import {
  BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";

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
  let json = JSON.stringify(query);
  json = await window.activitySampling.queryBurnUp(json);
  const dto = JSON.parse(json);
  return BurnUpQueryResult.create(dto);
}
