const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const talentRoutes = require('./routes/talentRoutes'); 
const connectDB = require('./config/db');
const workflowRoutes = require('./routes/workflowRoutes');

dotenv.config();
connectDB();

const app = express();

// ✅ UNIVERSAL CORS FIX
// allowing origin: '*' allows ANY frontend to connect. 
// Great for development/testing.
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/talent', talentRoutes);

app.get('/', (req, res) => {
  res.send('GenSquad API is running...');
});

// ✅ Add Workflow Routes
app.use('/api/workflows', workflowRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});