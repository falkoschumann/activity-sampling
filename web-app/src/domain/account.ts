// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export interface AccountInfo {
  username: string;
  name?: string;
  roles: string[];
}

export const TEST_ACCOUNT: AccountInfo = Object.freeze({
  username: "user",
  roles: ["USER"],
});
