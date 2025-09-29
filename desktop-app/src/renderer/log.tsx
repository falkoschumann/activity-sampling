// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap";

import LogPage from "./ui/pages/log";
import "./ui/assets/style.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LogPage />
  </StrictMode>,
);
