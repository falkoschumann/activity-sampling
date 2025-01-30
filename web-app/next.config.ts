// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_EXPORT } from "next/constants";

function nextConfig(phase: string): NextConfig {
  let config: NextConfig = {};

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    config = {
      ...config,
      rewrites: async () => [
        {
          source: "/api/:path*",
          destination: "http://localhost:8080/api/:path*",
        },
      ],
    };
  }

  if (phase === PHASE_EXPORT) {
    config = {
      ...config,
      output: "export",
    };
  }

  return config;
}

export default nextConfig;
