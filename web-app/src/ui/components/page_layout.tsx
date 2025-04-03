// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useIsAuthenticated } from "@azure/msal-react";
import * as React from "react";

import Profile from "./profile";
import { SignInButton } from "./sign_in_button";
import { SignOutButton } from "./sign_out_button";

export default function PageLayout({ children }: { children?: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();

  return (
    <>
      <header className="sticky-top">
        <nav className="navbar bg-primary navbar-dark">
          <div className="container-fluid">
            <a className="navbar-brand" href="/">
              Activity Sampling
            </a>
            <div className="justify-content-end d-flex align-items-md-baseline">
              {isAuthenticated ? (
                <>
                  <Profile /> <SignOutButton />
                </>
              ) : (
                <SignInButton />
              )}
            </div>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}
