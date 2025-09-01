import upload from '../middleware/uploadMiddleware';
import { addCommentToPost, createPost, deletePost, getPost, getPostById, updatePost } from "../controllers/blog.controller";
import express from "express";
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get("/getPosts", getPost);
router.get("/getPost/:id", getPostById);
router.post("/createPost", upload.single("post_image_url"), verifyToken, createPost);
router.post("/createComment/:id", verifyToken ,addCommentToPost);
router.put("/updatePost/:id", upload.single("post_image_url"), verifyToken, updatePost);
router.delete("/deletePost/:id", verifyToken, deletePost);

export default router;