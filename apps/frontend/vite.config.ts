import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
      cloudflareDevProxy(),
      reactRouter(),
      tsconfigPaths(),
      sentryVitePlugin({
          org: "kauman",
          project: "straumur",
          telemetry: false,
      })
  ],
  build: {
      sourcemap: true
  }
});
