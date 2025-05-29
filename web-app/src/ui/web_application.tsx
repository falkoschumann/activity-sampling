// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { queryAuthentication } from "../application/authentication_slice";
import { AppDispatch } from "../application/store";
import AuthenticatedTemplate from "./components/authenticated_template";
import UnauthenticatedTemplate from "./components/unauthenticated_template";
import PageLayout from "./layouts/page_layout";
import ActivitiesPage from "./pages/activities_page";
import UnauthenticatedPage from "./pages/unauthenticated_page";

export default function WebApplication() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(queryAuthentication({}));
  }, [dispatch]);

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
