/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@taleify/supabase'],
  images: {
    domains: ['images.unsplash.com', 'plus.unsplash.com', 'www.book.store.bg'],
  },
};

module.exports = nextConfig;
