import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [svgr(), react()],
  server: {
    proxy: {
      "^/.*/(config_schema|input_schema|stream_log|feedback)(/[a-zA-Z0-9-]*)?$": {
        target: "http://127.0.0.1:80",
        changeOrigin: true,
        rewrite: (path) => path.replace("/____LANGSERVE_BASE_URL", ""),
      },
    },
  },
});
