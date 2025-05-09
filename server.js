const express = require('express');
const path = require('path');
const cors = require('cors');

// Dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Handle preflight requests
app.options('/api/contact', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).send();
});

// reCAPTCHA verification function
async function verifyRecaptcha(token) {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `secret=6LfBajMrAAAAABkT1c9i5r4vgMt6kXycVNwZkj8S&response=${token}`
    });

    const data = await response.json();
    return data.success && data.score >= 0.5; // Adjust threshold as needed
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Contact form route with reCAPTCHA
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message, recaptchaToken } = req.body;

    if (!name || !email || !message || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, message, and reCAPTCHA token are required fields'
      });
    }

    // Verify reCAPTCHA token
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    const formData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || 'No subject',
      message: message.trim()
    };

    // Google Apps Script Web App URL for email sending
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbwoWX6Gu1Xjnoxvezs5Ye1A1cduRpRFX58Bmk1qpQj6a-sU1I2viO2bjm7fyGLzAhZk/exec';

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const responseText = await response.text();

    try {
      const result = JSON.parse(responseText);

      if (result.result === 'success') {
        return res.status(200).json({
          success: true,
          message: result.message || 'Message sent successfully!'
        });
      }

      return res.status(400).json({
        success: false,
        message: result.message || 'Failed to send message'
      });

    } catch (e) {
      // Not JSON - fallback to checking if it contains "success"
      if (responseText.toLowerCase().includes('success')) {
        return res.status(200).json({
          success: true,
          message: 'Message sent successfully!'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Unexpected response from server: ' + responseText
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

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});