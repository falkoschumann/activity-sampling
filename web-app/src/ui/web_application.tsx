// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { queryAuthentication } from "../application/authentication_slice";
import { useAppDispatch } from "../application/store";
import AuthenticatedTemplate from "./layouts/authenticated_template";
import UnauthenticatedTemplate from "./layouts/unauthenticated_template";
import LogPage from "./pages/log_page";
import NotFoundPage from "./pages/not_found_page";
import ReportsPage from "./pages/reports_page";
import TimesheetPage from "./pages/timesheet_page";
import UnauthenticatedPage from "./pages/unauthenticated_page";

export default function WebApplication() {
  const dispatch = useAppDispatch();

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
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/*" element={<NotFoundPage />} />
        </Routes>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <UnauthenticatedPage />
      </UnauthenticatedTemplate>
    </BrowserRouter>
  );
}
