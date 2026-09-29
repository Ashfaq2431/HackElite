import express from "express";

import {
    markAttendance,
    getStudentAttendance,
    getMyAttendance,
    updateAttendance
} from "../controllers/facultyController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/attendance",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    markAttendance
);

router.get(
    "/attendance/my",
    authMiddleware,
    roleMiddleware("student"),
    getMyAttendance
);

router.get(
    "/attendance/:studentId",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    getStudentAttendance
);

router.put(
    "/attendance/:id",
    authMiddleware,
    roleMiddleware("faculty", "hod", "admin"),
    updateAttendance
);

export default router;