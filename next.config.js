/** @type {import('next').NextConfig} */
const nextConfig = {
  // Subdominio dedicado: https://prompt.seguimiento360.com
  // NO usar basePath ni assetPrefix (la app vive en la raíz del subdominio)
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true
};

module.exports = nextConfig;
