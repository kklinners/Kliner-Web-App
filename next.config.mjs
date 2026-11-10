/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // small self-contained build for Docker
  async redirects() {
    return [
      { source: "/booking/user-chat", destination: "/help", permanent: false },
      { source: "/booking/customer-chat", destination: "/help", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
