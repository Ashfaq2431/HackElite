import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        time: {
            type: String,
            required: true
        },

        venue: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        organizer: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            default: ""
        },

        registrationDeadline: {
            type: Date
        },

        maxParticipants: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["upcoming", "ongoing", "completed", "cancelled"],
            default: "upcoming"
        }
    },
    {
        timestamps: true
    }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;