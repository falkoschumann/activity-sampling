import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.css";

export const metadata: Metadata = {
  title: "Activity Sampling",
  description: "Periodically asks the user about their current activity and logs it for analysis.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-100">
      <body className="d-flex flex-column h-100 small">{children}</body>
    </html>
  );
}
