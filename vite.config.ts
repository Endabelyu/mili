import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Saku — Financial Tracker',
        short_name: 'Saku',
        description: 'Kelola keuangan pribadi Anda dengan mudah dan cerdas.',
        theme_color: '#12B76A',
        background_color: '#FAF7F2',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Prevent SW from intercepting /api/ paths (would return index.html via SPA fallback)
        navigateFallbackDenylist: [/\/api\//],
        // No runtimeCaching — React Query handles API caching on the client side
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 4016,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom'],
          'vendor-router':  ['react-router-dom'],
          'vendor-charts':  ['recharts'],
          'vendor-sentry':  ['@sentry/react'],
          'vendor-posthog': ['posthog-js'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});
