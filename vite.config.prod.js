import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['assets/images/logo/MiniLogoCowdi.svg', 'assets/images/logo/Logo_Cowdi.svg'],
      manifest: {
        name: 'Cowdi English',
        short_name: 'Cowdi',
        description: 'Học tiếng Anh vui vẻ cùng pet ảo — Duel bạn bè, luyện IELTS/TOEIC',
        theme_color: '#FF6B9D',
        background_color: '#FFF8F0',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'vi',
        categories: ['education', 'games'],
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        shortcuts: [
          {
            name: 'Luyện tập ngay',
            short_name: 'Luyện tập',
            url: '/practice',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Duel bạn bè',
            short_name: 'Duel',
            url: '/duel',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,webp,woff2}'],
        globIgnores: ['**/assets/images/Icons/**', '**/assets/images/pets/**'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  base: '/',
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://cowdi.net'),
  },
  build: {
    outDir: 'dist-prod',
    sourcemap: false,
    cssMinify: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            if (id.includes('/src/data/lessons/')) return 'data-lessons';
            if (id.includes('/src/data/vocab/')) return 'data-vocab';
            if (id.includes('/src/data/quiz/')) return 'data-quiz';
            return undefined;
          }
          if (id.includes('react-router')) return 'router';
          if (id.includes('react-dom')) return 'react-dom';
          if (id.includes('/react/')) return 'react';
          return 'vendor';
        },
      },
    },
  },
});
