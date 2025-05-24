// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";

import PageLayout from "./layouts/page_layout";
import ActivitiesPage from "./pages/activities";
import UnauthenticatedPage from "./pages/unauthenticated";

export default function App() {
  return (
    <PageLayout>
      <AuthenticatedTemplate>
        <ActivitiesPage />
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <UnauthenticatedPage />
      </UnauthenticatedTemplate>
    </PageLayout>
  );
}
