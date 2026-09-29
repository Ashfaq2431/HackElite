const express = require('express');
const router = express.Router();
const {
  getAllDiscussions,
  getDiscussionById,
  createDiscussion,
  replyDiscussion,
  upvoteDiscussion,
  acceptAnswer,
  deleteDiscussion,
} = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

router.get('/', getAllDiscussions);
router.get('/:id', getDiscussionById);
router.post('/', protect, createDiscussion);
router.post('/:id/replies', protect, replyDiscussion);
router.post('/:id/upvote', protect, upvoteDiscussion);
router.put('/:id/replies/:replyId/accept', protect, acceptAnswer);
router.delete('/:id', protect, deleteDiscussion);

module.exports = router;
