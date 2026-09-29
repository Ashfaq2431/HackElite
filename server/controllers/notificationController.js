import Notification from "../models/Notification.js";

export const createNotification = async (req, res) => {
    try {
        const {
            recipient,
            title,
            message,
            type,
            relatedId
        } = req.body;

        if (!recipient || !title || !message) {
            return res.status(400).json({
                message: "Recipient, title and message are required"
            });
        }

        const notification = await Notification.create({
            recipient,
            title,
            message,
            type: type || "general",
            relatedId: relatedId || null
        });

        res.status(201).json({
            message: "Notification created successfully",
            notification
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create notification",
            error: error.message
        });
    }
};


export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user.id
        })
            .sort({ createdAt: -1 });

        res.json({
            notifications
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch notifications",
            error: error.message
        });
    }
};


export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        notification.isRead = true;

        await notification.save();

        res.json({
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to mark notification as read",
            error: error.message
        });
    }
};


export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                recipient: req.user.id,
                isRead: false
            },
            {
                isRead: true
            }
        );

        res.json({
            message: "All notifications marked as read"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to mark notifications as read",
            error: error.message
        });
    }
};


export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json({
            message: "Notification deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete notification",
            error: error.message
        });
    }
};
