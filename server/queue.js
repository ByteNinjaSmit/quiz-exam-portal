
// ./server/queue.js
const Queue = require('bull');
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const logger = require('./utils/logger');

const codeQueue = new Queue('code-execution', redisUrl, {
  limiter: {
    groupKey: 'jobType',
    max: 10,
    duration: 1000,
  },
  settings: {
    maxStalledCount: 3,
    lockDuration: 30000,
  },
  retries: 3,
});

codeQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed with result: ${result}`);
});

codeQueue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} failed with error: ${error.message}`);
});

codeQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} has stalled`);
});

process.on('SIGINT', async () => {
  logger.info('Gracefully shutting down...');
  await codeQueue.close();
  process.exit(0);
});

module.exports = { codeQueue };
