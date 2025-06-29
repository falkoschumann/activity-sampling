// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { SerializedError } from "@reduxjs/toolkit";

export default function ErrorComponent({ message }: SerializedError | undefined = {}) {
  if (!message) {
    return null;
  }

  return (
    <div className="alert alert-danger" role="alert">
      <h4 className="alert-heading">Something went wrong</h4>
      <p className="mb-0">{message}</p>
    </div>
  );
}
