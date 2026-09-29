import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
    getStudentProfile,
    updateStudentProfile
} from "../controllers/studentController.js";

const router = express.Router();

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("student"),
    getStudentProfile
);

router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("student"),
    updateStudentProfile
);

export default router;