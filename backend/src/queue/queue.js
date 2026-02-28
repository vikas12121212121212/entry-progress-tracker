const { Queue } = require("bullmq");

const entryQueue = new Queue("entryQueue", {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
});

module.exports = entryQueue;