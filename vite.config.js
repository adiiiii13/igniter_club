import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'welcome-parallax-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const rawUrl = req.url || '';
          const pathname = rawUrl.split('?')[0];
          if (
            pathname === '/' ||
            pathname === '/welcome' ||
            pathname === '/welcome/' ||
            pathname === '/intro' ||
            pathname === '/intro/'
          ) {
            req.url = '/welcome/index.html' + (rawUrl.includes('?') ? '?' + rawUrl.split('?')[1] : '');
          }
          next();
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split three.js and related into its own chunk
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            // Split animation libraries
            if (id.includes('framer-motion') || id.includes('animejs')) {
              return 'animation-vendor';
            }
            // Split supabase
            if (id.includes('supabase')) {
              return 'supabase-vendor';
            }
            // Split UI core
            if (id.includes('react-router-dom') || id.includes('react-icons')) {
              return 'ui-vendor';
            }
            // Everything else in a generic vendor chunk
            return 'vendor';
          }
        }
      }
    },
    // Increase limit slightly since with Three.js even split chunks can be large
    chunkSizeWarningLimit: 1000,
  }
})
