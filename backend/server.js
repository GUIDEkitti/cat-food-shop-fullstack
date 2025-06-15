// File: backend/server.js
const express = require('express');
const cors = require('cors');

// Import routes ทั้งหมด
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const sellerRoutes = require('./routes/seller');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware ที่ใช้แบบ Global มีแค่ cors
app.use(cors());

// --- ไม่มีการใช้ app.use(bodyParser.json()) หรือ app.use(express.json()) ที่นี่อีกต่อไป ---

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send(`Cat Food Shop API is running on port ${PORT}`);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});