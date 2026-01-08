import type { NextConfig } from "next";

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'https://lms-project-production-0d23.up.railway.app';
  // Ensure URL starts with http:// or https://
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${getApiUrl()}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
