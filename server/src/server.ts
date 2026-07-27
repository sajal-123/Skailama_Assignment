import type { Server } from 'node:http';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './db.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  await connectDB(env.MONGO_URI);
  const app = createApp();
  const server = app.listen(env.PORT, () => logger.info(`Server listening on port ${env.PORT}`));

  registerShutdownHandlers(server);
}

function registerShutdownHandlers(server: Server): void {
  let shuttingDown = false;

  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`Received ${signal}, shutting down gracefully`);

    server.close(async () => {
      try {
        await disconnectDB();
        logger.info('Shutdown complete');
        process.exit(0);
      } catch (err) {
        logger.error('Error during shutdown', err);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => logger.error('Unhandled promise rejection', reason));
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', err);
    process.exit(1);
  });
}

main().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
