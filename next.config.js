/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Necesario para que Next.js pueda leer el path del volumen de Railway
  output: 'standalone',
  // Ignorar errores de TypeScript en build de producción
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
