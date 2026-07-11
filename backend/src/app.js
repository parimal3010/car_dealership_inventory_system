require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Car Dealership API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

module.exports = app;
