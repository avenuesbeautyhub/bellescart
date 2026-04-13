import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";

import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { corsOptions } from "./config/cors_config";
import { swaggerUi, specs } from "./config/swagger";

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
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

// API routes
import apiRoutes from './routes';
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Database connection
connectDatabase();

export default app;
