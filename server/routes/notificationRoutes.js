import express from "express";

import {
    createNotification,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getMyNotifications
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    createNotification
);

router.put(
    "/:id/read",
    authMiddleware,
    markAsRead
);

router.put(
    "/read-all",
    authMiddleware,
    markAllAsRead
);

router.delete(
    "/:id",
    authMiddleware,
    deleteNotification
);

export default router;
