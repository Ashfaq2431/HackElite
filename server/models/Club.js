const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Technology', 'Cultural', 'Sports', 'Academic', 'Arts & Media', 'Social Welfare', 'Entrepreneurship'],
      default: 'Technology',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    mission: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    facultyInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    officers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['member', 'officer', 'lead'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    joinRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        message: {
          type: String,
          default: '',
        },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    meetingSchedule: {
      type: String,
      default: 'Every Wednesday at 5:00 PM',
    },
    venueOrRoom: {
      type: String,
      default: 'Student Center - Room 302',
    },
    status: {
      type: String,
      enum: ['active', 'pending_approval', 'inactive'],
      default: 'active',
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      website: { type: String, default: '' },
      discord: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Club', clubSchema);
