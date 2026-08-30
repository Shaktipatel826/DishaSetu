require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Core Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'Kisan Direct - Farmer to Consumer Grain Marketplace',
    timestamp: new Date()
  });
});

// Fallback for API routes (404 Not Found)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route [${req.method} ${req.originalUrl}] not found.`
  });
});

// Fallback for SPA/Static routes -> send to index.html if file doesn't exist
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌾 Kisan Direct Server running on http://localhost:${PORT}`);
  console.log(`🌾 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
