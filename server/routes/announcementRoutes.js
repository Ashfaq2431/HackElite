import express from "express";

import {
    createAnnouncement,
    getAllAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement
} from "../controllers/announcementController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// All logged-in users can view announcements
router.get(
    "/",
    authMiddleware,
    getAllAnnouncements
);

// All logged-in users can view a single announcement
router.get(
    "/:id",
    authMiddleware,
    getAnnouncementById
);

// Faculty, HOD and Admin can create announcements
router.post(
    "/",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    createAnnouncement
);

// Faculty, HOD and Admin can update announcements
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    updateAnnouncement
);

// Faculty, HOD and Admin can delete announcements
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    deleteAnnouncement
);

export default router;