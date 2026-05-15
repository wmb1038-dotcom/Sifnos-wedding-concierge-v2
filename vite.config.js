import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During `vercel dev`, both the frontend and the /api functions run on the
// same port — no proxy needed. During plain `vite dev`, we'd need a proxy,
// but the recommended workflow is `vercel dev` so we keep this simple.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    // On Windows, vercel dev doesn't run the Python runtime locally.
    // Run `python run_api.py` in a second terminal and Vite will proxy
    // /api requests to it. In production Vercel handles this natively.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
