/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable JSON imports
  webpack: (config) => {
    // Ensure JSON files are processed correctly
    config.module.rules.push({
      test: /\.json$/,
      type: "javascript/auto",
      use: [
        {
          loader: "json-loader",
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;
