import mongoose from "mongoose";

const discussionCommentSchema = new mongoose.Schema(
    {
        discussion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Discussion",
            required: true
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true
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

const DiscussionComment = mongoose.model(
    "DiscussionComment",
    discussionCommentSchema
);

export default DiscussionComment;