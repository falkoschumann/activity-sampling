// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import "bootstrap";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./ui/assets/style.scss";
import LogPage from "./ui/pages/log";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LogPage />
  </StrictMode>,
);
