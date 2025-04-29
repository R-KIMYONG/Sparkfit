import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ['d2fd-58-239-97-34.ngrok-free.app'],
    host: true,
    port: 5173
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      swSrc: 'public/sw.js',
      swDest: 'build/sw.js',
      manifest: {
        name: 'My SparkFit',
        short_name: 'SparkFit',
        description: '나의 운동 번개모임',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icons/apple-touch-icon-57x57.png',
            sizes: '57x57',
            type: 'image/png'
          },
          {
            src: '/icons/apple-touch-icon-60x60.png',
            sizes: '60x60',
            type: 'image/png'
          },
          {
            src: '/icons/apple-touch-icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icons/apple-touch-icon-76x76.png',
            sizes: '76x76',
            type: 'image/png'
          },
          {
            src: '/icons/apple-touch-icon-114x114.png',
            sizes: '114x114',
            type: 'image/png'
          },
          {
            src: '/icons/apple-touch-icon-120x120.png',
            sizes: '120x120',
            type: 'image/png'
          },

          {
            src: '/icons/apple-touch-icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icons/apple-touch-icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          }
        ],
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: [{ find: '@', replacement: '/src' }]
  },
  css: {
    postcss: './postcss.config.js' // postcss 설정 파일 경로 지정
  }
});
