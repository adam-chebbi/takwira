import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'icon-192x192.png', 'icon-512x512.png', 'tshirt-red.png', 'tshirt-blue.png'],
        manifest: {
          name: 'Takwira.com',
          short_name: 'Takwira',
          description: 'Organise tes matchs de football en Tunisie',
          theme_color: '#00FF87',
          background_color: '#0A0A0F',
          display: 'standalone',
          icons: [
            {
              src: 'icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages-cache',
                expiration: {
                  maxAgeSeconds: 24 * 60 * 60, // 1 day
                },
              },
            },
            {
              urlPattern: ({ request }) => 
                request.destination === 'style' || 
                request.destination === 'script' || 
                request.destination === 'worker' ||
                request.destination === 'image' ||
                request.destination === 'font',
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-assets',
                expiration: {
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
              },
            },
            {
              urlPattern: /^https:\/\/firestore\.googleapis\.com/,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: {
                  maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
              },
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_ADSENSE_PUBLISHER_ID': JSON.stringify(env.VITE_ADSENSE_PUBLISHER_ID),
      'process.env.VITE_ADSENSE_SLOT_BLOG_LIST': JSON.stringify(env.VITE_ADSENSE_SLOT_BLOG_LIST),
      'process.env.VITE_ADSENSE_SLOT_SIDEBAR_TOP': JSON.stringify(env.VITE_ADSENSE_SLOT_SIDEBAR_TOP),
      'process.env.VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM': JSON.stringify(env.VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM),
      'process.env.VITE_ADSENSE_SLOT_INLINE': JSON.stringify(env.VITE_ADSENSE_SLOT_INLINE),
      'process.env.VITE_GOOGLE_ADS_ID': JSON.stringify(env.VITE_GOOGLE_ADS_ID),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
