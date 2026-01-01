// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class ConfigurableResponses<T> {
  static create<T>(responses?: T | T[], name?: string) {
    return new ConfigurableResponses<T>(responses, name);
  }

  readonly #description;
  readonly #responses;

  constructor(responses?: T | T[], name?: string) {
    this.#description = name == null ? "" : ` in ${name}`;
    this.#responses = Array.isArray(responses) ? [...responses] : responses;
  }

  next(): T {
    const response = Array.isArray(this.#responses)
      ? this.#responses.shift()
      : this.#responses;
    if (response === undefined) {
      throw new Error(`No more responses configured${this.#description}.`);
    }

    return response;
  }
}
