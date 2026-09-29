import mongoose from "mongoose";

const clubMemberSchema = new mongoose.Schema(
    {
        club: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Club",
            required: true
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        joinedAt: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: ["active", "left"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

clubMemberSchema.index(
    { club: 1, student: 1 },
    { unique: true }
);

const ClubMember = mongoose.model(
    "ClubMember",
    clubMemberSchema
);

export default ClubMember;