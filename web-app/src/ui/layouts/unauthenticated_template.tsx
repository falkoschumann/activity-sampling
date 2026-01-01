// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import * as React from "react";
import { useSelector } from "react-redux";

import { selectAuthentication } from "../../application/authentication_slice";

export default function UnauthenticatedTemplate({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated } = useSelector(selectAuthentication);

  return isAuthenticated ? null : <>{children}</>;
}
