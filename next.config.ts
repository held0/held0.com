import type { NextConfig } from "next";

// Alte Seiten (Blog, Über, Kontakt, englische Version) gibt es nicht mehr.
const gone = ["/projekte", "/ueber", "/kontakt", "/blog", "/blog/:path*", "/en", "/en/:path*", "/de", "/de/:path*"];

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/datenschutz", destination: "/impressum#datenschutz", permanent: true },
      // Englische Standardpfade, die Assistenten und Scanner erwarten
      { source: "/privacy", destination: "/impressum#datenschutz", statusCode: 301 },
      { source: "/imprint", destination: "/impressum", statusCode: 301 },
      { source: "/contact", destination: "/impressum", statusCode: 301 },
      { source: "/about", destination: "/", statusCode: 301 },
      ...gone.map((source) => ({ source, destination: "/", permanent: true })),
    ];
  },
};

export default nextConfig;
