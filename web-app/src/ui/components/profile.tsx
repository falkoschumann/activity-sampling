// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useSelector } from "react-redux";

import { selectAuthentication } from "../../application/authentication_slice";

export default function Profile() {
  const { user } = useSelector(selectAuthentication);

  if (!user) {
    return null;
  }

  return (
    <div className="navbar-text">
      {user.name}
      {user.username ? <> &lt;{user.username}&gt;</> : null} as {user.roles}
    </div>
  );
}
