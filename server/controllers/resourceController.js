const Resource = require('../models/Resource');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
exports.getAllResources = async (req, res) => {
  try {
    const { category, department, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name role avatar department')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: resources.length, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload / create new resource
// @route   POST /api/resources
// @access  Private
exports.createResource = async (req, res) => {
  try {
    const { title, description, category, department, fileUrl, fileName, fileSize, fileType } = req.body;

    const resource = await Resource.create({
      title,
      description,
      category: category || 'Study Materials',
      department: department || 'General',
      fileUrl,
      fileName: fileName || 'file.pdf',
      fileSize: fileSize || '1.0 MB',
      fileType: fileType || 'pdf',
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Resource shared successfully', resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment download count
// @route   POST /api/resources/:id/download
// @access  Public
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    resource.downloads += 1;
    await resource.save();

    res.status(200).json({ success: true, downloads: resource.downloads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const isUploader = resource.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isUploader && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this file' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Resource removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
