// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class CategoriesChangedEvent {
  static create({ categories }: { categories: string[] }) {
    return new CategoriesChangedEvent(categories);
  }

  readonly categories: string[];

  private constructor(categories: string[]) {
    this.categories = categories;
  }
}
