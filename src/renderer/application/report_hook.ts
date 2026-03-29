// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useState } from "react";

import {
  type ReportQuery,
  ReportQueryResult,
} from "../../shared/domain/report_query";

export function useReport(query: ReportQuery) {
  const [result, setResult] = useState(ReportQueryResult.create());

  useEffect(() => {
    (async function () {
      const result = await queryReport({
        scope: query.scope,
        from: query.from ? Temporal.PlainDate.from(query.from) : undefined,
        to: query.to ? Temporal.PlainDate.from(query.to) : undefined,
      });
      setResult(result);
    })();
  }, [query.scope, query.from, query.to]);

  return result;
}

async function queryReport(query: ReportQuery) {
  let json = JSON.stringify(query);
  json = await window.activitySampling.queryReport(json);
  const dto = JSON.parse(json);
  return ReportQueryResult.create(dto);
}
