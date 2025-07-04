import upload from '../middleware/uploadMiddleware';
import { createCar, getAllCars } from '../controllers/car.controller';
import express from 'express';

const router = express.Router();

router.get("/getCars", getAllCars);
router.post(
  "/createCar",
  upload.fields([
    { name: "image_url", maxCount: 1 },
    { name: "thumbnail_urls", maxCount: 5 },
  ]),
  createCar
);

export default router;