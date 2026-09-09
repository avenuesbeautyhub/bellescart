import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { corsOptions } from "./config/cors_config";
import { swaggerUi, specs } from "./config/swagger";
import { apiRateLimiter, publicRateLimiter } from "./middleware/rateLimiter";
import { requestIdMiddleware } from "./middleware/requestId";
import { csrfMiddleware, csrfTokenEndpoint } from "./middleware/csrf";
import { requestSigningMiddleware } from "./middleware/requestSigning";
import { requestLogger } from "./utils/logger";

dotenv.config();

const app = express();

// Request ID middleware (must be first)
app.use(requestIdMiddleware);

// CORS configuration
app.use(cors(corsOptions));

// Cookie parser for CSRF tokens
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware with minimal configuration for multipart compatibility
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Request logging middleware
app.use(requestLogger);


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

// CSRF token endpoint (must be before API middleware to avoid middleware)
app.get('/api/csrf-token', csrfTokenEndpoint);

// API routes with rate limiting
import apiRoutes from './routes';

// Apply middleware to API routes
app.use('/api', (req, res, next) => {
  // Skip general rate limiter for admin routes (they have their own)
  if (req.path.startsWith('/admin')) {
    next();
  } else if (req.path.startsWith('/public')) {
    // Use more lenient rate limiter for public routes
    publicRateLimiter(req, res, next);
  } else {
    apiRateLimiter(req, res, next);
  }
}, (req, res, next) => {
  // Skip CSRF middleware for public routes and csrf-token endpoint
  if (req.path.startsWith('/public') || req.path === '/csrf-token') {
    return next();
  }
  csrfMiddleware(req, res, next);
}, (req, res, next) => {
  // Skip request signing middleware for public routes and csrf-token endpoint
  if (req.path.startsWith('/public') || req.path === '/csrf-token') {
    return next();
  }
  requestSigningMiddleware(req, res, next);
}, apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Database connection
connectDatabase();

export default app;
