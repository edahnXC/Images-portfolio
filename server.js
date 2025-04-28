const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD'],
  allowedHeaders: ['Content-Type']
}));

// Static files with cache control
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Image endpoint with improved error handling
app.get('/api/images', async (req, res) => {
  try {
    const imagesDir = path.join(__dirname, 'public', 'images');
    
    // Create images directory if it doesn't exist
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      
      // Add a sample image if directory was just created
      const sampleImagePath = path.join(imagesDir, 'sample.jpg');
      if (!fs.existsSync(sampleImagePath)) {
        // Create a proper sample image by copying from a source
        const sampleSource = path.join(__dirname, 'sample.jpg');
        if (fs.existsSync(sampleSource)) {
          fs.copyFileSync(sampleSource, sampleImagePath);
        } else {
          // If no sample source exists, create an empty file (fallback)
          fs.writeFileSync(sampleImagePath, '');
        }
      }
    }

    const files = await fs.promises.readdir(imagesDir);
    
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return validExtensions.includes(ext);
      })
      .map(file => ({
        filename: file,
        alt: path.parse(file).name.replace(/[-_]/g, ' '),
        path: `/images/${file}`
      }));

    if (images.length === 0) {
      return res.status(200).json({
        images: [{
          filename: 'sample.jpg',
          alt: 'Sample image',
          path: '/images/sample.jpg'
        }],
        message: 'No images found, serving sample placeholder'
      });
    }

    res.json({ images });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Port configuration with fallback
const PORT = process.env.PORT || 5500;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  process.exit(1);
});