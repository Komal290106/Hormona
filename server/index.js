require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────
// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://localhost:4173',
//   ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     // Allow requests with no origin (server-to-server, curl, Postman)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
//       callback(null, true);
//     } else {
//       callback(new Error(`CORS: origin ${origin} not allowed`));
//     }
//   },
//   credentials: true,
// }));
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/users', require('./routes/users'));
app.use('/api/logs',  require('./routes/logs'));
app.use('/api/simulate', require('./routes/simulate'));
app.use('/api/chat', require('./routes/chat'));

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── MongoDB + Listen ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    app.listen(PORT, () => {
      console.log(`⚠️ Server started WITHOUT DB on port ${PORT}`);
    });
  });
