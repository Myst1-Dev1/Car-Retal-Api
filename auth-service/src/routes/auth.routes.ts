import express from "express";
import { getUsers, login, register } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getUsers", getUsers);

export default router;