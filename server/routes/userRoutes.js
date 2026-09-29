import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMyProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);

export default router;


