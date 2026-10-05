import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  ...(process.env.CENTRAL_STATIC_EXPORT === "true"
    ? { output: "export", images: { unoptimized: true } } as const
    : {}),
};
export default config;
