// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export default function Error({ message }: { message?: string }) {
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
