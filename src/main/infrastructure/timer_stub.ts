// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export const timerStub = {
  setInterval: () => 0,
  clearInterval: () => {},
};

export class TimeoutStub implements NodeJS.Timeout {
  static #lastId = 0;

  #id;

  constructor() {
    this.#id = TimeoutStub.#lastId++;
  }

  close(): this {
    return this;
  }

  hasRef(): boolean {
    return false;
  }

  ref(): this {
    return this;
  }

  refresh(): this {
    return this;
  }

  unref(): this {
    return this;
  }

  _onTimeout(..._args: unknown[]) {}

  [Symbol.toPrimitive](): number {
    return this.#id;
  }

  [Symbol.dispose]() {}
}
