// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export type FluxStandardAction<T extends string = string, P = unknown> = {
  type: T;
  payload: P;
  error?: boolean;
};
