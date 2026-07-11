/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  allowedDevOrigins: ['10.0.213.117'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
