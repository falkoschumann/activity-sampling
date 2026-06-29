// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class GetCategoriesQuery {
  static create() {
    return new GetCategoriesQuery();
  }

  readonly type = "get-categories";
  readonly data = null;

  private constructor() {}
}

export class GetCategoriesQueryResult {
  static create({
    categories = [],
  }: {
    categories?: string[];
  } = {}) {
    return new GetCategoriesQueryResult(categories);
  }

  static createTestInstance({
    categories = ["Feature"],
  }: {
    categories?: string[];
  } = {}) {
    return GetCategoriesQueryResult.create({
      categories,
    });
  }

  readonly categories;

  private constructor(categories: string[]) {
    this.categories = categories;
  }
}
