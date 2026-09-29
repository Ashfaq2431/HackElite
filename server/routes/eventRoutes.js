const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  checkInAttendee,
  approveEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', protect, authorize('admin', 'hod', 'faculty', 'student'), createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.put('/:id/approval', protect, authorize('admin', 'hod'), approveEvent);
router.post('/:id/register', protect, registerForEvent);
router.post('/:id/cancel', protect, cancelRegistration);
router.put('/:id/attendees/:ticketId/checkin', protect, checkInAttendee);

module.exports = router;
