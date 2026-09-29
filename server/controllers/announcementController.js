const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
exports.getAllAnnouncements = async (req, res) => {
  try {
    const { category, priority, department, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (department && department !== 'All') {
      query.$or = [{ department: 'All Departments' }, { department: department }];
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'name email role avatar department')
      .populate('club', 'name logo')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single announcement by ID
// @route   GET /api/announcements/:id
// @access  Public
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'name email role avatar department bio')
      .populate('club', 'name logo');

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Increment views
    announcement.views += 1;
    await announcement.save();

    res.status(200).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin, Faculty, Club Lead)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, priority, targetAudience, department, attachments, isPinned, club } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      author: req.user._id,
      category: category || 'General',
      priority: priority || 'Normal',
      targetAudience: targetAudience || 'All',
      department: department || 'All Departments',
      attachments: attachments || [],
      isPinned: Boolean(isPinned),
      club: club || null,
    });

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('new_announcement', {
        id: announcement._id,
        title: announcement.title,
        priority: announcement.priority,
        category: announcement.category,
        author: req.user.name,
      });
    }

    res.status(201).json({ success: true, message: 'Announcement published successfully', announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Author or Admin)
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const isAuthor = announcement.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this notice' });
    }

    Object.assign(announcement, req.body);
    await announcement.save();

    res.status(200).json({ success: true, message: 'Announcement updated successfully', announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Author or Admin)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const isAuthor = announcement.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this notice' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle pin announcement
// @route   PUT /api/announcements/:id/pin
// @access  Private (Admin or Faculty)
exports.togglePin = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: announcement.isPinned ? 'Announcement pinned to top' : 'Announcement unpinned',
      isPinned: announcement.isPinned,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
