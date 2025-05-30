// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "bootstrap";

import { store } from "./application/store";
import WebApplication from "./ui/web_application";
import "./styles.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <WebApplication />
    </Provider>
  </StrictMode>,
);
