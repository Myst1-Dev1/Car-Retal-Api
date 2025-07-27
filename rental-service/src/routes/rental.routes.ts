import { verifyToken } from '../middleware/authMiddleware';
import { cancelRental, checkAvailability, createRental, getAllRentals, getRentalById, returnRental } from '../controllers/rental.controller';
import express from 'express';

const router = express.Router();

router.get("/getAllRentals", verifyToken, getAllRentals);
router.get("/getRental/:id", verifyToken, getRentalById);
router.get("/checkRentalAvailability", verifyToken, checkAvailability);
router.post("/createRental", verifyToken, createRental);
router.post("/:id/return", verifyToken, returnRental);
router.post("/:id/cancel", verifyToken, cancelRental);

export default router;