const backendUrl =
  process.env.BACKEND_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3000";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl.replace(/\/$/, "")}/api/:path*`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${backendUrl.replace(/\/$/, "")}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
