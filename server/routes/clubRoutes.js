import express from "express";

import {
    createClub,
    getAllClubs,
    getClubById,
    updateClub,
    deleteClub,
    joinClub,
    getMyClubs,
    leaveClub
} from "../controllers/clubController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getAllClubs
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("student"),
    getMyClubs
);

router.get(
    "/:id",
    authMiddleware,
    getClubById
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    createClub
);

router.post(
    "/join",
    authMiddleware,
    roleMiddleware("student"),
    joinClub
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    updateClub
);

router.put(
    "/:id/leave",
    authMiddleware,
    roleMiddleware("student"),
    leaveClub
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    deleteClub
);

export default router;

