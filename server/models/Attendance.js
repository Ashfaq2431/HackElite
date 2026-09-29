import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["present", "absent"],
            required: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

attendanceSchema.index(
    {
        student: 1,
        date: 1,
        subject: 1
    },
    {
        unique: true
    }
);

const Attendance = mongoose.model(
    "Attendance",
    attendanceSchema
);

export default Attendance;
