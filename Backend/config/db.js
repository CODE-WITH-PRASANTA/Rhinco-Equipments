const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rhinco_equipments';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Initial Connection Error: ${error.message}`);
  }

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB Runtime Error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB Disconnected. Automatic reconnection in progress...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB Reconnected successfully.');
  });
};

module.exports = connectDB;
