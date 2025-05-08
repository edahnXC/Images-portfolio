const express = require('express');
const path = require('path');
const cors = require('cors');

// Dynamically import node-fetch to avoid ESM issue
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

// Enable CORS for all origins and methods
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ======= CONTACT FORM PROXY =======
app.post('/api/contact', async (req, res) => {
  try {
    // First validate the request
    if (!req.body.name || !req.body.email || !req.body.message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and message are required' 
      });
    }

    // Send to Google Apps Script
    const response = await fetch('https://script.google.com/macros/s/AKfycbz1aVncg6ajX6Nv36kDho2o0X9Btp3-SK6LNuAW2o7mwzkgzsAE84q0LTORjq2CKlpF/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    // Handle Google Apps Script response
    const result = await response.text(); // First get as text to handle possible non-JSON response
    
    try {
      const jsonResult = JSON.parse(result);
      if (jsonResult.result === 'success') {
        return res.json({ success: true, message: 'Message sent successfully!' });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: jsonResult.message || 'Failed to process your message' 
        });
      }
    } catch (e) {
      // If response isn't JSON, check for success text
      if (result.includes('success')) {
        return res.json({ success: true, message: 'Message sent successfully!' });
      }
      return res.status(500).json({ 
        success: false, 
        message: 'Unexpected response from server' 
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error: ' + error.message 
    });
  }
});

// Handle preflight requests
app.options('*', cors());

// ======= SPA fallback =======
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something broke!' });
});

// Start the server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});