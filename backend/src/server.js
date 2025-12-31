/**
 * Server Entry Point
 * 
 * Starts the HTTP server and handles graceful shutdown.
 * Separates server startup from app configuration for testability.
 */

const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');

// Start server
const server = app.listen(config.port, () => {
  logger.success(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 MicroPost API Server                                 ║
║                                                           ║
║   Environment: ${config.nodeEnv.padEnd(42)}║
║   Port:        ${config.port.toString().padEnd(42)}║
║   URL:         http://localhost:${config.port.toString().padEnd(31)}║
║                                                           ║
║   Endpoints:                                              ║
║   - POST   /api/auth/register                             ║
║   - POST   /api/auth/login                                ║
║   - GET    /api/auth/me                                   ║
║   - GET    /api/users                                     ║
║   - GET    /api/users/:userId                             ║
║   - GET    /api/users/:userId/posts                       ║
║   - GET    /api/posts                                     ║
║   - GET    /api/posts/:postId                             ║
║   - POST   /api/posts                                     ║
║   - DELETE /api/posts/:postId                             ║
║   - GET    /health                                        ║
║                                                           ║
║   Ready to accept requests! 🎉                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, starting graceful shutdown...`);
  
  server.close(() => {
    logger.success('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;