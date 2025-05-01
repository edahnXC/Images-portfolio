const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

// Enable trust proxy for Render.com
app.set('trust proxy', 1);

// Configuration
const PORT = process.env.PORT || 5500;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "data:"],
            imgSrc: ["'self'", "data:", "https://via.placeholder.com"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    }
}));

app.use(cors({
    origin: NODE_ENV === 'development' ? '*' : ['https://images-portfolio-wp42.onrender.com'],
    methods: ['GET', 'HEAD', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Performance Middleware
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }
    
    const accessLogStream = fs.createWriteStream(
        path.join(logsDir, 'access.log'),
        { flags: 'a' }
    );
    app.use(morgan('combined', { stream: accessLogStream }));
}

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', apiLimiter);

// Static Files
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Ensure public/images directory exists
const IMAGE_DIR = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
    console.log(`Created images directory at ${IMAGE_DIR}`);
}

// API Endpoints
app.get('/api/images', async (req, res) => {
    try {
        const files = await fs.promises.readdir(IMAGE_DIR);
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        
        const images = files
            .filter(file => validExtensions.includes(path.extname(file).toLowerCase()))
            .map(file => {
                const filePath = path.join(IMAGE_DIR, file);
                const stats = fs.statSync(filePath);
                
                return {
                    filename: file,
                    url: `/images/${file}`,
                    alt: path.parse(file).name.replace(/[-_]/g, ' '),
                    timestamp: stats.mtime.toISOString(),
                    size: stats.size
                };
            });
        
        if (!images.length) {
            return res.status(404).json({
                success: false,
                message: 'No images found in the gallery',
                suggestion: 'Upload images to the public/images directory'
            });
        }

        // Sort by newest first
        const sortedImages = images.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        res.json({
            success: true,
            count: sortedImages.length,
            totalSize: sortedImages.reduce((sum, img) => sum + img.size, 0),
            images: sortedImages
        });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to load gallery'
        });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        environment: NODE_ENV,
        uptime: process.uptime(),
        imagesDirectory: IMAGE_DIR,
        imagesCount: fs.readdirSync(IMAGE_DIR).length
    });
});

// SPA Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server Startup
const server = app.listen(PORT, () => {
    console.log(`
    Server running in ${NODE_ENV} mode
    Local: http://localhost:${PORT}
    Images directory: ${IMAGE_DIR}
    Images available: ${fs.readdirSync(IMAGE_DIR).length}
    `);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('\nSIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received. Shutting down...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});