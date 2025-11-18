import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  logWorkout,
  getWorkoutLogs,
  updateWorkoutLog,
  deleteWorkoutLog,
} from '../controllers/workout.controller';

const router = express.Router();

router.use(authenticate);

router.post('/log', logWorkout);
router.get('/logs', getWorkoutLogs);
router.put('/log/:id', updateWorkoutLog);
router.delete('/log/:id', deleteWorkoutLog);

export default router;
