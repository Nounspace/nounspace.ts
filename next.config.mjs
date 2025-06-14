import bundlerAnalyzer from "@next/bundle-analyzer";
import packageInfo from "./package.json" with { type: "json" };

const withBundleAnalyzer = bundlerAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://www.youtube.com/iframe_api https://auth.privy.nounspace.com;
    style-src 'self' 'unsafe-inline' https://i.ytimg.com https://mint.highlight.xyz;
    img-src 'self' blob: data: https: https://i.ytimg.com;
    font-src 'self' https:;
    object-src 'self';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    frame-src 'self' https://auth.privy.nounspace.com https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com https://www.youtube.com https://*;
    child-src 'self' https://auth.privy.nounspace.com https://verify.walletconnect.com https://verify.walletconnect.org https://www.youtube.com https://*;
    connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} https://auth.privy.nounspace.com https://privy.nounspace.com/api/v1/analytics_events wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems https://auth.privy.io https://auth.privy.io/api/v1/apps/clw9qpfkl01nnpox6rcsb5wy3 wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems;
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
        hostname: "*",
        protocol: "http",
      },
      {
        hostname: "*",
        protocol: "https",
      },
    ],
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

  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      os: 'os',
    };
    return config;
  },
  
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: cspHeader.replace(/\n/g, ''),
  //         },
  //         {
  //           key: 'X-Frame-Options',
  //           value: 'DENY',
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default withBundleAnalyzer(nextConfig);
