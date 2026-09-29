const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach io instance to express app so controllers can trigger real-time events
app.set('io', io);

// Socket.io handlers
io.on('connection', (socket) => {
  // Join a personal room for private notifications
  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(userId);
    }
  });

  // Join club room for club updates
  socket.on('join_club', (clubId) => {
    if (clubId) {
      socket.join(`club_${clubId}`);
    }
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static folder for file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date(), app: 'CampusConnect API' });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/discussions', require('./routes/discussionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// 404 Handler for unhandled routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`CampusConnect Server running on port ${PORT}`);
});
