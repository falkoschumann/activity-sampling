// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import PageLayout from "../layouts/page_layout";

export default function NotFoundPage() {
  return (
    <PageLayout>
      <main className="container my-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Not found</h5>
            <p className="card-text">
              The requested page does not exist. Try using the menu in the header to find what you're looking for or
              start from the home page.
            </p>
            <a className="btn btn-primary" href="/">
              Home
            </a>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
