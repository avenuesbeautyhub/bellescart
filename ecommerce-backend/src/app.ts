import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";

import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { corsOptions } from "./config/cors_config";
import { swaggerUi, specs } from "./config/swagger";
import { apiRateLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();

// CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware with minimal configuration for multipart compatibility
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));


// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'BellesCart E-commerce Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BellesCart API Documentation'
}));

// API routes with rate limiting
import apiRoutes from './routes';

// Apply general rate limiter to all API routes except admin (which has its own)
app.use('/api', (req, res, next) => {
  // Skip general rate limiter for admin routes (they have their own)
  if (req.path.startsWith('/admin')) {
    next();
  } else {
    apiRateLimiter(req, res, next);
  }
}, apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Database connection
connectDatabase();

export default app;
