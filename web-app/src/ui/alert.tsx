// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { SerializedError } from "@reduxjs/toolkit";

export default function Alert({ error }: { error: SerializedError }) {
  return (
    <div className="alert alert-danger" role="alert">
      <h4 className="alert-heading">Something went wrong</h4>
      <p className="mb-0">{error.message}</p>
    </div>
  );
}
