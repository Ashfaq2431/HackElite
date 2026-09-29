const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Workshop', 'Hackathon & Contest', 'Seminar & Talk', 'Cultural & Arts', 'Sports & Fitness', 'Webinar', 'Other'],
      default: 'Workshop',
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      default: '10:00 AM',
    },
    endTime: {
      type: String,
      default: '12:00 PM',
    },
    venue: {
      type: String,
      default: 'Campus Auditorium A',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
      default: '',
    },
    capacity: {
      type: Number,
      default: 100, // 0 means unlimited
    },
    bannerImage: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: ['Campus', 'Community'],
    },
    registeredUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        ticketId: {
          type: String,
          default: () => 'CC-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['registered', 'attended', 'cancelled'],
          default: 'registered',
        },
      },
    ],
    speakers: [
      {
        name: { type: String, default: '' },
        designation: { type: String, default: '' },
        photo: { type: String, default: '' },
      },
    ],
    department: {
      type: String,
      default: 'All Departments',
    },
    approvalStatus: {
      type: String,
      enum: ['approved', 'pending_approval', 'rejected'],
      default: 'approved',
    },
    allowedAudience: {
      type: String,
      enum: ['all', 'club_members_only'],
      default: 'all',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
