// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useSelector } from "react-redux";

import { selectAuthentication } from "../../application/authentication_slice";

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useSelector(selectAuthentication);
  return isAuthenticated;
}
