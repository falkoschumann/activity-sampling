// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap";

import "./ui/assets/style.scss";
import { MessageHandlerContext } from "./ui/components/message_handler_context";
import EstimatePage from "./ui/pages/estimate";
import { MessageHandlerImpl } from "./message_handler";

const messageHandler = MessageHandlerImpl.create();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MessageHandlerContext value={messageHandler}>
      <EstimatePage />
    </MessageHandlerContext>
  </StrictMode>,
);
