import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import partnershipRoutes from './routes/partnershipRoutes.js';
import blogCategoryRoutes from './routes/blogCategoryRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// CORS middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed));
    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/partnerships', partnershipRoutes);
app.use('/api/blog-categories', blogCategoryRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TeleHealth Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      blogs: '/api/blogs',
      services: '/api/services',
      partnerships: '/api/partnerships',
      blogCategories: '/api/blog-categories',
      health: '/api/health'
    }
  });
});

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

export default app;
