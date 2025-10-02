/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle platform-specific Remotion packages
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        // Darwin (macOS)
        "@remotion/compositor-darwin-x64": false,
        "@remotion/compositor-darwin-arm64": false,

        // Linux
        "@remotion/compositor-linux-x64": false,
        "@remotion/compositor-linux-arm64": false,
        "@remotion/compositor-linux-x64-musl": false,
        "@remotion/compositor-linux-arm64-musl": false,
        "@remotion/compositor-linux-x64-gnu": false,
        "@remotion/compositor-linux-arm64-gnu": false,

        // Windows
        "@remotion/compositor-win32-x64": false,
        "@remotion/compositor-windows-x64": false,

        // Handle esbuild
        esbuild: false,
      },
    };

    // Add esbuild to external modules
    if (isServer) {
      config.externals = [...config.externals, "esbuild"];
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@remotion/bundler",
      "@remotion/renderer",
      "esbuild",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.nymia.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sample-videos.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
