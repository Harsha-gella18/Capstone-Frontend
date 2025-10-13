import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true, // Allow external connections for production preview
      proxy: {
        // Proxy all /api requests to the AWS API Gateway
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying request:', req.method, req.url);
              // Add necessary headers
              proxyReq.setHeader('Origin', env.VITE_API_BASE_URL);
              proxyReq.setHeader('Referer', env.VITE_API_BASE_URL);
            });
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error:', err);
            });
          }
        }
      }
    },
    preview: {
      port: 5173,
      host: true
    }
  }
})
