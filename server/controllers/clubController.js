const Club = require('../models/Club');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
exports.getAllClubs = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    // By default, public list shows active clubs unless status specified
    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const clubs = await Club.find(query)
      .populate('lead', 'name email avatar department')
      .populate('facultyInCharge', 'name email avatar department')
      .populate('members.user', 'name avatar department')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: clubs.length, clubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single club by ID
// @route   GET /api/clubs/:id
// @access  Public
exports.getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('lead', 'name email avatar department bio socialLinks')
      .populate('facultyInCharge', 'name email avatar department bio')
      .populate('officers', 'name email avatar department')
      .populate('members.user', 'name email avatar department skills year')
      .populate('joinRequests.user', 'name email avatar department year');

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    res.status(200).json({ success: true, club });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a club
// @route   POST /api/clubs
// @access  Private
exports.createClub = async (req, res) => {
  try {
    const { name, category, description, mission, logo, bannerImage, meetingSchedule, venueOrRoom, socialLinks, facultyInCharge, lead } = req.body;

    const existingClub = await Club.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingClub) {
      return res.status(400).json({ success: false, message: 'A club with this name already exists' });
    }

    // Admins, HODs, and club_admins create active clubs immediately; students create pending_approval
    const clubStatus = req.user.role === 'admin' || req.user.role === 'hod' || req.user.role === 'club_admin' ? 'active' : 'pending_approval';

    const assignedLead = lead || req.user._id;

    const club = await Club.create({
      name,
      category,
      description,
      mission,
      logo: logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
      lead: assignedLead,
      facultyInCharge: facultyInCharge || null,
      meetingSchedule: meetingSchedule || 'Weekly sessions',
      venueOrRoom: venueOrRoom || 'Campus Hall',
      socialLinks: socialLinks || {},
      status: clubStatus,
      members: [
        {
          user: assignedLead,
          role: 'lead',
          joinedAt: new Date(),
        },
      ],
    });

    if (facultyInCharge) {
      await Notification.create({
        recipient: facultyInCharge,
        sender: req.user._id,
        title: 'Assigned as Faculty-in-Charge 🏛️',
        message: `You have been assigned as the Faculty-in-Charge for the club "${club.name}".`,
        type: 'club',
        link: `/clubs/${club._id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: clubStatus === 'active' ? 'Club created successfully' : 'Club application submitted for approval',
      club,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update club details
// @route   PUT /api/clubs/:id
// @access  Private (Lead or Admin)
exports.updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const isLead = club.lead.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isLead && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this club' });
    }

    const allowedFields = ['name', 'category', 'description', 'mission', 'logo', 'bannerImage', 'meetingSchedule', 'venueOrRoom', 'socialLinks', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        club[field] = req.body[field];
      }
    });

    await club.save();
    res.status(200).json({ success: true, message: 'Club updated successfully', club });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private (Lead or Admin)
exports.deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const isLead = club.lead.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isLead && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this club' });
    }

    // Remove club from all members' joinedClubs
    await User.updateMany({ joinedClubs: club._id }, { $pull: { joinedClubs: club._id } });

    await Club.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Club deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request to join club
// @route   POST /api/clubs/:id/join
// @access  Private
exports.requestToJoinClub = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can join clubs. Faculty and HOD members serve in coordinating and advisory capacities.',
      });
    }

    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Check if already a member
    const isMember = club.members.some((m) => m.user.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this club' });
    }

    // Check if pending request exists
    const hasPending = club.joinRequests.some(
      (r) => r.user.toString() === req.user._id.toString() && r.status === 'pending'
    );
    if (hasPending) {
      return res.status(400).json({ success: false, message: 'Join request already submitted and pending review' });
    }

    club.joinRequests.push({
      user: req.user._id,
      message: req.body.message || 'I would love to participate and contribute to this club!',
      status: 'pending',
      requestedAt: new Date(),
    });

    await club.save();

    // Notify club lead and faculty in charge
    const recipients = [club.lead, club.facultyInCharge].filter(Boolean);
    for (const recipientId of recipients) {
      await Notification.create({
        recipient: recipientId,
        sender: req.user._id,
        title: 'New Club Join Request',
        message: `${req.user.name} has requested to join ${club.name}`,
        type: 'club',
        link: `/clubs/${club._id}`,
      });
    }

    res.status(200).json({ success: true, message: 'Join request submitted to club leadership' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Handle join request (Approve or Reject)
// @route   PUT /api/clubs/:id/requests/:requestId
// @access  Private (Faculty-in-Charge, Lead, or Admin/HOD)
exports.handleJoinRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const isLead = club.lead && club.lead.toString() === req.user._id.toString();
    const isFacultyInCharge = club.facultyInCharge && club.facultyInCharge.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isHod = req.user.role === 'hod';
    if (!isLead && !isAdmin && !isFacultyInCharge && !isHod) {
      return res.status(403).json({
        success: false,
        message: 'Only the Faculty-in-Charge, club lead, or department administration can review join requests',
      });
    }

    const request = club.joinRequests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Join request not found' });
    }

    if (action === 'approve') {
      request.status = 'approved';
      club.members.push({
        user: request.user,
        role: 'member',
        joinedAt: new Date(),
      });

      // Update user document
      await User.findByIdAndUpdate(request.user, {
        $addToSet: { joinedClubs: club._id },
      });

      // Send notification to student
      await Notification.create({
        recipient: request.user,
        sender: req.user._id,
        title: 'Club Membership Approved! 🎉',
        message: `Congratulations! Your request to join ${club.name} has been approved.`,
        type: 'club',
        link: `/clubs/${club._id}`,
      });
    } else {
      request.status = 'rejected';
      await Notification.create({
        recipient: request.user,
        sender: req.user._id,
        title: 'Club Join Request Update',
        message: `Your request to join ${club.name} was not approved at this time.`,
        type: 'club',
        link: `/clubs/${club._id}`,
      });
    }

    await club.save();
    res.status(200).json({ success: true, message: `Request has been ${action}d`, club });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Leave club
// @route   POST /api/clubs/:id/leave
// @access  Private
exports.leaveClub = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can leave clubs.' });
    }

    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (club.lead.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Club lead cannot leave. Transfer leadership first.' });
    }

    club.members = club.members.filter((m) => m.user.toString() !== req.user._id.toString());
    await club.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedClubs: club._id },
    });

    res.status(200).json({ success: true, message: `You have left ${club.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member (Lead/Admin)
// @route   DELETE /api/clubs/:id/members/:memberId
// @access  Private (Lead or Admin)
exports.removeMember = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const isLead = club.lead.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isLead && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to remove members' });
    }

    const memberUserId = req.params.memberId;
    if (club.lead.toString() === memberUserId) {
      return res.status(400).json({ success: false, message: 'Cannot remove club lead' });
    }

    club.members = club.members.filter((m) => m.user.toString() !== memberUserId);
    await club.save();

    await User.findByIdAndUpdate(memberUserId, {
      $pull: { joinedClubs: club._id },
    });

    res.status(200).json({ success: true, message: 'Member removed from club' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
