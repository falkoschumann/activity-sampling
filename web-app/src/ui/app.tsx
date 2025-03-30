// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";

import PageLayout from "./components/page_layout";
import { SignInButton } from "./components/sign_in_button";
import ActivitiesPage from "./pages/activities";

export default function App() {
  return (
    <PageLayout>
      <AuthenticatedTemplate>
        <ActivitiesPage />
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Unauthenticated />
      </UnauthenticatedTemplate>
    </PageLayout>
  );
}

function Unauthenticated() {
  return (
    <div className="card m-4">
      <div className="card-body">
        <h5 className="card-title">Unauthorized</h5>
        <p>Please sign-in to use this application.</p>
        <p className="mb-0">
          <SignInButton />
        </p>
      </div>
    </div>
  );
}
