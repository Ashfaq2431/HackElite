const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'campusconnect_jwt_super_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, studentId, year } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Role check: Only allow 'student', 'faculty', 'club_admin' on self-registration. Admin role is restricted.
    let assignedRole = role || 'student';
    if (assignedRole === 'admin') {
      assignedRole = 'student';
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || 'Computer Science & Engineering',
      studentId: studentId || '',
      year: year || '1st Year',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        avatar: user.avatar,
        skills: user.skills,
        interests: user.interests,
        joinedClubs: user.joinedClubs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password').populate('joinedClubs', 'name category logo');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated by administrator' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        studentId: user.studentId,
        bio: user.bio,
        avatar: user.avatar,
        phone: user.phone,
        skills: user.skills,
        interests: user.interests,
        achievements: user.achievements,
        socialLinks: user.socialLinks,
        joinedClubs: user.joinedClubs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('joinedClubs', 'name category logo description');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      department,
      year,
      bio,
      avatar,
      phone,
      skills,
      interests,
      achievements,
      socialLinks,
      studentId,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (year) user.year = year;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone;
    if (studentId !== undefined) user.studentId = studentId;
    if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    if (interests) user.interests = Array.isArray(interests) ? interests : interests.split(',').map((i) => i.trim());
    if (achievements) user.achievements = achievements;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public community profile
// @route   GET /api/auth/users/:id
// @access  Public / Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('joinedClubs', 'name category logo description');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private / Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, department, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role or status (Admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private / Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role, isActive, name, email, department, year, studentId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (year !== undefined) user.year = year;
    if (studentId !== undefined) user.studentId = studentId;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private / Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin create new user
// @route   POST /api/auth/users
// @access  Private / Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, studentId, year, bio } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Campus@123',
      role: role || 'student',
      department: department || 'Computer Science & Engineering',
      studentId: studentId || '',
      year: year || '1st Year',
      bio: bio || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    res.status(201).json({
      success: true,
      message: `User created with role ${user.role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        studentId: user.studentId,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get department students (for HOD and Faculty)
// @route   GET /api/auth/department/students
// @access  Private (HOD, Faculty, Admin)
exports.getDepartmentStudents = async (req, res) => {
  try {
    const { search, year } = req.query;
    let query = { role: 'student', isActive: true };

    if (req.user.role === 'hod' || req.user.role === 'faculty') {
      // Strictly restrict to their department
      query.department = req.user.department;
    } else if (req.user.role === 'admin' && req.query.department) {
      query.department = req.query.department;
    }

    if (year && year !== 'All') {
      query.year = year;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(query)
      .select('-password')
      .populate('joinedClubs', 'name category logo')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      department: req.user.role === 'admin' ? (req.query.department || 'All') : req.user.department,
      students,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get department faculty (for HOD and Admin)
// @route   GET /api/auth/department/faculty
// @access  Private (HOD, Admin)
exports.getDepartmentFaculty = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'faculty', isActive: true };

    if (req.user.role === 'hod') {
      // Strictly restrict to HOD's department
      query.department = req.user.department;
    } else if (req.user.role === 'admin' && req.query.department) {
      query.department = req.query.department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const faculty = await User.find(query).select('-password').sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: faculty.length,
      department: req.user.role === 'admin' ? (req.query.department || 'All') : req.user.department,
      faculty,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
