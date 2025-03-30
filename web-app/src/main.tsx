// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { MsalProvider } from "@azure/msal-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.esm.js";

import { store } from "./application/store";
import { msalInstance } from "./infrastructure/authentication_gateway";
import App from "./ui/app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <Provider store={store}>
        <App />
      </Provider>
    </MsalProvider>
  </StrictMode>,
);
