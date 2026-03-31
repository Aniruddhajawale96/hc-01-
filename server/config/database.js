import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  const maxRetries = 5;
  const retryDelay = 2000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
      });
      
      console.log(`MongoDB Connected: ${conn.connection.host} (Attempt ${i + 1})`);
      
      // Connection monitoring
      conn.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
      });
      
      conn.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });
      
      conn.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err.message);
      });
      
      return conn;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, error.message);
      
      if (i === maxRetries - 1) {
        console.error('💥 All connection attempts failed. Exiting...');
        process.exit(1);
        return;
      }
      
      console.log(`⏳ Retrying in ${retryDelay}ms... (Attempt ${i + 2}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

export default connectDB;

