const Discussion = require('../models/Discussion');
const Notification = require('../models/Notification');

// @desc    Get all discussions
// @route   GET /api/discussions
// @access  Public
exports.getAllDiscussions = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sortCriteria = { isPinned: -1, createdAt: -1 };
    if (sort === 'popular') {
      sortCriteria = { isPinned: -1, upvotes: -1, createdAt: -1 };
    } else if (sort === 'replies') {
      sortCriteria = { 'replies.length': -1, createdAt: -1 };
    }

    const discussions = await Discussion.find(query)
      .populate('author', 'name email avatar department role')
      .populate('replies.author', 'name avatar role')
      .sort(sortCriteria);

    res.status(200).json({ success: true, count: discussions.length, discussions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single discussion by ID
// @route   GET /api/discussions/:id
// @access  Public
exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name email avatar department role bio')
      .populate('replies.author', 'name email avatar department role');

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    discussion.views += 1;
    await discussion.save();

    res.status(200).json({ success: true, discussion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create discussion
// @route   POST /api/discussions
// @access  Private
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const discussion = await Discussion.create({
      title,
      content,
      author: req.user._id,
      category: category || 'General Campus',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : ['Discussion']),
    });

    const populatedDiscussion = await Discussion.findById(discussion._id).populate('author', 'name avatar department role');

    res.status(201).json({ success: true, message: 'Discussion started', discussion: populatedDiscussion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply to discussion
// @route   POST /api/discussions/:id/replies
// @access  Private
exports.replyDiscussion = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty' });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    discussion.replies.push({
      author: req.user._id,
      content,
      createdAt: new Date(),
    });

    await discussion.save();

    // Notify discussion author if different user
    if (discussion.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: discussion.author,
        sender: req.user._id,
        title: 'New Reply on Discussion',
        message: `${req.user.name} replied to "${discussion.title.substring(0, 40)}..."`,
        type: 'discussion',
        link: `/discussions/${discussion._id}`,
      });
    }

    const updatedDiscussion = await Discussion.findById(req.params.id)
      .populate('author', 'name email avatar department role')
      .populate('replies.author', 'name email avatar department role');

    res.status(201).json({ success: true, message: 'Reply added successfully', discussion: updatedDiscussion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upvote / remove upvote for discussion
// @route   POST /api/discussions/:id/upvote
// @access  Private
exports.upvoteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const userIndex = discussion.upvotes.findIndex((id) => id.toString() === req.user._id.toString());
    let upvoted = false;

    if (userIndex === -1) {
      discussion.upvotes.push(req.user._id);
      upvoted = true;
    } else {
      discussion.upvotes.splice(userIndex, 1);
    }

    await discussion.save();

    res.status(200).json({
      success: true,
      upvotesCount: discussion.upvotes.length,
      upvoted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark reply as accepted solution
// @route   PUT /api/discussions/:id/replies/:replyId/accept
// @access  Private
exports.acceptAnswer = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    if (discussion.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only author can mark an accepted solution' });
    }

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    // Toggle accept
    reply.isAcceptedAnswer = !reply.isAcceptedAnswer;
    await discussion.save();

    res.status(200).json({ success: true, message: 'Accepted status updated', isAccepted: reply.isAcceptedAnswer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete discussion
// @route   DELETE /api/discussions/:id
// @access  Private
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const isAuthor = discussion.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this discussion' });
    }

    await Discussion.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Discussion deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
