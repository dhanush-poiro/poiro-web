import type { NextConfig } from "next";

// Static media under /public never changes in place (files are replaced under
// new names), so let browsers cache it for a year. Without this, Vercel serves
// public assets with `max-age=0, must-revalidate` and every revisit
// re-validates 15+ videos before the gallery feels alive.
const IMMUTABLE_CACHE = [
  {
    key: "Cache-Control",
    value: "public, max-age=31536000, immutable",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/os/:path*",            headers: IMMUTABLE_CACHE },
      { source: "/short-form/:path*",    headers: IMMUTABLE_CACHE },
      { source: "/statics/:path*",       headers: IMMUTABLE_CACHE },
      { source: "/ugc-affiliate/:path*", headers: IMMUTABLE_CACHE },
      { source: "/tvc-animatics/:path*", headers: IMMUTABLE_CACHE },
      { source: "/posters/:path*",       headers: IMMUTABLE_CACHE },
      { source: "/frames/:path*",        headers: IMMUTABLE_CACHE },
      { source: "/folder-images/:path*", headers: IMMUTABLE_CACHE },
    ];
  },
};

export default nextConfig;
