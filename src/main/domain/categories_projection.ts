// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ActivityLoggedEvent } from "./activity_logged_event";

export class CategoriesProjection {
  static create() {
    return new CategoriesProjection();
  }

  #categories: string[] = [];

  private constructor() {}

  update(event: ActivityLoggedEvent) {
    if (this.#categories.includes(event.category ?? "")) {
      return;
    }

    this.#categories.push(event.category ?? "");
  }

  get() {
    return this.#categories.sort();
  }
}
