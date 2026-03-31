/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/about", destination: "/", permanent: false },
      { source: "/blog", destination: "/", permanent: false },
      { source: "/blog/:slug*", destination: "/", permanent: false },
      { source: "/consultation", destination: "/contact", permanent: false },
      { source: "/pricing", destination: "/configuration", permanent: false },
      { source: "/services", destination: "/configuration", permanent: false },
      { source: "/services/:path*", destination: "/configuration", permanent: false },
      { source: "/testimonials", destination: "/", permanent: false },
    ]
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false
    }

    return config
  },
}

export default nextConfig
