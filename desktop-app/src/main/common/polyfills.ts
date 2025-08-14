// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export async function arrayFromAsync<T>(
  items: AsyncIterableIterator<T>,
): Promise<T[]> {
  const result: T[] = [];
  for await (const element of items) {
    result.push(element);
  }
  return result;
}
