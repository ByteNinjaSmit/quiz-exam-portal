// ./server/queue.js

const Queue = require('bull');
const codeQueue = new Queue('code-execution', 'redis://127.0.0.1:6379');



module.exports = { codeQueue };
