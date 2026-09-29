import Discussion from "../models/Discussion.js";
import DiscussionComment from "../models/DiscussionComment.js";

export const createDiscussion = async (req, res) => {
    try {
        const { title, content, category } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({
                message: "Title, content and category are required"
            });
        }

        const discussion = await Discussion.create({
            title,
            content,
            category,
            author: req.user.id
        });

        const populatedDiscussion = await Discussion.findById(
            discussion._id
        ).populate(
            "author",
            "name email role"
        );

        res.status(201).json({
            message: "Discussion created successfully",
            discussion: populatedDiscussion
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create discussion",
            error: error.message
        });
    }
};


export const getAllDiscussions = async (req, res) => {
    try {
        const discussions = await Discussion.find({
            isActive: true
        })
            .populate(
                "author",
                "name email role"
            )
            .sort({
                createdAt: -1
            });

        res.json({
            discussions
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch discussions",
            error: error.message
        });
    }
};


export const getDiscussionById = async (req, res) => {
    try {
        const discussion = await Discussion.findOne({
            _id: req.params.id,
            isActive: true
        }).populate(
            "author",
            "name email role"
        );

        if (!discussion) {
            return res.status(404).json({
                message: "Discussion not found"
            });
        }

        const comments = await DiscussionComment.find({
            discussion: discussion._id,
            isActive: true
        })
            .populate(
                "author",
                "name email role"
            )
            .sort({
                createdAt: 1
            });

        res.json({
            discussion,
            comments
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch discussion",
            error: error.message
        });
    }
};


export const addComment = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                message: "Comment content is required"
            });
        }

        const discussion = await Discussion.findOne({
            _id: req.params.id,
            isActive: true
        });

        if (!discussion) {
            return res.status(404).json({
                message: "Discussion not found"
            });
        }

        const comment = await DiscussionComment.create({
            discussion: discussion._id,
            author: req.user.id,
            content
        });

        const populatedComment = await DiscussionComment.findById(
            comment._id
        ).populate(
            "author",
            "name email role"
        );

        res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to add comment",
            error: error.message
        });
    }
};


export const deleteDiscussion = async (req, res) => {
    try {
        const discussion = await Discussion.findById(
            req.params.id
        );

        if (!discussion) {
            return res.status(404).json({
                message: "Discussion not found"
            });
        }

        if (discussion.author.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                message: "You can delete only your own discussion"
            });
        }

        discussion.isActive = false;

        await discussion.save();

        res.json({
            message: "Discussion deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete discussion",
            error: error.message
        });
    }
};


export const deleteComment = async (req, res) => {
    try {
        const comment = await DiscussionComment.findById(
            req.params.id
        );

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        if (comment.author.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                message: "You can delete only your own comment"
            });
        }

        comment.isActive = false;

        await comment.save();

        res.json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete comment",
            error: error.message
        });
    }
};
