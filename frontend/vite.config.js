// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    lib: {
      entry: 'src/index.jsx',
      name: 'ChatWidget',
      formats: ['iife'],
      fileName: () => 'chat-widget.iife.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'chat-widget.css'
          }
          return assetInfo.name;
        },
      },
    },
  },
  define: {
    // Define process for browser compatibility
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({}),
    global: 'globalThis',
  }
})