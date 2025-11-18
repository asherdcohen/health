import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createTrainingPlan,
  getActiveTrainingPlan,
  getWeeklyWorkouts,
} from '../controllers/training.controller';

const router = express.Router();

router.use(authenticate);

router.post('/plan', createTrainingPlan);
router.get('/plan/active', getActiveTrainingPlan);
router.get('/plan/week/:week', getWeeklyWorkouts);

export default router;
