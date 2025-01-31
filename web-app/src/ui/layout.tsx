// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import "bootstrap/dist/css/bootstrap.css";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-100">
      <body className="d-flex flex-column h-100 small">{children}</body>
    </html>
  );
}
