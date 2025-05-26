// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useSelector } from "react-redux";

import { selectAuthentication } from "../../application/authentication_slice";

export default function Profile({ className }: { className?: string }) {
  const { account } = useSelector(selectAuthentication);

  if (!account) {
    return null;
  }

  return (
    <div className={`navbar-text ${className}`}>
      {account.name ? `${account.name} <${account.username}>` : account.username} as {account.roles}
    </div>
  );
}
