/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
  },
  i18n: {
    locales: ['en', 'ar', 'fa', 'es', 'fr', 'de'],
    defaultLocale: 'en',
    localeDetection: true
  }
};

module.exports = nextConfig;
