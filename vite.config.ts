import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        // target: 'http://localhost:5000',
        target: 'https://prek-lms-backend.bylinelms.com/api',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 8080,
    host: "::",
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: 'spa-fallback-middleware',
      configureServer(server: any) {
        server.middlewares.use('/api', (req: any, res: any, next: any) => next());
        server.middlewares.use((req: any, res: any, next: any) => {
          // Skip files with extensions and API routes
          if (req.url && (req.url.includes('.') || req.url.startsWith('/api'))) {
            return next();
          }
          
          // For all other routes, serve index.html to let React Router handle it
          if (req.headers.accept?.includes('text/html')) {
            req.url = '/';
          }
          
          next();
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'scratch-vm',
      'scratch-blocks',
      'scratch-render',
      'scratch-audio',
      'scratch-storage',
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: false,

    rollupOptions: {
      external: ['fs', 'path'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          charts: ['recharts'],
          icons: ['lucide-react'],
          utils: ['clsx', 'class-variance-authority', 'tailwind-merge'],
        },
      },
    },
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
  },
  define: {
    global: 'globalThis',
  },
  assetsInclude: ['**/*.wasm'],
}));
