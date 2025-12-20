// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export async function* createAsyncGenerator<T>(array: T[]) {
  for (const element of array) {
    yield element;
  }
}
