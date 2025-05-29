// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export default function UnauthenticatedPage() {
  return (
    <main className="container my-4">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Unauthorized</h5>
          <p className="card-text">Please sign-in to use this application.</p>
          <a className="btn btn-primary" href="/login">
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}
