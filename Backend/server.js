require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Robust CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: false
}));

// Explicit OPTIONS preflight handling
app.options('*', cors());

// Body parsers
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve uploaded static files with open CORS and caching
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    next();
  },
  express.static(uploadsDir)
);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Rhinco Equipments Backend API is running',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

const { saveBase64Image } = require('./utils/saveBase64Image');

// Sample Profile Endpoints
let profiles = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@rhincoequipments.com',
    travelerType: 'Super Admin',
    avatar: ''
  }
];

app.get('/api/profiles', (req, res) => {
  res.json({ success: true, data: profiles });
});

app.post('/api/profiles', async (req, res) => {
  const body = { ...req.body };
  if (body.avatar) {
    body.avatar = await saveBase64Image(body.avatar, 'avatar', 'avatar');
  }
  const newProfile = { _id: String(Date.now()), ...body };
  profiles.push(newProfile);
  res.status(201).json({ success: true, data: newProfile });
});

app.put('/api/profiles/:id?', async (req, res) => {
  const id = req.params.id || '1';
  const body = { ...req.body };
  if (body.avatar) {
    body.avatar = await saveBase64Image(body.avatar, 'avatar', 'avatar');
  }
  const index = profiles.findIndex((p) => p._id === id);
  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...body };
    res.json({ success: true, data: profiles[index] });
  } else {
    const updated = { _id: id, ...body };
    profiles.push(updated);
    res.json({ success: true, data: updated });
  }
});

// Mount Routes
const uploadRoutes = require('./routes/uploadRoutes');
const blogCategoryRoutes = require('./routes/blogCategoryRoutes');
const blogRoutes = require('./routes/blogRoutes');
const teamRoutes = require('./routes/teamRoutes');
const productRoutes = require('./routes/productRoutes');
const machineryRoutes = require('./routes/machineryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');

app.use(['/api/upload', '/upload'], uploadRoutes);
app.use(['/api/blog-categories', '/blog-categories', '/api/categories', '/categories'], blogCategoryRoutes);
app.use(['/api/blogs', '/blogs'], blogRoutes);
app.use(['/api/team', '/team'], teamRoutes);
app.use(['/api/products', '/products'], productRoutes);
app.use(['/api/machinery', '/machinery', '/api/machinery-equipment', '/machinery-equipment'], machineryRoutes);
app.use(['/api/reviews', '/reviews', '/api/review', '/review'], reviewRoutes);
app.use(['/api/enquiries', '/enquiries', '/api/enquiry', '/enquiry'], enquiryRoutes);
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/orders', '/orders'], orderRoutes);
app.use(['/api/addresses', '/addresses'], addressRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Start listening
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================`);
  console.log(`Backend server successfully started!`);
  console.log(`Listening on: http://localhost:${PORT}`);
  console.log(`Listening on: http://127.0.0.1:${PORT}`);
  console.log(`API Blog Categories: http://localhost:${PORT}/api/blog-categories`);
  console.log(`API Blogs: http://localhost:${PORT}/api/blogs`);
  console.log(`========================================`);
});

module.exports = app;
