/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    API_BASE_ENDPOINT: "localhost:8080",
  },
};

export default nextConfig;
