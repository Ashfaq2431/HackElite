const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const Discussion = require('../models/Discussion');

// @desc    Get overall campus or department analytics
// @route   GET /api/analytics
// @access  Public / Private
exports.getCampusAnalytics = async (req, res) => {
  try {
    const { department } = req.query;

    // If department query is supplied (e.g. for HOD)
    if (department && department !== 'All') {
      const [
        deptStudents,
        deptFaculty,
        deptEvents,
        deptAnnouncements,
        allClubs,
        allDiscussions,
      ] = await Promise.all([
        User.countDocuments({ role: 'student', department, isActive: true }),
        User.countDocuments({ role: 'faculty', department, isActive: true }),
        Event.find({ $or: [{ department }, { department: 'All Departments' }] }).populate('registeredUsers.user', 'department').lean(),
        Announcement.countDocuments({ $or: [{ department }, { department: 'All Departments' }] }),
        Club.find({ status: 'active' }).populate('lead', 'name department').populate('members.user', 'department').lean(),
        Discussion.countDocuments(),
      ]);

      // Calculate registrations for department events
      let deptRegistrations = 0;
      deptEvents.forEach((ev) => {
        deptRegistrations += ev.registeredUsers ? ev.registeredUsers.length : 0;
      });

      // Filter clubs relevant to this department (lead from dept or members from dept)
      const deptClubs = allClubs.filter(
        (c) =>
          c.lead?.department === department ||
          (c.members && c.members.some((m) => m.user?.department === department))
      );

      return res.status(200).json({
        success: true,
        department,
        totalStudents: deptStudents,
        totalFaculty: deptFaculty,
        totalEvents: deptEvents.length,
        totalRegistrations: deptRegistrations,
        totalClubs: deptClubs.length,
        totalAnnouncements: deptAnnouncements,
        totalDiscussions: allDiscussions,
        stats: {
          totalStudents: deptStudents,
          totalFaculty: deptFaculty,
          totalEvents: deptEvents.length,
          totalRegistrations: deptRegistrations,
          totalClubs: deptClubs.length,
          totalAnnouncements: deptAnnouncements,
          totalDiscussions: allDiscussions,
        },
        topEvents: deptEvents.slice(0, 5).map((e) => ({
          _id: e._id,
          title: e.title,
          registrations: e.registeredUsers ? e.registeredUsers.length : 0,
        })),
        clubMembership: deptClubs.map((c) => ({
          _id: c._id,
          name: c.name,
          category: c.category,
          memberCount: c.members?.length || 0,
        })),
        deptEvents: deptEvents.slice(0, 5),
        deptClubs: deptClubs.map((c) => ({ id: c._id, name: c.name, category: c.category, memberCount: c.members?.length || 0 })),
      });
    }

    // Platform-wide analytics
    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      totalHods,
      totalClubs,
      totalEvents,
      totalAnnouncements,
      totalDiscussions,
      clubs,
      events,
      users,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'faculty', isActive: true }),
      User.countDocuments({ role: 'hod', isActive: true }),
      Club.countDocuments({ status: 'active' }),
      Event.countDocuments(),
      Announcement.countDocuments(),
      Discussion.countDocuments(),
      Club.find({ status: 'active' }).select('name category members').lean(),
      Event.find().select('title category date registeredUsers capacity status department').lean(),
      User.find({ role: 'student' }).select('department').lean(),
    ]);

    // Calculate total registrations across all events
    let totalRegistrations = 0;
    events.forEach((ev) => {
      totalRegistrations += ev.registeredUsers ? ev.registeredUsers.length : 0;
    });

    // Top clubs by member count
    const topClubs = clubs
      .map((c) => ({
        id: c._id,
        name: c.name,
        category: c.category,
        memberCount: c.members ? c.members.length : 0,
      }))
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, 6);

    // Top events by registrations
    const topEvents = events
      .map((e) => ({
        id: e._id,
        title: e.title,
        category: e.category,
        date: e.date,
        registrations: e.registeredUsers ? e.registeredUsers.length : 0,
        capacity: e.capacity,
      }))
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 6);

    // Department breakdown
    const deptMap = {};
    users.forEach((u) => {
      const dept = u.department || 'Other';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    const departmentDistribution = Object.keys(deptMap).map((key) => ({
      name: key,
      count: deptMap[key],
    }));

    // Category breakdown for events
    const eventCategoryMap = {};
    events.forEach((e) => {
      const cat = e.category || 'Other';
      eventCategoryMap[cat] = (eventCategoryMap[cat] || 0) + 1;
    });
    const eventCategoryDistribution = Object.keys(eventCategoryMap).map((key) => ({
      name: key,
      count: eventCategoryMap[key],
    }));

    res.status(200).json({
      success: true,
      totalUsers,
      totalStudents,
      totalFaculty,
      totalHods,
      totalClubs,
      totalEvents,
      totalRegistrations,
      totalAnnouncements,
      totalDiscussions,
      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalHods,
        totalClubs,
        totalEvents,
        totalRegistrations,
        totalAnnouncements,
        totalDiscussions,
      },
      topClubs,
      topEvents,
      clubMembership: clubs.map(c => ({
        _id: c._id,
        name: c.name,
        category: c.category,
        memberCount: c.members ? c.members.length : 0,
      })),
      departmentDistribution,
      eventCategoryDistribution,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
