// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
// Custom dev server rewrite plugin
function routeRewriter() {
  return {
    name: 'html-route-rewriter',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url;
        if (url === '/') {
          // stake.litheum.com
          req.url = '/stake/index.html';
          console.log('Rewriting to stake/index.html');
        } else if (url === '/public') {
          req.url = '/public-offering/index.html';
        } else if (url === '/status') {
          req.url = '/status/index.html';
        } else if (url === '/private') {
          req.url = '/private/index.html';
        } else if (url === '/dex') {
          // swap.litheum.com   ------> localhost:5173/dex
          req.url = '/dex/index.html';
        } else if (url === '/pool') {
          // swap.litheum.com/pool -------> localhost:5173/pool
          req.url = '/dex/pool.html';
        } else if (url === '/runner') {
          // runner.litheum.com
          req.url = '/runner/index.html';
        }
        next();
      });
    }
  };
}

export default defineConfig({
  root: '.',
  appType: 'mpa',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'stake/index.html'),
        public: resolve(__dirname, 'public-offering/index.html'),
        dex: resolve(__dirname, 'dex/index.html'),
        pool: resolve(__dirname, 'dex/pool.html'),
        runner: resolve(__dirname, 'runner/index.html'),
        // contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
  plugins: [routeRewriter()]
});
