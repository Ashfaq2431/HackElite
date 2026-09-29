const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'hod', 'admin'],
      default: 'student',
    },
    studentId: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
    },
    year: {
      type: String,
      default: '3rd Year',
    },
    bio: {
      type: String,
      default: 'Passionate student eager to learn, build and collaborate on campus!',
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: ['JavaScript', 'Python', 'Problem Solving'],
    },
    interests: {
      type: [String],
      default: ['Web Development', 'Robotics', 'Competitive Coding'],
    },
    achievements: [
      {
        title: { type: String, required: true },
        date: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    joinedClubs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
