import express from "express";

import {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
} from "../controllers/eventController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Anyone who is logged in can view events
router.get("/", authMiddleware, getAllEvents);

router.get("/:id", authMiddleware, getEventById);

// Only faculty, HOD and admin can create events
router.post(
    "/",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    createEvent
);

// Only faculty, HOD and admin can update events
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    updateEvent
);

// Only faculty, HOD and admin can delete events
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    deleteEvent
);

export default router;

