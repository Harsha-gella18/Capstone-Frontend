// proxy-server.js - Alternative local proxy
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Get API base URL from environment variables
const API_BASE_URL = process.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('Error: VITE_API_BASE_URL not found in environment variables');
  process.exit(1);
}

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Proxy middleware
const apiProxy = createProxyMiddleware('/api', {
  target: API_BASE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying: ${req.method} ${req.url}`);
  }
});

app.use('/api', apiProxy);

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to: ${API_BASE_URL}`);
});

// Usage: npm install express http-proxy-middleware cors dotenv
// Run: node proxy-server.js
// Update API_BASE_URL to http://localhost:3001