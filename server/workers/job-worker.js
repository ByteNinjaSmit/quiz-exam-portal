// Job-worker.js
const { codeQueue } = require('../queue');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

const initWorker = (concurrency) => {
  concurrency = Math.floor(concurrency); 
  
  codeQueue.process('code-execution', concurrency, async (job) => {
    const { language, code, input = '', jobId } = job.data;
    const jobDir = path.join(__dirname, 'temp', `job-${jobId}`);
    const containerName = `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

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
      const command = getExecutionCommand(language, jobDir,containerName);
      logger.info(`Executing command: ${command}`);

      const output = await runCommand(command, jobId,containerName);

      // Mark job as finished successfully
      job.progress(100);
      logger.info(`Job ${jobId} executed successfully with output: ${output}`);
      return output;
      
    } catch (error) {
      logger.error(`Job ${jobId} failed: ${error.message}`);
      throw error;
    } finally {
      // Cleanup temporary files after job completion (success or failure)
      await cleanup(jobDir, jobId,containerName);
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
const getExecutionCommand = (language, jobDir,containerName) => {
  switch (language) {
    case 'python':
      return `docker run --rm --name ${containerName} -v "${path.resolve(jobDir).replace(/\\/g, '/')}:/sandbox" --cpus="0.1" --memory="512m" python:3.10 bash -c "python3 /sandbox/code.py < /sandbox/input.txt"`;
    case 'cpp':
      return `docker run --rm --name ${containerName} -v "${path.resolve(jobDir)}:/sandbox" --cpus="0.1" --memory="512m" gcc:latest bash -c "g++ /sandbox/code.cpp -o /sandbox/code && /sandbox/code < /sandbox/input.txt"`;
    case 'java':
      return `docker run --rm --name ${containerName} -v "${path.resolve(jobDir)}:/sandbox" --cpus="0.1" --memory="512m" openjdk:11 bash -c "javac /sandbox/code.java && java -cp /sandbox code < /sandbox/input.txt"`;
    default:
      throw new Error('Unsupported language');
  }
};

// Helper function to run the command and capture the output
const runCommand = (command, jobId,containerName) => {
  return new Promise((resolve, reject) => {
    const process = exec(command, { timeout: 20000 });

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      output += data;
    });

    process.stderr.on('data', (data) => {
      errorOutput += data;
    });

    process.on('error', (error) => {
      logger.error(`Error executing job ${jobId}: ${error.message}`);
      reject(new Error(error.message));
    });

    process.on('close', (code) => {
      if (code !== 0) {
        logger.error(`Job ${jobId} failed with exit code ${code}`);
        reject(new Error(errorOutput || `Process exited with code ${code}`));
      } else {
        resolve(output);
      }
    });

    // Ensure the process is killed if it times out
    setTimeout(async () => {
      try {
        exec(`docker stop ${containerName}`, () => {
          logger.warn(`Container ${containerName} stopped due to timeout`);
        });
      } catch (err) {
        logger.error(`Failed to stop container ${containerName}: ${err.message}`);
      }
      reject(new Error(`Job ${jobId} timed out after 20 seconds`));
    }, 30000);
    
  });
};


// Cleanup function to remove temporary files after job completion
const cleanup = async (jobDir, jobId, containerName) => {
  try {
    await fs.rm(jobDir, { recursive: true, force: true });
    logger.info(`Cleaned up temporary files for job ${jobId}`);

    // Stop any running container with the same name
    exec(`docker rm -f ${containerName}`, (error) => {
      if (error) {
        logger.warn(`No container to clean up for job ${jobId}`);
      } else {
        logger.info(`Container ${containerName} cleaned up for job ${jobId}`);
      }
    });
  } catch (cleanupError) {
    logger.error(`Error during cleanup for job ${jobId}: ${cleanupError.message}`);
  }finally {
    
  }
  
};


module.exports = { initWorker };