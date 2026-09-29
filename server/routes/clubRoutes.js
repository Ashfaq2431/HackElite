const express = require('express');
const router = express.Router();
const {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  requestToJoinClub,
  handleJoinRequest,
  leaveClub,
  removeMember,
} = require('../controllers/clubController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllClubs);
router.get('/:id', getClubById);
router.post('/', protect, createClub);
router.put('/:id', protect, updateClub);
router.delete('/:id', protect, deleteClub);
router.post('/:id/join', protect, requestToJoinClub);
router.put('/:id/requests/:requestId', protect, handleJoinRequest);
router.post('/:id/leave', protect, leaveClub);
router.delete('/:id/members/:memberId', protect, removeMember);

module.exports = router;
