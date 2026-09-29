import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { getAllUsers } from "../controllers/adminController.js";

const router = express.Router();

router.get(
    "/users",
    authMiddleware,
    roleMiddleware("admin"),
    getAllUsers
);

export default router;