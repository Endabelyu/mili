import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Required for Sentry source-map uploads — maps minified stack traces back to source
    sourcemap: true,
    // Warn when any chunk exceeds 200 KB (gzipped approx.) per frontend standards §20.1
    chunkSizeWarningLimit: 200,
    rollupOptions: {
      output: {
        // Split large vendor packages into separate cached chunks
        manualChunks: {
          'vendor-react':   ['react', 'react-dom'],
          'vendor-router':  ['react-router-dom'],
          'vendor-charts':  ['recharts'],
          'vendor-sentry':  ['@sentry/react'],
          'vendor-posthog': ['posthog-js'],
        },
        // Content-hashed filenames for long-term cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
