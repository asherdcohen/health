import express from 'express';
import { authenticate } from '../middleware/auth';
import { adjustWeeklyPlan, getAdjustmentHistory } from '../controllers/ai.controller';

const router = express.Router();

router.use(authenticate);

router.post('/adjust', adjustWeeklyPlan);
router.get('/history', getAdjustmentHistory);

export default router;
