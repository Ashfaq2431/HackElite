import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: [
                "announcement",
                "event",
                "registration",
                "club",
                "discussion",
                "attendance",
                "general"
            ],
            default: "general"
        },

        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);

export default Notification;

