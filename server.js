// Updated server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Enable CORS with specific options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API proxy endpoint to avoid CORS issues
app.post('/api/contact', async (req, res) => {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbyd6qI8SDRfaxoyah7GW26a3045t4ExgEa1VO_GtbIV4o5lOz38a-wNKcA2YdrjUwUi/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});