const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: false,
    },
    category: {
      type: String,
      enum: ['Academic', 'Event', 'Urgent Notice', 'Placement & Career', 'Sports', 'General'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    targetAudience: {
      type: String,
      enum: ['All', 'Students', 'Faculty', 'Specific Department', 'Club Members Only'],
      default: 'All',
    },
    department: {
      type: String,
      default: 'All Departments',
    },
    attachments: [
      {
        title: { type: String, default: 'Document' },
        url: { type: String, required: true },
        fileType: { type: String, default: 'pdf' },
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
