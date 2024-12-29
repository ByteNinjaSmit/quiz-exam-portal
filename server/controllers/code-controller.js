// code-controller.js

const { codeQueue } = require('../queue');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  executeAndFetchResult: async (req, res,next) => {
    const { language, code, input = '' } = req.body;
    const jobId = uuidv4();

    // Validate request body
    if (!language || !code) {
      logger.error('Language and code are required');
      return res.status(400).json({ error: 'Language and code are required' });
    }

    try {
      // Add the job to the queue
      const job = await codeQueue.add('code-execution', {
        language,
        code,
        input,
        jobId
      });
      logger.info(`Job ${job.id} added to the queue`);

      // Wait for the job to complete (with a max wait time to prevent long hangs)
      const completedJob = await job.finished();
      const state = await job.getState(); // Get the current state of the job
      logger.info(`Job ${job.id} state: ${state}`);

      // Define the result based on the job state
      let result;
      if (state === 'completed') {
        result = completedJob;
        logger.info(`Job ${job.id} completed successfully: ${result}`);
      } else if (state === 'failed') {
        result = job.failedReason; // Error message if the job failed
        logger.error(`Job ${job.id} failed with reason: ${result}`);
      } else {
        result = 'Job is still processing, please wait...'; // Handle other states like 'waiting', 'active'
        logger.info(`Job ${job.id} is still processing`);
      }

      // Respond with the job result and state
      return res.status(200).json({
        message: 'Job added to the queue',
        jobId: job.id,
        result: result,
      });

    } catch (error) {
      // Log the error stack or message for debugging
      logger.error(`Error in code execution for job ${jobId}: ${error.stack || error.message}`);

      // Respond with an error message
      return res.status(500).json({
        error: 'Code execution failed',
        details: error.message || 'An unexpected error occurred',
      });
    }
  },
};
