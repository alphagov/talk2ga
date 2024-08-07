import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  console.log({ isProduction });
  return {
    build: {
      outDir: '../backend/src/webapp/static',
      rollupOptions: {
        external: ['/javascripts/govuk-frontend.min.js'],
      },
    },
    base: isProduction ? '/static' : '/',
    plugins: [svgr(), react()],
    server: {
      proxy: {
        '^.*/(question|config_schema|input_schema|stream_log|feedback|custom_chain)(/[a-zA-Z0-9-]*)?$':
          {
            target: 'http://127.0.0.1:80',
            changeOrigin: true,
            rewrite: (path) => path.replace('/static', ''),
          },
      },
    },
  };
});
