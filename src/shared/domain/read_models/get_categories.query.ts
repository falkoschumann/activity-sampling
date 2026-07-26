// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ReportView } from "./report.read_model";

export interface GetCategoriesQuery {
  readonly type: "get-categories";
  readonly data: object;
}

export function createGetCategoriesQuery(): GetCategoriesQuery {
  return {
    type: "get-categories",
    data: {},
  };
}

export interface GetCategoriesQueryResult {
  readonly categories: string[];
}

export function createGetCategoriesQueryResult({
  categories = [],
}: {
  categories?: string[];
} = {}): GetCategoriesQueryResult {
  return { categories };
}

export function getCategories(
  view: ReportView,
  _query: GetCategoriesQuery,
): GetCategoriesQueryResult {
  return createGetCategoriesQueryResult({ categories: view.categories });
}
