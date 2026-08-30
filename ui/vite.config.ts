import react from '@vitejs/plugin-react'
import path from "path"
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The Go binary embeds the build output, so it is written straight into the
    // embed path of the backend's ui adapter rather than into a local dist/.
    outDir: path.resolve(__dirname, "../backend/internal/adapters/ui/dist"),
    emptyOutDir: true,
  },
  server: {
    // In development the UI is served by Vite and the API by `make backend`,
    // so /api is proxied to the backend's local listen address.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
