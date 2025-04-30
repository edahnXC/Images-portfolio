const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// CORS configuration
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

// Ensure public/images directory exists
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('Created images directory at:', imagesDir);
}

// Image endpoint
app.get('/api/images', async (req, res) => {
  try {
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

    // If no images, create a sample message
    if (images.length === 0) {
      return res.json({ 
        images: [{
          path: 'https://via.placeholder.com/800x600?text=Add+images+to+public/images',
          alt: 'No images found in public/images folder'
        }],
        message: 'No images found in public/images folder'
      });
    }

    res.json({ images });
  } catch (error) {
    console.error('Error loading images:', error);
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

// Serve SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Port configuration
const PORT = process.env.PORT || 5500;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Images directory: ${imagesDir}`);
}).on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  process.exit(1);
});