import Announcement from "../models/Announcement.js";

export const createAnnouncement = async (req, res) => {
    try {
        const {
            title,
            content,
            category,
            targetAudience,
            priority,
            attachment
        } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({
                message: "Title, content and category are required"
            });
        }

        const announcement = await Announcement.create({
            title,
            content,
            category,
            author: req.user.id,
            targetAudience: targetAudience || "all",
            priority: priority || "normal",
            attachment: attachment || ""
        });

        res.status(201).json({
            message: "Announcement created successfully",
            announcement
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create announcement",
            error: error.message
        });
    }
};

export const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({
            isActive: true
        })
            .populate("author", "name email role")
            .sort({ createdAt: -1 });

        res.json({
            announcements
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch announcements",
            error: error.message
        });
    }
};

export const getAnnouncementById = async (req, res) => {
    try {
        const announcement = await Announcement.findOne({
            _id: req.params.id,
            isActive: true
        }).populate("author", "name email role");

        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        res.json({
            announcement
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch announcement",
            error: error.message
        });
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        res.json({
            message: "Announcement updated successfully",
            announcement
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update announcement",
            error: error.message
        });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            {
                isActive: false
            },
            {
                new: true
            }
        );

        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        res.json({
            message: "Announcement deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete announcement",
            error: error.message
        });
    }
};