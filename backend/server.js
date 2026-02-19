require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const postRoutes = require('./src/routes/posts');
const chatRoutes = require('./src/routes/chat');
const reportRoutes = require('./src/routes/reports');
const adminRoutes = require('./src/routes/admin');
const { initSocket } = require('./src/socket/chatSocket');
const { generalLimiter } = require('./src/middleware/rateLimiter');

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(o => o.trim());
const corsOrigin = allowedOrigins.includes('*') ? true : allowedOrigins;

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// Logging & parsing
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global rate limiting
app.use('/api', generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || '서버 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Initialize Socket.io
initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
