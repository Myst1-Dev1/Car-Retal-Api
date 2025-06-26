import { verifyToken } from "../middleware/authMiddleware";
import { createProfile, updateProfile } from "../controllers/user.controller";
import express from "express";

const router = express.Router();

router.post("/createProfile", createProfile);
router.put("/updateProfile", verifyToken, updateProfile);

export default router;