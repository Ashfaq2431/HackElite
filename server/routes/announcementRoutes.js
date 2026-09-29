const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);
router.post('/', protect, authorize('admin', 'hod', 'faculty'), createAnnouncement);
router.put('/:id', protect, updateAnnouncement);
router.delete('/:id', protect, deleteAnnouncement);
router.put('/:id/pin', protect, authorize('admin', 'hod', 'faculty'), togglePin);

module.exports = router;
