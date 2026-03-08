// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap";

import ReportPage from "./ui/pages/report";
import "./ui/assets/style.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReportPage />
  </StrictMode>,
);
