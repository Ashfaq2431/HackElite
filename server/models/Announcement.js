import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        targetAudience: {
            type: String,
            enum: ["all", "student", "faculty", "hod"],
            default: "all"
        },

        priority: {
            type: String,
            enum: ["low", "normal", "high"],
            default: "normal"
        },

        attachment: {
            type: String,
            default: ""
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Announcement = mongoose.model(
    "Announcement",
    announcementSchema
);

export default Announcement;