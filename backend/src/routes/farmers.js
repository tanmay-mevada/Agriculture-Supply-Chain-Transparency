const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fabricService = require('../services/fabricService');
const { validateFarmer } = require('../middleware/validation');

const router = express.Router();

// Create a new farmer
router.post('/', validateFarmer, async (req, res) => {
  try {
    const farmerData = {
      id: uuidv4(),
      ...req.body,
      verified: false,
      createdAt: new Date().toISOString()
    };

    await fabricService.createFarmer(farmerData);

    res.status(201).json({
      success: true,
      message: 'Farmer created successfully',
      data: farmerData
    });
  } catch (error) {
    console.error('Error creating farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create farmer',
      error: error.message
    });
  }
});

// Get farmer by ID
router.get('/:id', async (req, res) => {
  try {
    const farmer = await fabricService.getFarmer(req.params.id);
    
    res.json({
      success: true,
      data: farmer
    });
  } catch (error) {
    console.error('Error getting farmer:', error);
    res.status(404).json({
      success: false,
      message: 'Farmer not found',
      error: error.message
    });
  }
});

module.exports = router;