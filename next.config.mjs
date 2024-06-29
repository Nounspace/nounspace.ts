import bundlerAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundlerAnalyzer({
  // eslint-disable-next-line no-undef
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Outputs a Single-Page Application (SPA).
  // distDir: './dist', // Changes the build output directory to `./dist/`.
  transpilePackages: ['react-tweet', 'react-best-gradient-color-picker'], // https://react-tweet.vercel.app/next,
  typescript: {
    ignoreBuildErrors: false,
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
        destination: "/homebase",
        permanent: true,
      },
      {
        source: '/signatures',
        destination: 'https://docs.nounspace.com/nounspace-alpha/accounts/signatures',
        permanent: true,
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig);