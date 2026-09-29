const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Study Materials', 'Club Handbooks', 'Campus Maps & Guides', 'Placement Papers', 'Event Posters', 'Forms & Circulars'],
      default: 'Study Materials',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      default: 'document.pdf',
    },
    fileSize: {
      type: String,
      default: '1.2 MB',
    },
    fileType: {
      type: String,
      default: 'pdf',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: String,
      default: 'General',
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
