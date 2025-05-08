const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    // Validate request
    if (!req.body.name || !req.body.email || !req.body.message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Prepare data for Google Apps Script
    const formData = {
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      subject: req.body.subject?.trim() || 'No subject',
      message: req.body.message.trim()
    };

    // Send to Google Apps Script
    const response = await fetch('https://script.google.com/macros/s/AKfycbz1aVncg6ajX6Nv36kDho2o0X9Btp3-SK6LNuAW2o7mwzkgzsAE84q0LTORjq2CKlpF/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    // Parse response
    const result = await response.json();

    // Forward response to client
    if (result.result === 'success') {
      res.json({
        success: true,
        message: result.message || 'Message sent successfully!'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Failed to send message'
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Handle preflight requests
app.options('*', cors());

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});