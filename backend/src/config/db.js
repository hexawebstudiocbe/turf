const mongoose = require('mongoose');

const connectDB = async (customUri = null) => {
  try {
    const mongoUri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/turfbook';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    // If not in test environment, we don't exit immediately to allow retries or fallback handling
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[Database] Running without active database connection until DB is available.');
    }
  }
};

module.exports = connectDB;
