import upload from '../middleware/uploadMiddleware';
import { verifyToken } from '../middleware/authMiddleware';
import { createCar, createCarReview, deleteCar, getAllCars, getCarById, updateCar } from '../controllers/car.controller';
import express from 'express';

const router = express.Router();

router.get("/getCars", getAllCars);
router.get("/getCar/:id", getCarById);
router.post(
  "/createCar",
  verifyToken,
  upload.fields([
    { name: "image_url", maxCount: 1 },
    { name: "thumbnail_urls", maxCount: 5 },
  ]),
  createCar
);
router.post("/createCarReview/:id", verifyToken, createCarReview);
router.put(
  "/updateCar/:id",
  verifyToken,
  upload.fields([
    { name: "image_url", maxCount: 1 },
    { name: "thumbnail_urls", maxCount: 5 },
  ]),
  updateCar
);
router.delete("/deleteCar/:id", verifyToken, deleteCar);

export default router;