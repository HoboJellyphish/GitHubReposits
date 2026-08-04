import withPWAInit from "@ducanh2912/next-pwa";

// next-pwa (the actively maintained @ducanh2912 fork) wraps the Next config and
// generates the service worker + workbox runtime caching into /public on build.
const withPWA = withPWAInit({
  dest: "public",
  // Disable the SW in dev so HMR works and we don't cache stale dev assets.
  disable: process.env.NODE_ENV === "development",
  register: true,
  // Keep navigations snappy and warm the cache as the user moves around the app.
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // When offline and a page isn't cached, fall back to the offline shell.
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
