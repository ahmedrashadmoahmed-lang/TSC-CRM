require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware الأساسي
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'تم تجاوز عدد الطلبات المسموح بها'
  }
});
app.use('/api/', limiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/companies', require('./src/routes/companies'));
app.use('/api/customers', require('./src/routes/customers'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/invoices', require('./src/routes/invoices'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api/notifications', require('./src/routes/notifications'));
app.use('/api/backup', require('./src/routes/backup'));

// Socket.io for realtime updates
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);
  
  socket.on('join-company', (companyId) => {
    socket.join(companyId);
    console.log(`User ${socket.id} joined company ${companyId}`);
  });
  
  socket.on('invoice-updated', (data) => {
    socket.to(data.companyId).emit('invoice-changed', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🟢 النظام يعمل بشكل طبيعي',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('🔴 Error Stack:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'بيانات غير صالحة',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'معرف غير صالح'
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} موجود مسبقاً`
    });
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'حدث خطأ في الخادم'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '🔍 الرابط غير موجود'
  });
});

// جعل io متاحاً globally
app.set('io', io);

module.exports = { app, server, io };