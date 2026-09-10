require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDB = require('./config/db');
const { initDeadlineCron } = require('./services/deadlineCron');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const savedRoutes = require('./routes/savedRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
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
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'DishaSetu — Right Opportunity → Right Person → Right Time',
    timestamp: new Date()
  });
});

// Fallback for API routes (404 Not Found)
app.use('/api/{*splat}', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route [${req.method} ${req.originalUrl}] not found.`
  });
});

// Fallback for SPA/Static routes -> send to index.html if file doesn't exist
app.get('/{*splat}', (req, res) => {
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
app.listen(PORT, '0.0.0.0', () =>  {
  console.log(`====================================================`);
  console.log(`✨ DishaSetu Server running on http://localhost:${PORT}`);
  console.log(`✨ Tagline: "Right Opportunity → Right Person → Right Time"`);
  console.log(`====================================================`);

  // Start Background Deadline Cron Scheduler
  initDeadlineCron();
});
