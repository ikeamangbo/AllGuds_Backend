const express = require('express');
const httpProxy = require('http-proxy');
const dotenv = require('dotenv');
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const proxy = httpProxy.createProxyServer();

const PORT = process.env.PORT || 3000;

// Services URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';

app.use(express.json());

// Auth routes
app.use('/api/auth', (req, res) => {
  proxy.web(req, res, { target: AUTH_SERVICE_URL });
});

// Product routes
app.use('/api/products', authenticateToken, (req, res) => {
  proxy.web(req, res, { target: PRODUCT_SERVICE_URL });
});

// Order routes
app.use('/api/orders', authenticateToken, (req, res) => {
  proxy.web(req, res, { target: ORDER_SERVICE_URL });
});

// Notification routes
app.use('/api/notifications', authenticateToken, (req, res) => {
  proxy.web(req, res, { target: NOTIFICATION_SERVICE_URL });
});

// Error handling for proxy
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.status(500).json({ message: 'Proxy error occurred' });
});

// General error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

