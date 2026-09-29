import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        facultyCoordinator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        meetingSchedule: {
            type: String,
            default: ""
        },

        venue: {
            type: String,
            default: ""
        },

        image: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

const Club = mongoose.model("Club", clubSchema);

export default Club;