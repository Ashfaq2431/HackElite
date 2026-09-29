const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  getUserById,
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser,
  getDepartmentStudents,
  getDepartmentFaculty,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Department endpoints for HOD & Faculty
router.get('/department/students', protect, authorize('hod', 'faculty', 'admin'), getDepartmentStudents);
router.get('/department/faculty', protect, authorize('hod', 'admin'), getDepartmentFaculty);

// Admin-level user management
router.get('/users', protect, authorize('admin'), getAllUsers);
router.post('/users', protect, authorize('admin'), createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
