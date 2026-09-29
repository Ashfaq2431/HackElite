import express from "express";

import {
    createDiscussion,
    getAllDiscussions,
    getDiscussionById,
    addComment,
    deleteDiscussion,
    deleteComment
} from "../controllers/discussionController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getAllDiscussions
);

router.get(
    "/:id",
    authMiddleware,
    getDiscussionById
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("student", "faculty", "hod"),
    createDiscussion
);

router.post(
    "/:id/comments",
    authMiddleware,
    roleMiddleware("student", "faculty", "hod"),
    addComment
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("student", "faculty", "hod"),
    deleteDiscussion
);

router.delete(
    "/comments/:id",
    authMiddleware,
    roleMiddleware("student", "faculty", "hod"),
    deleteComment
);

export default router;