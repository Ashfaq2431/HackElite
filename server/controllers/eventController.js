const Event = require('../models/Event');
const Club = require('../models/Club');
const Notification = require('../models/Notification');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const { category, filter, clubId, search } = req.query;
    let query = {};

    let userRole = null;
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretcampusconnectkey2026');
        const u = await User.findById(decoded.id);
        if (u) {
          userRole = u.role;
          userId = u._id;
        }
      } catch (e) {}
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (clubId) {
      query.club = clubId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'upcoming') {
      query.date = { $gte: today };
    } else if (filter === 'past') {
      query.date = { $lt: today };
    }

    if (req.query.department && req.query.department !== 'All') {
      query.$or = [{ department: 'All Departments' }, { department: req.query.department }];
    }

    // Role-based event visibility:
    // Students only ever see approved events.
    // HOD and Admin can see all or filter by req.query.approvalStatus.
    // Faculty can see approved events + events they created.
    if (req.query.approvalStatus) {
      query.approvalStatus = req.query.approvalStatus;
    } else if (userRole === 'student' || !userRole) {
      query.approvalStatus = 'approved';
    } else if (userRole === 'faculty') {
      query.$or = [{ approvalStatus: 'approved' }, { createdBy: userId }];
    }

    const events = await Event.find(query)
      .populate('club', 'name category logo facultyInCharge')
      .populate('createdBy', 'name email avatar department')
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name category logo lead officers description')
      .populate('createdBy', 'name email avatar department')
      .populate('registeredUsers.user', 'name email avatar department year studentId');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Club Lead, Faculty, Admin, HOD)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      club,
      category,
      description,
      date,
      startTime,
      endTime,
      venue,
      isOnline,
      meetingLink,
      capacity,
      bannerImage,
      tags,
      speakers,
      allowedAudience,
    } = req.body;

    let clubDoc = null;
    if (club) {
      clubDoc = await Club.findById(club);
      if (!clubDoc) {
        return res.status(404).json({ success: false, message: 'Selected club not found' });
      }
    }

    // Role-specific creation constraints
    if (req.user.role === 'faculty') {
      if (!clubDoc) {
        return res.status(400).json({
          success: false,
          message: 'Faculty can only create events for clubs where they are assigned as Faculty-in-Charge. Please select a club.',
        });
      }
      const isFacultyInCharge = clubDoc.facultyInCharge && clubDoc.facultyInCharge.toString() === req.user._id.toString();
      if (!isFacultyInCharge) {
        return res.status(403).json({
          success: false,
          message: `You are not assigned as Faculty-in-Charge for "${clubDoc.name}". Only the Faculty-in-Charge can create club events.`,
        });
      }
    } else if (req.user.role === 'student') {
      if (!clubDoc) {
        return res.status(400).json({ success: false, message: 'Students can only propose events associated with their club' });
      }
      const isLead = clubDoc.lead.toString() === req.user._id.toString();
      const isOfficer = clubDoc.officers?.some((o) => o.toString() === req.user._id.toString());
      if (!isLead && !isOfficer) {
        return res.status(403).json({ success: false, message: 'Only club leaders or officers can organize club events' });
      }
    }

    // Determine approval status:
    // Events created by Faculty or Students require HOD approval before students can see them.
    // Events created by HOD or Admin are approved immediately.
    const isHodOrAdmin = req.user.role === 'hod' || req.user.role === 'admin';
    const approvalStatus = isHodOrAdmin ? 'approved' : 'pending_approval';

    const event = await Event.create({
      title,
      club: club || null,
      createdBy: req.user._id,
      category,
      description,
      date,
      startTime,
      endTime,
      venue,
      isOnline: Boolean(isOnline),
      meetingLink,
      capacity: Number(capacity) || 0,
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : ['Campus']),
      speakers: speakers || [],
      department: req.user.department || 'All Departments',
      approvalStatus,
      allowedAudience: allowedAudience === 'club_members_only' ? 'club_members_only' : 'all',
    });

    // Notify HOD if pending approval
    if (approvalStatus === 'pending_approval') {
      const hods = await User.find({ role: 'hod' });
      for (const hod of hods) {
        await Notification.create({
          recipient: hod._id,
          sender: req.user._id,
          title: 'New Club Event Pending Approval ⏳',
          message: `${req.user.name} submitted club event "${event.title}" for your approval.`,
          type: 'event',
          link: '/hod/events',
        });
      }
    }

    // Real-time broadcast if approved
    if (approvalStatus === 'approved') {
      const io = req.app.get('io');
      if (io) {
        io.emit('new_event', {
          title: event.title,
          id: event._id,
          category: event.category,
          date: event.date,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: approvalStatus === 'pending_approval'
        ? 'Event submitted to HOD for approval. Once approved, it will be published to students.'
        : 'Event published successfully',
      event,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Creator or Admin)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    Object.assign(event, req.body);
    await event.save();

    res.status(200).json({ success: true, message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Creator or Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Event removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register for event (RSVP)
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can register to attend events. Faculty and HOD members serve in coordinating/hosting roles.',
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify event is approved
    if (event.approvalStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'This event has not yet been approved by the department HOD.' });
    }

    // Check allowedAudience
    if (event.allowedAudience === 'club_members_only' && event.club) {
      const clubDoc = await Club.findById(event.club);
      const isClubMember = clubDoc && clubDoc.members.some((m) => m.user.toString() === req.user._id.toString());
      if (!isClubMember) {
        return res.status(403).json({
          success: false,
          message: `Participation in this event is restricted to registered members of ${clubDoc?.name || 'this club'}. Please join the club first.`,
        });
      }
    }

    // Check if already registered
    const alreadyRegistered = event.registeredUsers.some(
      (r) => r.user.toString() === req.user._id.toString() && r.status !== 'cancelled'
    );
    if (alreadyRegistered) {
      return res.status(400).json({ success: false, message: 'You have already registered for this event' });
    }

    // Check capacity limit
    const activeRegistrations = event.registeredUsers.filter((r) => r.status !== 'cancelled').length;
    if (event.capacity > 0 && activeRegistrations >= event.capacity) {
      return res.status(400).json({ success: false, message: 'This event has reached full capacity' });
    }

    const ticketId = 'CC-TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    event.registeredUsers.push({
      user: req.user._id,
      ticketId,
      registeredAt: new Date(),
      status: 'registered',
    });

    await event.save();

    // Create notification for attendee
    await Notification.create({
      recipient: req.user._id,
      sender: event.createdBy,
      title: 'Event Registration Confirmed 🎟️',
      message: `Your pass for "${event.title}" has been issued. Ticket ID: ${ticketId}`,
      type: 'event',
      link: `/events/${event._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Registration successful! Your pass is ready.',
      ticketId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel registration
// @route   POST /api/events/:id/cancel
// @access  Private
exports.cancelRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const regIndex = event.registeredUsers.findIndex(
      (r) => r.user.toString() === req.user._id.toString() && r.status !== 'cancelled'
    );

    if (regIndex === -1) {
      return res.status(400).json({ success: false, message: 'You are not registered for this event' });
    }

    event.registeredUsers.splice(regIndex, 1);
    await event.save();

    res.status(200).json({ success: true, message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check-in attendee
// @route   PUT /api/events/:id/attendees/:ticketId/checkin
// @access  Private (Creator/Admin)
exports.checkInAttendee = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const attendee = event.registeredUsers.find((r) => r.ticketId === req.params.ticketId);
    if (!attendee) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    attendee.status = attendee.status === 'attended' ? 'registered' : 'attended';
    await event.save();

    res.status(200).json({ success: true, message: `Attendee status updated to ${attendee.status}`, attendee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    HOD / Admin review event approval
// @route   PUT /api/events/:id/approval
// @access  Private (HOD/Admin)
exports.approveEvent = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role === 'hod' && event.department !== 'All Departments' && event.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Not authorized to moderate other department events' });
    }

    event.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    await event.save();

    res.status(200).json({ success: true, message: `Event has been ${event.approvalStatus}`, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
