// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import SignInButton from "../components/sign_in_button";

export default function UnauthenticatedPage() {
  return (
    <div className="card m-4">
      <div className="card-body">
        <h5 className="card-title">Unauthorized</h5>
        <p>Please sign-in to use this application.</p>
        <p className="mb-0">
          <SignInButton />
        </p>
      </div>
    </div>
  );
}
