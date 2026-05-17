// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import { StatisticsQuery, StatisticsQueryResult, StatisticsScope } from "../../../../shared/domain/statistics_query";
import CategoryComponent from "../../components/category";
import { useMessageHandler } from "../../components/message_handler_context";
import TotalCountComponent from "../../components/total_count_component";
import HistogramComponent from "./histogram";
import MedianComponent from "./median";
import ScopeComponent from "./scope";

export default function StatisticsPage() {
  const [scope, setScope] = useState<StatisticsScope>(StatisticsScope.WORKING_HOURS);
  const [categories, setCategories] = useState<string[]>([]);
  const [result, setResult] = useState(StatisticsQueryResult.create());
  const messageHandler = useMessageHandler();

  useEffect(() => {
    (async function () {
      const result = await messageHandler.queryStatistics(
        StatisticsQuery.create({
          categories,
          scope,
        }),
      );
      setResult(result);
    })();
  }, [categories, scope, messageHandler]);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <div className="container">
          <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with query parameters">
            <ScopeComponent value={scope} onChange={(scope) => setScope(scope)} />
            <CategoryComponent
              categories={result.categories}
              value={categories}
              onChange={(categories) => setCategories(categories)}
            />
          </div>
        </div>
      </aside>
      <main className="container my-4" style={{ paddingTop: "3rem" }}>
        <HistogramComponent histogram={result.histogram} />
        <TotalCountComponent totalCount={result.totalCount} />
        <MedianComponent median={result.median} />
      </main>
    </>
  );
}
