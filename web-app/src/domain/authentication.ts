// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export type AuthenticationQuery = object;

export type AuthenticationQueryResult =
  | {
      readonly isAuthenticated: false;
    }
  | {
      readonly isAuthenticated: true;
      readonly account: AccountInfo;
    };

export interface AccountInfo {
  username: string;
  name?: string;
  roles: string[];
}

export function createTestAccountInfo(
  info: Partial<AccountInfo> = {},
): AccountInfo {
  return {
    username: "user",
    roles: ["USER"],
    ...info,
  };
}
