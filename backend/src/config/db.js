const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'campus-date',
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // process.exit 대신 5초 후 재시도 (Render 슬립 해제 후 자동 복구)
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
