// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useMsal } from "@azure/msal-react";

export default function Profile() {
  const { instance } = useMsal();

  const account = instance.getAllAccounts()[0];

  return (
    <div className="navbar-text">
      {account.name} &lt;{account.username}&gt; as {account.idTokenClaims?.roles}
    </div>
  );
}
