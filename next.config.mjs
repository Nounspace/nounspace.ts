import bundlerAnalyzer from "@next/bundle-analyzer";
import packageInfo from "./package.json" with { type: "json" };
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const withBundleAnalyzer = bundlerAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://www.youtube.com/iframe_api https://auth.privy.nounspace.com;
    style-src 'self' 'unsafe-inline' https://i.ytimg.com https://mint.highlight.xyz;
    img-src 'self' blob: data: https:;
    font-src 'self' https:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self' https://farcaster.xyz https://*.farcaster.xyz https://wallet.coinbase.com https://*.coinbase.com https://base.org https://*.base.org https://nogglesboard.wtf https://*.nogglesboard.wtf;
    frame-src 'self' https://auth.privy.nounspace.com https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com https://www.youtube.com https://*;
    child-src 'self' https://auth.privy.nounspace.com https://verify.walletconnect.com https://verify.walletconnect.org https://www.youtube.com https://*;
    connect-src 'self'
      ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}
      https://auth.privy.nounspace.com
      https://privy.nounspace.com/api/v1/analytics_events
      https://privy.nounspace.com/api/v1/siwe/init
      https://privy.nounspace.com
      wss://relay.walletconnect.com
      wss://relay.walletconnect.org
      wss://www.walletlink.org
      https://*.rpc.privy.systems
      https://auth.privy.io
      https://auth.privy.io/api/v1/apps/clw9qpfkl01nnpox6rcsb5wy3
      https://auth.privy.io/api/v1/analytics_events;
    upgrade-insecure-requests;
`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Outputs a Single-Page Application (SPA).
  // distDir: './dist', // Changes the build output directory to `./dist/`.
  transpilePackages: [
    "react-tweet", 
    "react-best-gradient-color-picker",
  ], // https://react-tweet.vercel.app/next,
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    NEXT_PUBLIC_VERSION: packageInfo.version,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; object-src 'none';",
    formats: ['image/webp', 'image/avif'],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home/Nouns",
        permanent: true,
      },
      {
        source: "/signatures",
        destination:
          "https://docs.nounspace.com/nounspace-alpha/accounts/signatures",
        permanent: true,
      },
      {
        source: "/t/:network/:contractAddress",
        destination: "/t/:network/:contractAddress/Profile",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/home",
        destination: "/home/Nouns",
      },
    ];
  },
  webpack: (config) => {
    // Prevent webpack from attempting to bundle Node "os" module
    // which can cause erroneous imports of @walletconnect/types
    config.resolve.fallback = {
      ...config.resolve.fallback,
      os: false,
    };
    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
