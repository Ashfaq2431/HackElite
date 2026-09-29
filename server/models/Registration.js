import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["registered", "cancelled"],
            default: "registered"
        },

        registeredAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// A student can register for an event only once
registrationSchema.index(
    { event: 1, student: 1 },
    { unique: true }
);

const Registration = mongoose.model(
    "Registration",
    registrationSchema
);

export default Registration;

