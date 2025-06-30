const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, '../logs/app.log');

const logController = (io) => {
    io.on('connection', (socket) => {
        console.log('A client connected for live logs.');

        // Send the entire log file to the new client, with the latest logs at the top
        const sendPastLogs = () => {
            fs.readFile(logFilePath, 'utf-8', (err, data) => {
                if (err) {
                    console.error('Error reading the log file:', err);
                    return;
                }
                
                // Split the log data into lines, reverse the order and emit the logs
                const pastLogs = data.split('\n').filter(line => line.trim() !== '').reverse();
                socket.emit('log-update', pastLogs.join('\n')); // Emit logs with the latest at top
            });
        };

        sendPastLogs(); // Send past logs when a new client connects

        let lastSize = fs.statSync(logFilePath).size; // Track the last read position in the log file
        const logsBuffer = []; // Buffer to store new logs temporarily

        const sendLogs = async () => {
            try {
                const currentSize = fs.statSync(logFilePath).size; // Get current log file size
                if (currentSize > lastSize) {
                    // Only read the new data in the log file
                    const stream = fs.createReadStream(logFilePath, {
                        encoding: 'utf-8',
                        start: lastSize,
                        end: currentSize
                    });

                    stream.on('data', (chunk) => {
                        // Split the chunk by newlines and filter out empty lines
                        const logs = chunk.split('\n').filter(line => line.trim() !== '');
                        
                        // Prepend the new logs to the logsBuffer (newest logs at top)
                        logs.forEach((log) => {
                            logsBuffer.unshift(log); // Prepend to the start of the buffer
                        });
                    });

                    stream.on('end', () => {
                        // Emit new logs to the client
                        if (logsBuffer.length > 0) {
                            socket.emit('log-update', logsBuffer.join('\n')); // Send the logs with the latest at top
                            console.log('New logs found:', logsBuffer.length, 'entries');
                            console.log('Emitting new logs:', logsBuffer.join('\n'));
                            logsBuffer.length = 0; // Clear the buffer after sending
                        }
                    });

                    stream.on('error', (error) => {
                        console.error('Error reading the log file:', error);
                    });

                    lastSize = currentSize; // Update the last read position
                }
            } catch (error) {
                console.error('Error checking log file size:', error);
            }
        };

        // Send logs every 0.5 second
        const intervalId = setInterval(sendLogs, 500);

        // Cleanup on socket disconnection
        socket.on('disconnect', () => {
            console.log('Client disconnected.');
            clearInterval(intervalId); // Stop the periodic log fetching
        });

        socket.on('clear-logs', () => {
            fs.writeFile(logFilePath, '', (err) => {
                if (err) {
                    socket.emit('log-action-result', { action: 'clear-logs', success: false, message: 'Failed to clear logs.' });
                } else {
                    socket.emit('log-action-result', { action: 'clear-logs', success: true, message: 'Logs cleared.' });
                }
            });
        });

        socket.on('download-logs', () => {
            fs.readFile(logFilePath, 'utf-8', (err, data) => {
                if (err) {
                    socket.emit('log-action-result', { action: 'download-logs', success: false, message: 'Failed to download logs.' });
                } else {
                    socket.emit('log-download', data);
                }
            });
        });
    });
};

module.exports = logController;
