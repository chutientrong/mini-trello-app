'use strict';

const logger = require('./config/logger');
logger.info('🚀 Starting Mini Trello Backend...');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');
const http = require('http');

const config = require('./config/config');
const socketManager = require('./socket/socket');
const { errorConverter, errorHandler } = require('./middlewares/error');

// Initialize Firebase
require('./config/firebase');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
socketManager.initialize(server);

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Parse cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Set security HTTP headers
app.use(helmet());

// Gzip compression
app.use(compression());

// Enable cors
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Prevent parameter pollution
app.use(hpp());

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
try {
  app.use('/api/auth', require('./routes/auth.route'));
  app.use('/api/boards', require('./routes/board.route'));
  app.use('/api/cards', require('./routes/card.route'));
  app.use('/api/tasks', require('./routes/task.route'));
  app.use('/api/notifications', require('./routes/notification.route'));
  app.use('/api/github', require('./routes/github.route'));
} catch (error) {
  logger.error('❌ Error loading routes:', error);
  process.exit(1);
} 

// Simple 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

// Start server
const port = config.port || 3001;
server.listen(port, () => {
  logger.info(`🚀 Server running on port ${port}`);
  logger.info(`📝 Environment: ${config.env}`);
  logger.info(`🔗 Health check: http://localhost:${port}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
