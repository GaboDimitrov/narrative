/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@taleify/supabase'],
  images: {
    domains: ['images.unsplash.com'],
  },
};

module.exports = nextConfig;
