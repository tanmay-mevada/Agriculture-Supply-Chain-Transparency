const express = require('express');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const fabricService = require('../services/fabricService');
const ipfsService = require('../services/ipfsService');
const { validateProduct, validateSupplyChainStep } = require('../middleware/validation');

const router = express.Router();

// Initialize Fabric service
fabricService.initialize().catch(console.error);

// Create a new product
router.post('/', validateProduct, async (req, res) => {
  try {
    const productData = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(JSON.stringify({
      productId: productData.id,
      batchNumber: productData.batchNumber,
      farmerID: productData.farmerID
    }));
    
    productData.qrCode = qrCodeData;

    // Store product metadata in IPFS if certificates are provided
    if (productData.certifications && productData.certifications.length > 0) {
      const ipfsHash = await ipfsService.addToIPFS(JSON.stringify({
        productId: productData.id,
        certifications: productData.certifications,
        metadata: productData.metadata || {}
      }));
      productData.ipfsHash = ipfsHash;
    }

    await fabricService.createProduct(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: productData
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await fabricService.getProduct(req.params.id);
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(404).json({
      success: false,
      message: 'Product not found',
      error: error.message
    });
  }
});

// Update product status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, location, actor } = req.body;
    
    if (!status || !actor) {
      return res.status(400).json({
        success: false,
        message: 'Status and actor are required'
      });
    }

    await fabricService.updateProductStatus(req.params.id, status, location, actor);

    res.json({
      success: true,
      message: 'Product status updated successfully'
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status',
      error: error.message
    });
  }
});

// Add supply chain step
router.post('/:id/steps', validateSupplyChainStep, async (req, res) => {
  try {
    const stepData = {
      ...req.body,
      timestamp: new Date().toISOString()
    };

    await fabricService.addSupplyChainStep(req.params.id, stepData);

    res.status(201).json({
      success: true,
      message: 'Supply chain step added successfully'
    });
  } catch (error) {
    console.error('Error adding supply chain step:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add supply chain step',
      error: error.message
    });
  }
});

// Get product history/traceability
router.get('/:id/history', async (req, res) => {
  try {
    const history = await fabricService.getProductHistory(req.params.id);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting product history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product history',
      error: error.message
    });
  }
});

// Get products by farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const products = await fabricService.queryProductsByFarmer(req.params.farmerId);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error getting products by farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products by farmer',
      error: error.message
    });
  }
});

// Generate QR code for product
router.get('/:id/qr', async (req, res) => {
  try {
    const product = await fabricService.getProduct(req.params.id);
    
    const qrData = {
      productId: product.id,
      batchNumber: product.batchNumber,
      farmerID: product.farmerID,
      name: product.name,
      traceabilityUrl: `${req.protocol}://${req.get('host')}/api/v1/products/${product.id}/history`
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    
    res.json({
      success: true,
      data: {
        qrCode,
        qrData
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
});

module.exports = router;