import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tsconfigPaths()],
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      // Add browser versions for node-specific modules
      'sockjs-client': 'sockjs-client/dist/sockjs.min.js',
    }
  },
})
