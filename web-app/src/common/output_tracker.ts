// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class OutputTracker<T> {
  static create<T>(eventTarget: EventTarget, event: string) {
    return new OutputTracker<T>(eventTarget, event);
  }

  readonly #eventTarget;
  readonly #event;
  readonly #data: T[];
  readonly #tracker;

  constructor(eventTarget: EventTarget, event: string) {
    this.#eventTarget = eventTarget;
    this.#event = event;
    this.#data = [];
    this.#tracker = (event: Event) =>
      this.#data.push((event as CustomEvent<T>).detail);

    this.#eventTarget.addEventListener(this.#event, this.#tracker);
  }

  get data(): T[] {
    return this.#data;
  }

  clear(): T[] {
    const result = [...this.#data];
    this.#data.length = 0;
    return result;
  }

  stop() {
    this.#eventTarget.removeEventListener(this.#event, this.#tracker);
  }
}
