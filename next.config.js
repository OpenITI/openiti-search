/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  webpack: (config) => {
    // typesense uses axios, which is not compatible with the edge runtime
    // so we replace it with redaxios
    config.resolve.alias.axios = "redaxios";

    return config;
  },
};

export default config;
