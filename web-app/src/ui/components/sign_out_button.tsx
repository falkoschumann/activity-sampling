// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useMsal } from "@azure/msal-react";

export function SignOutButton() {
  const { instance } = useMsal();

  async function handleLogout() {
    await instance.logoutRedirect({
      postLogoutRedirectUri: "/",
    });
  }

  return (
    <button className="btn btn-primary" onClick={handleLogout}>
      Sign out
    </button>
  );
}
