// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as React from "react";

import { useIsAuthenticated } from "./hooks";

export default function UnauthenticatedTemplate({ children }: { children?: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();

  return isAuthenticated ? null : <>{children}</>;
}
