const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isAcceptedAnswer: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Discussion title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Discussion content is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['General Campus', 'Academics & Courses', 'Tech & Coding', 'Placements & Career', 'Clubs & Events', 'Lost & Found'],
      default: 'General Campus',
    },
    tags: {
      type: [String],
      default: ['Community'],
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: [replySchema],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isClosed: {
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

module.exports = mongoose.model('Discussion', discussionSchema);
