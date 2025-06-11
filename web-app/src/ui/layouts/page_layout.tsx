// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";

import { selectAuthentication } from "../../application/authentication_slice";
import AuthenticatedTemplate from "../components/authenticated_template";
import UnauthenticatedTemplate from "../components/unauthenticated_template";

export default function PageLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div style={{ paddingTop: "3.5rem" }}>
      <header className="fixed-top">
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <a className="navbar-brand" href="/">
              Activity Sampling
            </a>
            <AuthenticatedTemplate>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/">
                      Log
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="nav-link" to="/timesheet">
                      Timesheet
                    </NavLink>
                  </li>
                </ul>
                <div className="d-flex gap-2">
                  <Profile />
                  <a className="btn btn-outline-light" href="/logout">
                    Sign out
                  </a>
                </div>
              </div>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
              <div className="d-flex gap-2">
                <a className="btn btn-outline-light" href="/login">
                  Sign in
                </a>
              </div>
            </UnauthenticatedTemplate>
          </div>
        </nav>
      </header>
      {children}
    </div>
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
