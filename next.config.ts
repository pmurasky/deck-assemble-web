import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/decks/create',
        destination: '/decks?create=true',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
