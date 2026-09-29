import express from "express";

import {
    getDepartmentStudents,
    getDepartmentFaculty,
    getDepartmentAttendance,
    getDepartmentStats
} from "../controllers/hodController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/students",
    authMiddleware,
    roleMiddleware("hod"),
    getDepartmentStudents
);

router.get(
    "/faculty",
    authMiddleware,
    roleMiddleware("hod"),
    getDepartmentFaculty
);

router.get(
    "/attendance",
    authMiddleware,
    roleMiddleware("hod"),
    getDepartmentAttendance
);

router.get(
    "/stats",
    authMiddleware,
    roleMiddleware("hod"),
    getDepartmentStats
);

export default router;
