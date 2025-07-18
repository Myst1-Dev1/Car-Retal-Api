import { getRental } from '../controllers/rental.controller';
import express from 'express';

const router = express.Router();

router.get("/getRental", getRental);

export default router;