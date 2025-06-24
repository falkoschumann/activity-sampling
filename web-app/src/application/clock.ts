// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export class Clock {
  static create() {
    return new Clock(() => new Date());
  }

  static createNull(fixedDate: Date | string = new Date(0)) {
    return new Clock(() => new Date(fixedDate));
  }

  #now;

  private constructor(now: () => Date) {
    this.#now = now;
  }

  now(): Date {
    return this.#now();
  }

  setFixedDate(fixedDate: Date | string) {
    this.#now = () => new Date(fixedDate);
  }
}
