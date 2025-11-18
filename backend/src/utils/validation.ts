import { z } from 'zod';

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Training plan schema
export const createTrainingPlanSchema = z.object({
  goal: z.enum(['HALF_MARATHON', 'MARATHON', 'HALF_IRONMAN', 'IRONMAN']),
  startDate: z.string().datetime(),
  raceDate: z.string().datetime(),
});

// Workout log schema
export const logWorkoutSchema = z.object({
  plannedWorkoutId: z.string().uuid().optional(),
  completedDate: z.string().datetime(),
  sportType: z.enum(['RUN', 'BIKE', 'SWIM', 'STRENGTH', 'REST']),
  workoutType: z.string(),
  actualDuration: z.number().int().positive(),
  actualDistance: z.number().positive().optional(),
  actualPace: z.string().optional(),
  avgHeartRate: z.number().int().positive().optional(),
  maxHeartRate: z.number().int().positive().optional(),
  calories: z.number().int().positive().optional(),
  elevationGain: z.number().optional(),
  rpe: z.number().int().min(1).max(10).optional(),
  feeling: z.enum(['great', 'good', 'okay', 'tired', 'terrible']).optional(),
  weatherConditions: z.string().optional(),
  notes: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTrainingPlanInput = z.infer<typeof createTrainingPlanSchema>;
export type LogWorkoutInput = z.infer<typeof logWorkoutSchema>;
