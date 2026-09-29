const express = require('express');
const router = express.Router();
const {
  getAllResources,
  createResource,
  downloadResource,
  deleteResource,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');

router.get('/', getAllResources);
router.post('/', protect, createResource);
router.post('/:id/download', downloadResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
