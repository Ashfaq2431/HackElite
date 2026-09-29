import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["student", "faculty", "hod", "admin"],
            default: "student"
        },

        studentId: {
            type: String,
            trim: true
        },

        department: {
            type: String,
            trim: true
        },

        year: {
            type: String,
            trim: true
        },

        phone: {
            type: String,
            trim: true
        },

        bio: {
            type: String,
            trim: true
        },

        profileImage: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;