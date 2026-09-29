import express from "express";

import {
    registerForEvent,
    getMyRegistrations,
    cancelRegistration
} from "../controllers/registrationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    registerForEvent
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("student"),
    getMyRegistrations
);

router.put(
    "/:id/cancel",
    authMiddleware,
    roleMiddleware("student"),
    cancelRegistration
);

export default router;
