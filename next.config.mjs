// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// };

// export default nextConfig;

import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public", // Where the service worker will be generated
  register: true,
  skipWaiting: true, // Ensures the new service worker takes over immediately
  disable: false, // Disable PWA in dev mode
});

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA(nextConfig);
