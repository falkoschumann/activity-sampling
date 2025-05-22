// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export interface User {
  name: string;
  roles: string[];
}

export const TEST_USER: User = {
  name: "John Doe",
  roles: ["admin"],
};
