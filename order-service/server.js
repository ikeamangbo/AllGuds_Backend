const express = require('express');
const { createClient } = require('redis');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const orderRoutes = require('./routes/order');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
require('./config/bull'); // Setup Bull queue

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

console.log("Redis URL:", process.env.REDIS_URL);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Connect to Redis
const connectRedis = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true,  // Ensure SSL is enabled
        rejectUnauthorized: false,  // Bypass certificate validation (use only for testing)
    },
});

client.on('error', (err) => console.error('Redis Client Error:', err));

(async () => {
    try {
        await client.connect();
        console.log('Connected to Redis Cloud');

        await client.set('test', 'Redis Connected');
        const result = await client.get('test');
        console.log('Redis Test:', result);
    } catch (err) {
        console.error('Redis Connection Failed:', err);
    }
})();

};

connectRedis(); // Run Redis connection function

// Routes
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
});
