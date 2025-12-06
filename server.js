const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. Load Env Vars FIRST
dotenv.config();

const app = express();

// 2. Enable CORS immediately (Allow Frontend)
app.use(cors({
  origin: 'http://localhost:5173', // Allow your Vite Frontend
  credentials: true
}));

// 3. Parse JSON bodies
app.use(express.json());

// 4. Import Routes
const talentRoutes = require('./routes/talentRoutes'); 
const connectDB = require('./config/db');

// 5. Connect DB
connectDB();

// 6. Use Routes
app.use('/api/talent', talentRoutes);

// 7. Test Route
app.get('/', (req, res) => {
  res.send('GenSquad API is running...');
});

// 8. Global Error Handler (Fixes the [object Object] issue)
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR HANDLER:", err); // This prints the real error
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});