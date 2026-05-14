import dotenv from 'dotenv';
import app from './app.js';
import { testConnection, syncDatabase } from './config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models (set force to true only in development to drop and recreate tables)
    await syncDatabase(NODE_ENV === 'development' && process.env.DB_SYNC === 'true');

    // Start listening
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Server running in ${NODE_ENV} mode`);
      console.log(`📡 Server listening on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/health`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Start the server
startServer();
