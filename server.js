const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

// Middleware setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint
app.post('/api/contact', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.email || !req.body.message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and message are required' 
      });
    }

    // Prepare data
    const formData = {
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      subject: req.body.subject?.trim() || 'No subject',
      message: req.body.message.trim()
    };

    // Send to Google Apps Script
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyjNr-a1DOWhjY_gcFjJtyf2cPh7gc3WnlFeA0ODAbibEDx9-VNwzNWc6IMq7HUXn5J/exec';
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    // Handle response
    const textResponse = await response.text();
    let result;
    
    try {
      result = JSON.parse(textResponse);
    } catch (e) {
      console.error('Failed to parse response:', textResponse);
      throw new Error('Invalid response from server');
    }

    if (result.result === 'success') {
      return res.json({ 
        success: true, 
        message: result.message || 'Message sent successfully!' 
      });
    }

    return res.status(400).json({ 
      success: false, 
      message: result.message || 'Failed to send message' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

// Handle preflight requests
app.options('/api/contact', cors());

// All other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});