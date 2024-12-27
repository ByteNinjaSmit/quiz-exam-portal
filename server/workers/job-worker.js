const { codeQueue } = require('../queue');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

const initWorker = () => {
  codeQueue.process(async (job) => {
    const { language, code, input = '', jobId } = job.data;
    const jobDir = path.join(__dirname, 'temp', `job-${jobId}`);

    try {
      // Create temporary job directory
      await fs.mkdir(jobDir, { recursive: true });
      logger.info(`Job directory created: ${jobDir}`);

      // Define code file based on the programming language
      const codeFile = path.join(jobDir, getCodeFileName(language));
      await fs.writeFile(codeFile, code);
      logger.info(`Code file created at: ${codeFile}`);

      // Create input file
      const inputFile = path.join(jobDir, 'input.txt');
      await fs.writeFile(inputFile, input);
      logger.info(`Input file created at: ${inputFile}`);

      // Prepare and execute the command based on the programming language
      const command = getExecutionCommand(language, jobDir);
      logger.info(`Executing command: ${command}`);

      const output = await runCommand(command, jobId);

      // Mark job as finished successfully
      job.progress(100);
      logger.info(`Job ${jobId} executed successfully with output: ${output}`);
      return output;
      
    } catch (error) {
      logger.error(`Job ${jobId} failed: ${error.message}`);
      throw error;
    } finally {
      // Cleanup temporary files after job completion (success or failure)
      await cleanup(jobDir, jobId);
    }
  });
};

// Helper function to determine the code file name based on the language
const getCodeFileName = (language) => {
  switch (language) {
    case 'python': return 'code.py';
    case 'cpp': return 'code.cpp';
    case 'java': return 'code.java';
    default: throw new Error('Unsupported language');
  }
};

// Helper function to generate the execution command based on language
const getExecutionCommand = (language, jobDir) => {
  switch (language) {
    case 'python':
      return `docker run --rm -v "${path.resolve(jobDir).replace(/\\/g, '/')}:/sandbox" python:3.10 python3 /sandbox/code.py /sandbox/input.txt`;
    case 'cpp':
      return `docker run --rm -v "${path.resolve(jobDir)}:/sandbox" gcc:latest bash -c "g++ /sandbox/code.cpp -o /sandbox/code && /sandbox/code < /sandbox/input.txt"`;
    case 'java':
      return `docker run --rm -v "${path.resolve(jobDir)}:/sandbox" openjdk:11 bash -c "javac /sandbox/code.java && java -cp /sandbox code < /sandbox/input.txt"`;
    default:
      throw new Error('Unsupported language');
  }
};

// Helper function to run the command and capture the output
const runCommand = (command, jobId) => {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error || stderr) {
        const errorMessage = stderr || error.message;
        logger.error(`Error executing job ${jobId}: ${errorMessage}`);
        reject(new Error(errorMessage));
      } else {
        resolve(stdout || stderr);
      }
    });
  });
};

// Cleanup function to remove temporary files after job completion
const cleanup = async (jobDir, jobId) => {
  try {
    await fs.rm(jobDir, { recursive: true, force: true });
    logger.info(`Cleaned up temporary files for job ${jobId}`);
  } catch (cleanupError) {
    logger.error(`Error during cleanup for job ${jobId}: ${cleanupError.message}`);
  }
};

module.exports = { initWorker };
