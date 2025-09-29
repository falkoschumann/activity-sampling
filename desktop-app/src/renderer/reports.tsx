// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap";

import "./ui/assets/style.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <h1>Reports</h1>
  </StrictMode>,
);
