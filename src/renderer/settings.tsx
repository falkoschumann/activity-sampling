// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import "bootstrap";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./ui/assets/style.scss";
import SettingsPage from "./ui/pages/settings";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SettingsPage />
  </StrictMode>,
);
