const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const multer = require('multer');
const { create } = require('ipfs-http-client');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/ipfs-service.log' })
  ]
});

// Configure IPFS client
const ipfs = create({
  host: process.env.IPFS_HOST || 'localhost',
  port: process.env.IPFS_PORT || 5001,
  protocol: process.env.IPFS_PROTOCOL || 'http'
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow specific file types for certificates
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/json',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check IPFS node status
    const nodeInfo = await ipfs.id();
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      ipfs: {
        id: nodeInfo.id,
        agentVersion: nodeInfo.agentVersion,
        protocolVersion: nodeInfo.protocolVersion
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'Service Unavailable',
      error: 'IPFS node unreachable'
    });
  }
});

// Upload file to IPFS
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { originalname, mimetype, buffer } = req.file;
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

    // Add file to IPFS
    const result = await ipfs.add({
      path: originalname,
      content: buffer
    });

    // Add metadata to IPFS
    const metadataWithFile = {
      id: uuidv4(),
      filename: originalname,
      mimetype,
      size: buffer.length,
      hash: result.cid.toString(),
      uploadedAt: new Date().toISOString(),
      ...metadata
    };

    const metadataResult = await ipfs.add({
      path: `${result.cid.toString()}.metadata.json`,
      content: JSON.stringify(metadataWithFile, null, 2)
    });

    logger.info('File uploaded to IPFS:', {
      filename: originalname,
      hash: result.cid.toString(),
      metadataHash: metadataResult.cid.toString()
    });

    res.status(200).json({
      success: true,
      data: {
        hash: result.cid.toString(),
        metadataHash: metadataResult.cid.toString(),
        filename: originalname,
        size: buffer.length,
        uploadedAt: metadataWithFile.uploadedAt
      }
    });
  } catch (error) {
    logger.error('File upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file to IPFS',
      error: error.message
    });
  }
});

// Upload JSON data to IPFS
app.post('/upload-json', async (req, res) => {
  try {
    const { data, filename } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'No data provided'
      });
    }

    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const name = filename || `data-${uuidv4()}.json`;

    const result = await ipfs.add({
      path: name,
      content: content
    });

    logger.info('JSON data uploaded to IPFS:', {
      filename: name,
      hash: result.cid.toString()
    });

    res.status(200).json({
      success: true,
      data: {
        hash: result.cid.toString(),
        filename: name,
        size: content.length,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('JSON upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload JSON to IPFS',
      error: error.message
    });
  }
});

// Retrieve file from IPFS
app.get('/file/:hash', async (req, res) => {
  try {
    const { hash } = req.params;

    // Get file from IPFS
    const chunks = [];
    for await (const chunk of ipfs.cat(hash)) {
      chunks.push(chunk);
    }

    const content = Buffer.concat(chunks);

    // Try to get metadata
    let metadata = null;
    try {
      const metadataChunks = [];
      for await (const chunk of ipfs.cat(`${hash}.metadata.json`)) {
        metadataChunks.push(chunk);
      }
      metadata = JSON.parse(Buffer.concat(metadataChunks).toString());
    } catch (error) {
      // Metadata not found, continue without it
    }

    // Set appropriate headers
    if (metadata && metadata.mimetype) {
      res.set('Content-Type', metadata.mimetype);
    }

    if (metadata && metadata.filename) {
      res.set('Content-Disposition', `inline; filename="${metadata.filename}"`);
    }

    res.send(content);
  } catch (error) {
    logger.error('File retrieval failed:', error);
    res.status(404).json({
      success: false,
      message: 'File not found',
      error: error.message
    });
  }
});

// Get file metadata
app.get('/metadata/:hash', async (req, res) => {
  try {
    const { hash } = req.params;

    const chunks = [];
    for await (const chunk of ipfs.cat(`${hash}.metadata.json`)) {
      chunks.push(chunk);
    }

    const metadata = JSON.parse(Buffer.concat(chunks).toString());

    res.status(200).json({
      success: true,
      data: metadata
    });
  } catch (error) {
    logger.error('Metadata retrieval failed:', error);
    res.status(404).json({
      success: false,
      message: 'Metadata not found',
      error: error.message
    });
  }
});

// Pin file to ensure it stays available
app.post('/pin/:hash', async (req, res) => {
  try {
    const { hash } = req.params;

    await ipfs.pin.add(hash);

    logger.info('File pinned:', { hash });

    res.status(200).json({
      success: true,
      message: 'File pinned successfully',
      hash
    });
  } catch (error) {
    logger.error('File pinning failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pin file',
      error: error.message
    });
  }
});

// List pinned files
app.get('/pins', async (req, res) => {
  try {
    const pins = [];
    for await (const pin of ipfs.pin.ls()) {
      pins.push({
        hash: pin.cid.toString(),
        type: pin.type
      });
    }

    res.status(200).json({
      success: true,
      data: pins
    });
  } catch (error) {
    logger.error('Failed to list pins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list pinned files',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`IPFS Storage Service running on port ${PORT}`);
  console.log(`IPFS Storage Service running on port ${PORT}`);
});

module.exports = app;