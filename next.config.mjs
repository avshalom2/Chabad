/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return {
      beforeFiles: [{
        source: '/uploads/holidays/rosh-hashanah-step-by-step.pdf',
        destination: '/api/holidays/rosh-hashanah/guide',
      }],
    };
  },
};

export default nextConfig;
