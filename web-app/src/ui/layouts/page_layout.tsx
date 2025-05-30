// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as React from "react";
import { useSelector } from "react-redux";

import { selectAuthentication } from "../../application/authentication_slice";
import AuthenticatedTemplate from "../components/authenticated_template";
import UnauthenticatedTemplate from "../components/unauthenticated_template";

export default function PageLayout({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <header className="fixed-top">
        <nav className="navbar navbar-dark bg-primary">
          <div className="container">
            <a className="navbar-brand" href="/">
              Activity Sampling
            </a>
            <div className="d-flex gap-2">
              <AuthenticatedTemplate>
                <Profile />
                <a className="btn btn-outline-light" href="/logout">
                  Sign out
                </a>
              </AuthenticatedTemplate>
              <UnauthenticatedTemplate>
                <a className="btn btn-outline-light" href="/login">
                  Sign in
                </a>
              </UnauthenticatedTemplate>
            </div>
          </div>
        </nav>
      </header>
      {children}
    </>
  );
}

function Profile() {
  const { account } = useSelector(selectAuthentication);

  if (!account) {
    return null;
  }

  return (
    <div className="navbar-text">
      {account.name ? `${account.name} <${account.username}>` : `${account.username} as ${account.roles}`}
    </div>
  );
}
