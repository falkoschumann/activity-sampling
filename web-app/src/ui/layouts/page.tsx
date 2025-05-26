// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as React from "react";

import AuthenticatedTemplate from "../components/authenticated_template";
import Profile from "../components/profile";
import SignInButton from "../components/sign_in_button";
import SignOutButton from "../components/sign_out_button";
import UnauthenticatedTemplate from "../components/unauthenticated_template";

export default function PageLayout({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <header className="sticky-top">
        <nav className="navbar bg-primary navbar-dark">
          <div className="container-fluid">
            <a className="navbar-brand" href="/public">
              Activity Sampling
            </a>
            <div className="justify-content-end d-flex align-items-md-baseline">
              <AuthenticatedTemplate>
                <Profile className="me-2" /> <SignOutButton />
              </AuthenticatedTemplate>
              <UnauthenticatedTemplate>
                <SignInButton />
              </UnauthenticatedTemplate>
            </div>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}
