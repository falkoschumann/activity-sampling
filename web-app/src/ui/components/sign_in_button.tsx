// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useMsal } from "@azure/msal-react";

export function SignInButton() {
  const { instance } = useMsal();

  async function handleLogin() {
    await instance.loginRedirect();
  }

  return (
    <button className="btn btn-primary" onClick={handleLogin}>
      Sign in
    </button>
  );
}
