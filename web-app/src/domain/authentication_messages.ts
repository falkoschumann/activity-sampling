// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { AccountInfo } from "./authentication";

export type AuthenticationQuery = object;

export type AuthenticationQueryResult =
  | {
      readonly isAuthenticated: false;
    }
  | {
      readonly isAuthenticated: true;
      readonly account: AccountInfo;
    };
