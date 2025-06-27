import { verifyToken } from "../middleware/authMiddleware";
import { createProfile, deleteAccount, getAllProfiles, getProfileById, updateProfile } from "../controllers/user.controller";
import express from "express";
import uploadMiddleware from "../middleware/uploadmiddleware";

const router = express.Router();

router.get("/getAllProfiles", getAllProfiles);
router.get("/getProfileById", verifyToken, getProfileById);
router.post("/createProfile", createProfile);
router.put("/updateProfile", uploadMiddleware.single("avatar"), verifyToken, updateProfile);
router.delete("/deleteAccount", verifyToken, deleteAccount);

export default router;