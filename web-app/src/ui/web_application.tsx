// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { queryAuthentication } from "../application/authentication_slice";
import { AppDispatch } from "../application/store";
import AuthenticatedTemplate from "./components/authenticated_template";
import UnauthenticatedTemplate from "./components/unauthenticated_template";
import LogPage from "./pages/log_page";
import NotFoundPage from "./pages/not_found_page";
import TimesheetPage from "./pages/timesheet_page";
import UnauthenticatedPage from "./pages/unauthenticated_page";

export default function WebApplication() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(queryAuthentication({}));
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AuthenticatedTemplate>
        <Routes>
          <Route index element={<Navigate to="/log" replace />} />
          <Route path="/log" element={<LogPage />} />
          <Route path="/timesheet" element={<TimesheetPage />} />
          <Route path="/*" element={<NotFoundPage />} />
        </Routes>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <UnauthenticatedPage />
      </UnauthenticatedTemplate>
    </BrowserRouter>
  );
}
