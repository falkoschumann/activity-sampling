// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useMsal } from "@azure/msal-react";

// FIXME Logout does not clean up session storage
//  see https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/5807#issuecomment-1478850501

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
