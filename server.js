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

// Ensure public/images directory exists
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('Created images directory at:', imagesDir);
}

// Image endpoint with improved error handling
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

    // If no images, create a sample image
    if (images.length === 0) {
      const sampleImagePath = path.join(imagesDir, 'sample.jpg');
      if (!fs.existsSync(sampleImagePath)) {
        // Create a simple placeholder image
        const placeholderText = 'Add your images to public/images folder';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
          <rect width="800" height="600" fill="#6c5ce7"/>
          <text x="400" y="300" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${placeholderText}</text>
        </svg>`;
        fs.writeFileSync(sampleImagePath, svg);
        images.push({
          filename: 'sample.jpg',
          alt: 'Sample placeholder image',
          path: '/images/sample.jpg'
        });
      }
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
  console.log(`Images directory: ${imagesDir}`);
}).on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  process.exit(1);
});