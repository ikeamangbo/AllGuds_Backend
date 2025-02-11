const { Queue, Worker } = require('bullmq');
require('dotenv').config();

const redisConnection = {
    connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        tls: {
            rejectUnauthorized: false, // Required for Redis Cloud
        },
    },
};

// Define the queue
const orderQueue = new Queue('orderQueue', redisConnection);

// Define a worker to process orders
const orderWorker = new Worker(
    'orderQueue',
    async (job) => {
        console.log(`Processing order: ${job.data.orderId}`);
    },
    redisConnection
);

console.log('Order queue worker is running...');

module.exports = { orderQueue };
