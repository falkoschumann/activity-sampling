// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import "bootstrap";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./ui/assets/style.scss";
import ReportPage from "./ui/pages/report";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReportPage />
  </StrictMode>,
);
