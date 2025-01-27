// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

function nextConfig(phase: string): NextConfig {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      rewrites: async () => {
        return [
          {
            source: "/api/:path*",
            destination: "http://localhost:8080/api/:path*",
          },
        ];
      },
    };
  }

  return {
    output: "export",
  };
}

export default nextConfig;
